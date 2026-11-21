import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { mapMemberTypeToDbRole } from '@/lib/auth/team-utils';
import type { MemberType, TeamPermissions } from '@/types/settings';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateLimit = checkRateLimit(ip, 'team-update-member', 30, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Limite de requisições excedido. Tente novamente mais tarde.' },
      { status: 429 }
    );
  }

  try {
    const adminClient = createAdminClient();

    // Authenticate caller
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
        { error: 'Não autenticado. Faça login para gerenciar a equipe.' },
        { status: 401 }
      );
    }

    const callerRole = callerUser.app_metadata?.role as string | undefined;
    const isCallerAdmin = callerRole === 'MANAGING_LAWYER';
    if (!isCallerAdmin) {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas advogados sócios/administradores podem alterar membros da equipe.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      id,
      fullName,
      phone,
      oabNumber,
      memberType,
      isAdminLawyer,
      active,
      permissions,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID do membro é obrigatório.' }, { status: 400 });
    }

    // Determine mapped role
    const mappedRole = mapMemberTypeToDbRole(memberType as MemberType, Boolean(isAdminLawyer));

    // 1. Update public.profiles with Service Role bypass
    const { data: updatedProfile, error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone ? phone.trim() : null,
        oab_number: memberType === 'LAWYER' && oabNumber ? oabNumber.trim() : null,
        role: mappedRole,
        is_active: active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: `Erro ao atualizar perfil no banco: ${profileError.message}` },
        { status: 500 }
      );
    }

    // 2. Sync Supabase Auth user metadata & app_metadata
    try {
      await adminClient.auth.admin.updateUserById(id, {
        app_metadata: {
          role: mappedRole,
        },
        user_metadata: {
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : null,
          oab_number: memberType === 'LAWYER' && oabNumber ? oabNumber.trim() : null,
          member_type: memberType,
          permissions: isAdminLawyer
            ? {
                receptionDesk: true,
                clientsManage: true,
                casesManage: true,
                contractsAndFinancial: true,
                templatesManage: true,
                adminSettings: true,
                securityAudit: true,
              }
            : permissions,
        },
      });
    } catch (err: any) {
      console.warn('Could not sync user in auth.users:', err?.message);
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error('Update team member error:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao atualizar membro.' },
      { status: 500 }
    );
  }
}
