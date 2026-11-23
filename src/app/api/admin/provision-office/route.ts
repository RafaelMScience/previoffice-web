import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, verifyMasterKey } from '@/lib/security/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidCpf, formatCpf } from '@/lib/domain/cpf-validator';
import { generateRandomPassword } from '@/lib/auth/password-generator';

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  // 1. Rate Limit Check
  const rateLimit = checkRateLimit(ip, 'admin-provision-office', 10, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const {
      masterKey,
      officeName,
      cnpj,
      taxId,
      societyOab,
      oabNumber,
      oabUf,
      phone,
      officeEmail,
      address,
      lawyerName,
      lawyerCpf,
      lawyerOabNumber,
      lawyerOabUf,
      lawyerPhone,
      lawyerEmail,
      lawyerPassword,
      planType = 'TRIAL_90_DAYS',
    } = body;

    // 2. Cryptographic Master Secret Gate
    if (!masterKey || !verifyMasterKey(masterKey)) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid master key.' },
        { status: 401 }
      );
    }

    const lawyerOab = (lawyerOabNumber || oabNumber || '').trim();
    const lawyerUf = (lawyerOabUf || oabUf || 'AM').trim().toUpperCase();
    const officeTaxId = (cnpj || taxId || '').trim();

    // 3. Validation
    if (
      !officeName ||
      !officeEmail ||
      !lawyerName ||
      !lawyerEmail ||
      !lawyerOab
    ) {
      return NextResponse.json(
        { error: 'Campos obrigatórios do escritório ou do advogado titular não informados.' },
        { status: 400 }
      );
    }

    // Determine secure password: if lawyerPassword provided and >= 8 chars, use it; otherwise generate random temporary password
    const finalLawyerPassword =
      typeof lawyerPassword === 'string' && lawyerPassword.trim().length >= 8
        ? lawyerPassword.trim()
        : generateRandomPassword();

    // CPF validation for lawyer (pessoa física)
    let formattedLawyerCpf: string | null = null;
    if (lawyerCpf && lawyerCpf.trim()) {
      const cleanDigits = lawyerCpf.replace(/\D/g, '');
      if (cleanDigits.length === 11 && !isValidCpf(cleanDigits)) {
        return NextResponse.json(
          { error: 'O CPF informado para o advogado titular é inválido.' },
          { status: 400 }
        );
      }
      formattedLawyerCpf = cleanDigits.length === 11 ? formatCpf(cleanDigits) : lawyerCpf.trim();
    }

    const adminClient = createAdminClient();

    const cleanOfficeEmail = officeEmail.trim().toLowerCase();
    const cleanLawyerEmail = lawyerEmail.trim().toLowerCase();
    const finalLawyerOab = `${lawyerOab}/${lawyerUf}`;
    const finalSocietyOab = societyOab?.trim() || finalLawyerOab;

    // 4. Pre-Flight Uniqueness Checks (dispatched in parallel)
    const [{ data: existingProfile }, { data: existingTenantEmail }] = await Promise.all([
      adminClient
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', cleanLawyerEmail)
        .maybeSingle(),
      adminClient
        .from('tenants')
        .select('id, email, office_name')
        .eq('email', cleanOfficeEmail)
        .maybeSingle(),
    ]);

    if (existingProfile) {
      return NextResponse.json(
        {
          error: `O e-mail do advogado administrador (${cleanLawyerEmail}) já está cadastrado no sistema para "${existingProfile.full_name}". Não é permitido duplicar o e-mail de acesso.`,
        },
        { status: 409 }
      );
    }

    if (existingTenantEmail) {
      return NextResponse.json(
        {
          error: `O e-mail institucional informado (${cleanOfficeEmail}) já está cadastrado para o escritório "${existingTenantEmail.office_name}".`,
        },
        { status: 409 }
      );
    }

    // 5. Insert Tenant in Supabase (CNPJ vincula ao escritório / Razão Social)
    const { data: tenantData, error: tenantError } = await adminClient
      .from('tenants')
      .insert({
        office_name: officeName.trim(),
        lead_lawyer_name: lawyerName.trim(),
        oab_number: finalSocietyOab,
        tax_id: officeTaxId || null,
        phone: phone ? phone.trim() : null,
        whatsapp: phone ? phone.trim() : null,
        email: cleanOfficeEmail,
        address: address ? address.trim() : null,
        plan_type: planType,
      })
      .select()
      .single();

    if (tenantError || !tenantData) {
      const isUniqueTax =
        tenantError?.message?.includes('idx_tenants_unique_tax_id_digits') ||
        tenantError?.details?.includes('idx_tenants_unique_tax_id_digits');
      if (isUniqueTax) {
        return NextResponse.json(
          { error: 'Já existe um escritório cadastrado com este CNPJ/CPF.' },
          { status: 409 }
        );
      }

      const isUniqueEmail =
        tenantError?.message?.includes('idx_tenants_unique_email_lower') ||
        tenantError?.details?.includes('idx_tenants_unique_email_lower');
      if (isUniqueEmail) {
        return NextResponse.json(
          {
            error: `O e-mail institucional informado (${cleanOfficeEmail}) já está cadastrado para outro escritório.`,
          },
          { status: 409 }
        );
      }

      const isUniqueViolation =
        tenantError?.code === '23505' ||
        tenantError?.message?.includes('duplicate key') ||
        tenantError?.message?.includes('unique');
      return NextResponse.json(
        {
          error: isUniqueViolation
            ? 'Já existe um escritório cadastrado com este e-mail ou CNPJ/CPF.'
            : 'Falha ao processar o cadastro do escritório no banco de dados.',
        },
        { status: isUniqueViolation ? 409 : 500 }
      );
    }

    // 6. Create Managing Lawyer in Supabase Auth (CPF e OAB vinculados à Pessoa Física do Advogado)
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: cleanLawyerEmail,
        password: finalLawyerPassword,
        email_confirm: true,
        app_metadata: {
          tenant_id: tenantData.id,
          role: 'MANAGING_LAWYER',
        },
        user_metadata: {
          full_name: lawyerName.trim(),
          cpf: formattedLawyerCpf,
          oab_number: finalLawyerOab,
          phone: (lawyerPhone || phone) ? (lawyerPhone || phone).trim() : null,
          must_change_password: true,
        },
      });

    if (authError || !authData.user) {
      // Rollback tenant creation on auth failure
      await adminClient.from('tenants').delete().eq('id', tenantData.id);
      const isDuplicateAuth =
        authError?.message?.toLowerCase().includes('already') ||
        authError?.message?.toLowerCase().includes('registered') ||
        authError?.status === 422;
      return NextResponse.json(
        {
          error: isDuplicateAuth
            ? `O e-mail "${cleanLawyerEmail}" já possui uma conta de autenticação cadastrada.`
            : 'Erro ao criar usuário administrador no serviço de autenticação.',
        },
        { status: isDuplicateAuth ? 409 : 500 }
      );
    }

    // 7. Create Profile in public.profiles (CPF e OAB do Advogado)
    const { error: profileError } = await adminClient.from('profiles').insert({
      id: authData.user.id,
      tenant_id: tenantData.id,
      full_name: lawyerName.trim(),
      cpf: formattedLawyerCpf,
      email: cleanLawyerEmail,
      phone: (lawyerPhone || phone) ? (lawyerPhone || phone).trim() : null,
      oab_number: finalLawyerOab,
      role: 'MANAGING_LAWYER',
      is_active: true,
    });

    if (profileError) {
      // Rollback both created auth user and tenant to prevent orphaned records
      await adminClient.auth.admin.deleteUser(authData.user.id);
      await adminClient.from('tenants').delete().eq('id', tenantData.id);
      const isUniqueViolation =
        profileError.code === '23505' ||
        profileError.message.includes('duplicate key') ||
        profileError.message.includes('unique');
      return NextResponse.json(
        {
          error: isUniqueViolation
            ? `O e-mail "${cleanLawyerEmail}" já está em uso por outro perfil no sistema.`
            : `Erro ao vincular perfil do advogado administrador: ${profileError.message}`,
        },
        { status: isUniqueViolation ? 409 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Escritório e Administrador Gestor criados com sucesso no Supabase.',
      data: {
        tenantId: tenantData.id,
        officeName,
        officeCnpj: officeTaxId || null,
        societyOab: societyOab?.trim() || null,
        lawyerName,
        lawyerCpf: formattedLawyerCpf,
        lawyerOab: finalLawyerOab,
        lawyerEmail,
        temporaryPassword: finalLawyerPassword,
        mustChangePassword: true,
        planType,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal error processing tenant provisioning.' },
      { status: 500 }
    );
  }
}
