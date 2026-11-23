import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { generateIntegritySeal } from '@/lib/services/audit-service';

export async function POST(request: NextRequest) {
  try {
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

    // 2. Caller Authorization: verify MANAGING_LAWYER
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('tenant_id, full_name, role')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== 'MANAGING_LAWYER') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas advogados sócios podem revogar sessões remotas.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, targetName } = body;

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório.' }, { status: 400 });
    }

    // 3. Revoke active auth tokens globally in Supabase Auth
    try {
      await adminClient.auth.admin.signOut(userId, 'global');
    } catch (signOutErr) {
      console.warn('Notice signing out user globally:', signOutErr);
    }

    // 4. Record forensic audit log
    const nowIso = new Date().toISOString();
    const tenantId = callerProfile.tenant_id;
    const payload = `${tenantId}:${callerUser.id}:UPDATE_PERMISSIONS:Revogou sessão de ${userId}:${nowIso}`;
    const hash = generateIntegritySeal(payload);

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

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
