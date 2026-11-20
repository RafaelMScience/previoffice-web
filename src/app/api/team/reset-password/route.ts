import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { generateRandomPassword } from '@/lib/auth/password-generator';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Rate Limit: 15 password resets per 15 min per IP
  const rateLimit = checkRateLimit(ip, 'team-reset-password', 15, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Limite de solicitações excedido. Tente novamente mais tarde.' },
      { status: 429 }
    );
  }

  try {
    const adminClient = createAdminClient();

    // 2. Caller Authentication: verify session via cookies or Bearer token
    let callerUser: any = null;
    try {
      const serverClient = await createClientServer();
      const { data } = await serverClient.auth.getUser();
      callerUser = data?.user || null;
    } catch {
      // Ignored if called without cookie context
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
        { error: 'Não autenticado. Faça login para redefinir credenciais.' },
        { status: 401 }
      );
    }

    // 3. Caller Authorization: verify MANAGING_LAWYER
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('tenant_id, role')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== 'MANAGING_LAWYER') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas o advogado administrador pode gerar nova senha provisória.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'Identificador do colaborador não fornecido.' },
        { status: 400 }
      );
    }

    // 4. Verify target member belongs to the caller's tenant
    const { data: targetProfile } = await adminClient
      .from('profiles')
      .select('id, full_name, email, tenant_id')
      .eq('id', memberId)
      .maybeSingle();

    if (!targetProfile || targetProfile.tenant_id !== callerProfile.tenant_id) {
      return NextResponse.json(
        { error: 'Colaborador não encontrado neste escritório.' },
        { status: 404 }
      );
    }

    // 5. Generate secure temporary password and update in Supabase Auth
    const temporaryPassword = generateRandomPassword();

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      memberId,
      {
        password: temporaryPassword,
        user_metadata: {
          must_change_password: true,
        },
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: `Falha ao redefinir credencial: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Nova senha provisória gerada com sucesso.',
      temporaryPassword,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro interno ao redefinir senha do colaborador.' },
      { status: 500 }
    );
  }
}
