import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import type { MemberType, TeamMember, TeamPermissions } from '@/types/settings';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Rate Limit Check (20 additions per 15 min per IP)
  const rateLimit = checkRateLimit(ip, 'team-create-member', 20, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Limite de requisições excedido. Tente novamente mais tarde.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      memberType = 'LAWYER',
      oabNumber,
      isAdminLawyer = false,
      active = true,
      permissions,
      temporaryPassword,
      tenantId,
    }: {
      fullName: string;
      email: string;
      phone?: string;
      memberType: MemberType;
      oabNumber?: string;
      isAdminLawyer?: boolean;
      active?: boolean;
      permissions: TeamPermissions;
      temporaryPassword: string;
      tenantId?: string;
    } = body;

    // 2. Input Validation
    if (!fullName || !email || !temporaryPassword) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes (nome, e-mail ou senha provisória).' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminClient = createAdminClient();

    // Resolve Tenant ID: use provided or fallback to the registered tenant
    let effectiveTenantId = tenantId;
    if (!effectiveTenantId || effectiveTenantId === '00000000-0000-0000-0000-000000000001') {
      const { data: firstTenant } = await adminClient
        .from('tenants')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstTenant?.id) {
        effectiveTenantId = firstTenant.id;
      }
    }

    if (!effectiveTenantId) {
      return NextResponse.json(
        { error: 'Nenhum escritório (tenant) cadastrado no sistema para vincular o colaborador.' },
        { status: 400 }
      );
    }

    // 3. Pre-flight check: Unique email in profiles
    const { data: existingProfile } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        {
          error: `O e-mail "${cleanEmail}" já está cadastrado no sistema para "${existingProfile.full_name}". Não é permitido duplicar o e-mail de acesso.`,
        },
        { status: 409 }
      );
    }

    // 4. Map Role to DB Constraint
    let mappedRole: 'MANAGING_LAWYER' | 'ASSOCIATE_LAWYER' | 'ASSISTANT' | 'INTERN' = 'ASSOCIATE_LAWYER';
    if (memberType === 'LAWYER') {
      mappedRole = isAdminLawyer ? 'MANAGING_LAWYER' : 'ASSOCIATE_LAWYER';
    } else if (memberType === 'ASSISTANT') {
      mappedRole = 'ASSISTANT';
    } else if (memberType === 'INTERN') {
      mappedRole = 'INTERN';
    }

    // 5. Create User in Supabase Auth with Temporary Password
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: cleanEmail,
        password: temporaryPassword,
        email_confirm: true,
        app_metadata: {
          tenant_id: effectiveTenantId,
          role: mappedRole,
        },
        user_metadata: {
          full_name: fullName.trim(),
          phone: phone ? phone.trim() : null,
          oab_number: memberType === 'LAWYER' && oabNumber ? oabNumber.trim() : null,
          member_type: memberType,
          must_change_password: true,
          permissions,
        },
      });

    if (authError || !authData.user) {
      const isDuplicate =
        authError?.message?.toLowerCase().includes('already') ||
        authError?.message?.toLowerCase().includes('registered') ||
        authError?.status === 422;

      return NextResponse.json(
        {
          error: isDuplicate
            ? `O e-mail "${cleanEmail}" já possui uma conta de autenticação cadastrada.`
            : `Erro ao criar usuário de acesso: ${authError?.message || 'Falha no autenticador.'}`,
        },
        { status: isDuplicate ? 409 : 500 }
      );
    }

    // 6. Create Profile in public.profiles
    const { data: profileData, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        tenant_id: effectiveTenantId,
        full_name: fullName.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        oab_number: memberType === 'LAWYER' && oabNumber ? oabNumber.trim() : null,
        role: mappedRole,
        is_active: active ?? true,
      })
      .select()
      .single();

    if (profileError || !profileData) {
      // Rollback Auth user on profile creation failure
      await adminClient.auth.admin.deleteUser(authData.user.id);
      const isUnique =
        profileError?.code === '23505' ||
        profileError?.message?.includes('unique') ||
        profileError?.message?.includes('duplicate key');

      return NextResponse.json(
        {
          error: isUnique
            ? `O e-mail "${cleanEmail}" já está em uso por outro perfil no sistema.`
            : `Erro ao vincular perfil de equipe: ${profileError?.message || 'Falha ao salvar no banco.'}`,
        },
        { status: isUnique ? 409 : 500 }
      );
    }

    const createdMember: TeamMember = {
      id: profileData.id,
      tenantId: profileData.tenant_id,
      fullName: profileData.full_name,
      email: profileData.email,
      phone: profileData.phone || undefined,
      memberType,
      oabNumber: profileData.oab_number || undefined,
      isAdminLawyer: mappedRole === 'MANAGING_LAWYER',
      active: profileData.is_active,
      temporaryPassword,
      mustChangePassword: true,
      permissions,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Colaborador criado com sucesso com senha provisória de primeiro acesso.',
        data: createdMember,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro interno ao processar cadastro do colaborador.' },
      { status: 500 }
    );
  }
}
