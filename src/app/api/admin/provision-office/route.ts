import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, verifyMasterKey } from '@/lib/security/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

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
      oabNumber,
      oabUf,
      taxId,
      phone,
      officeEmail,
      address,
      lawyerName,
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

    // 3. Validation
    if (
      !officeName ||
      !oabNumber ||
      !oabUf ||
      !officeEmail ||
      !lawyerName ||
      !lawyerEmail ||
      !lawyerPassword
    ) {
      return NextResponse.json(
        { error: 'Missing required office or lawyer administrator fields.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 4. Insert Tenant in Supabase
    const { data: tenantData, error: tenantError } = await adminClient
      .from('tenants')
      .insert({
        office_name: officeName,
        lead_lawyer_name: lawyerName,
        oab_number: `${oabNumber}/${oabUf}`,
        tax_id: taxId || null,
        phone,
        whatsapp: phone,
        email: officeEmail,
        address: address || null,
        plan_type: planType,
      })
      .select()
      .single();

    if (tenantError || !tenantData) {
      return NextResponse.json(
        { error: `Erro ao criar escritório: ${tenantError?.message}` },
        { status: 500 }
      );
    }

    // 5. Create Managing Lawyer in Supabase Auth
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: lawyerEmail,
        password: lawyerPassword,
        email_confirm: true,
        app_metadata: {
          tenant_id: tenantData.id,
          role: 'MANAGING_LAWYER',
        },
        user_metadata: {
          full_name: lawyerName,
        },
      });

    if (authError || !authData.user) {
      // Rollback tenant creation on auth failure
      await adminClient.from('tenants').delete().eq('id', tenantData.id);
      return NextResponse.json(
        { error: `Erro ao criar usuário administrador: ${authError?.message}` },
        { status: 500 }
      );
    }

    // 6. Create Profile in public.profiles
    const { error: profileError } = await adminClient.from('profiles').insert({
      id: authData.user.id,
      tenant_id: tenantData.id,
      full_name: lawyerName,
      email: lawyerEmail,
      role: 'MANAGING_LAWYER',
      is_active: true,
    });

    if (profileError) {
      return NextResponse.json(
        { error: `Erro ao vincular perfil: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Escritório e Administrador Gestor criados com sucesso no Supabase.',
      data: {
        tenantId: tenantData.id,
        officeName,
        oab: `${oabNumber}/${oabUf}`,
        lawyerName,
        lawyerEmail,
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
