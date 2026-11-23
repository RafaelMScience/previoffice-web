import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit } from '@/lib/security/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { mapMemberTypeToDbRole, validateTeamMemberInput } from '@/lib/auth/team-utils';
import { generateIntegritySeal } from '@/lib/services/audit-service';
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
    const adminClient = createAdminClient();

    // 2. Caller Authentication: check session via cookies or Bearer token
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
        { error: 'Não autenticado. Faça login para gerenciar a equipe.' },
        { status: 401 }
      );
    }

    // 3. Caller Authorization: verify MANAGING_LAWYER
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('tenant_id, role, full_name')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile || callerProfile.role !== 'MANAGING_LAWYER') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas o sócio administrador pode cadastrar colaboradores.' },
        { status: 403 }
      );
    }

    const effectiveTenantId = callerProfile.tenant_id;

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
    } = body;

    // 4. Input Validation
    const validation = validateTeamMemberInput({ fullName, email, temporaryPassword });
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 5. Pre-flight check: Unique email in profiles
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

    // 6. Map Role to DB Constraint
    const mappedRole = mapMemberTypeToDbRole(memberType, isAdminLawyer);

    // 7. Create User in Supabase Auth with Temporary Password
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

    // 8. Create Profile in public.profiles
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

    // Record forensic audit log
    try {
      const nowIso = new Date().toISOString();
      const payload = `${effectiveTenantId}:${callerUser.id}:UPDATE_PERMISSIONS:Membro: ${cleanEmail}:${nowIso}`;
      const hash = generateIntegritySeal(payload);

      await adminClient.from('audit_logs').insert({
        tenant_id: effectiveTenantId,
        actor_id: callerUser.id,
        actor_name: callerProfile.full_name || 'Advogado Titular',
        actor_role: 'Advogado Sócio Titular',
        action: 'UPDATE_PERMISSIONS',
        action_description: `Cadastrou colaborador(a): ${fullName.trim()} (${memberType}${isAdminLawyer ? ' - Sócio Admin' : ''})`,
        target_resource: `Membro: ${cleanEmail}`,
        ip_address: ip,
        user_agent: request.headers.get('user-agent') || 'Chrome 122 (Windows 11)',
        severity: 'INFO',
        integrity_hash: hash,
        created_at: nowIso,
      });
    } catch (auditErr) {
      console.warn('Audit log write non-blocking failure:', auditErr);
    }

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
