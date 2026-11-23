import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { decryptData } from '@/lib/security/encryption';
import { checkRateLimit } from '@/lib/security/admin-guard';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: clientId } = await params;

    if (!clientId) {
      return NextResponse.json({ error: 'ID do cliente é obrigatório.' }, { status: 400 });
    }

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    // Rate limit: 30 password reveal requests per 10 minutes per IP
    const rateLimit = checkRateLimit(ip, 'reveal-inss-password', 30, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de revelação de senha. Aguarde alguns minutos.' },
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
        { error: 'Não autenticado para visualizar dados sensíveis.' },
        { status: 401 }
      );
    }

    // 2. Caller profile & tenant validation
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('tenant_id, full_name, role')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile || !callerProfile.tenant_id) {
      return NextResponse.json(
        { error: 'Acesso negado. Perfil não vinculado a um escritório ativo.' },
        { status: 403 }
      );
    }

    // 3. Strict Multi-Tenant isolation & Active Record: find client scoped to caller's tenant
    const { data: client, error: clientError } = await adminClient
      .from('clients')
      .select('id, tenant_id, full_name, cpf, encrypted_inss_password')
      .eq('id', clientId)
      .eq('tenant_id', callerProfile.tenant_id)
      .is('deleted_at', null)
      .maybeSingle();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado ou não pertence ao seu escritório.' },
        { status: 404 }
      );
    }

    // 4. Decrypt password if available
    let password = '';
    if (client.encrypted_inss_password) {
      password = decryptData(client.encrypted_inss_password);
    }

    // 5. Permanent Forensic Audit Trail (VULN-06) with cryptographic SHA-256 seal
    const nowIso = new Date().toISOString();
    const payload = `${callerProfile.tenant_id}:${callerUser.id}:VIEW_INSS_PASSWORD:Cliente ${client.id}:${nowIso}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    const userAgent = request.headers.get('user-agent') || 'Browser';

    // Fail-closed enforcement: audit log persistence MUST succeed before password disclosure
    const { error: auditError } = await adminClient.from('audit_logs').insert({
      tenant_id: callerProfile.tenant_id,
      actor_id: callerUser.id,
      actor_name: callerProfile.full_name || 'Advogado Titular',
      actor_role:
        callerProfile.role === 'MANAGING_LAWYER'
          ? 'Advogado Sócio Titular'
          : callerProfile.role === 'ASSISTANT'
          ? 'Assistente / Recepção'
          : 'Advogado Associado',
      action: 'VIEW_INSS_PASSWORD',
      action_description: `Visualizou a senha do Meu INSS do cliente ${client.full_name} (${client.cpf || 'Sem CPF'})`,
      target_resource: `Cliente ${client.id} - Credenciais Meu INSS`,
      client_id: client.id,
      ip_address: ip,
      user_agent: userAgent,
      severity: 'WARNING',
      integrity_hash: hash,
      created_at: nowIso,
    });

    if (auditError) {
      console.error('Critical: Failed to persist mandatory audit log for INSS password access:', auditError);
      return NextResponse.json(
        { error: 'Falha ao registrar auditoria de segurança obrigatória. Acesso bloqueado.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      password,
    });
  } catch (error: any) {
    console.error('Error revealing INSS password:', error);
    return NextResponse.json(
      { error: 'Erro interno ao processar credenciais de segurança.' },
      { status: 500 }
    );
  }
}
