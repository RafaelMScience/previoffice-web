import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { generateIntegritySeal } from '@/lib/services/audit-service';
import { checkRateLimit } from '@/lib/security/admin-guard';

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // 0. Rate limiting: 20 revocation attempts per 15 min window per IP
    const rateLimit = checkRateLimit(ip, 'security-terminate-session', 20, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Limite de requisições excedido. Tente novamente mais tarde.' },
        { status: 429 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Authenticate caller
    let callerUser: any = null;
    try {
      const serverClient = await createClientServer();
      const { data } = await serverClient.auth.getUser();
      callerUser = data?.user || null;
    } catch {
      // Ignored
    }

    if (!callerUser) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const { data } = await adminClient.auth.getUser(token);
        callerUser = data?.user || null;
      }
    }

    if (!callerUser) {
      return NextResponse.json(
        { error: 'Não autenticado para revogar sessões.' },
        { status: 401 }
      );
    }

    // 2. Caller Authorization: verify MANAGING_LAWYER with active tenant
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('tenant_id, full_name, role')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== 'MANAGING_LAWYER' || !callerProfile.tenant_id) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas advogados sócios com escritório ativo podem revogar sessões remotas.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, targetName } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    // 2.1 Multi-Tenant Isolation Check: verify target user belongs to caller's tenant
    const { data: targetProfile, error: targetError } = await adminClient
      .from('profiles')
      .select('id, tenant_id, full_name')
      .eq('id', userId)
      .eq('tenant_id', callerProfile.tenant_id)
      .maybeSingle();

    if (targetError || !targetProfile) {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou não pertence ao seu escritório.' },
        { status: 404 }
      );
    }

    // 3. Revoke active auth tokens globally in Supabase Auth
    const nowIso = new Date().toISOString();

    // 3.1 Invoke DB RPC to delete active records from auth.sessions
    const { error: rpcError } = await (adminClient.rpc as any)('terminate_user_sessions', {
      target_user_id: userId,
    });
    if (rpcError) {
      console.warn('Notice terminating sessions via RPC (falling back to metadata invalidation):', rpcError.message);
    }

    // 3.2 Update user metadata with session invalidation timestamp
    try {
      await adminClient.auth.admin.updateUserById(userId, {
        user_metadata: {
          session_revoked_at: nowIso,
          sessions_revoked_by: callerUser.id,
        },
      });
    } catch (metaErr) {
      console.warn('Notice syncing user metadata session invalidation:', metaErr);
    }

    // 4. Record forensic audit log
    const tenantId = callerProfile.tenant_id;
    const payload = `${tenantId}:${callerUser.id}:UPDATE_PERMISSIONS:Revogou sessão de ${userId}:${nowIso}`;
    const hash = generateIntegritySeal(payload);

    await adminClient.from('audit_logs').insert({
      tenant_id: tenantId,
      actor_id: callerUser.id,
      actor_name: callerProfile.full_name || 'Advogado Titular',
      actor_role: 'Advogado Sócio Titular',
      action: 'UPDATE_PERMISSIONS',
      action_description: `Encerrou remotamente todas as sessões ativas do usuário: ${targetName || userId}`,
      target_resource: `Sessão Remota: ${userId}`,
      ip_address: ip,
      user_agent: request.headers.get('user-agent') || 'Unknown',
      severity: 'WARNING',
      integrity_hash: hash,
      created_at: nowIso,
    });

    return NextResponse.json({
      success: true,
      message: 'Sessão remota revogada com sucesso em nível global.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro ao revogar sessão remota.' },
      { status: 500 }
    );
  }
}
