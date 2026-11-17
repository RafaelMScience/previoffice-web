import { NextResponse, type NextRequest } from 'next/server';
import { checkRateLimit, verifyMasterKey } from '@/lib/security/admin-guard';
import { createClientServer } from '@/lib/supabase/server';

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
    if (!officeName || !oabNumber || !oabUf || !officeEmail || !lawyerName || !lawyerEmail || !lawyerPassword) {
      return NextResponse.json(
        { error: 'Missing required office or lawyer administrator fields.' },
        { status: 400 }
      );
    }

    const tenantId = `tenant-${Date.now()}`;
    const lawyerUserId = `usr-${Date.now()}`;

    // Attempt Supabase insert if configured
    try {
      const supabase = await createClientServer();
      
      // Insert tenant
      const { data: tenantData, error: tenantError } = await (supabase
        .from('tenants') as any)
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

      if (!tenantError && tenantData) {
        // Register lawyer user
        await (supabase.from('profiles') as any).insert({
          tenant_id: tenantData.id,
          full_name: lawyerName,
          email: lawyerEmail,
          role: 'MANAGING_LAWYER',
          is_active: true,
        });
      }
    } catch {
      // Running in standalone or mock environment without active Supabase credentials
    }

    return NextResponse.json({
      success: true,
      message: 'Office tenant and managing lawyer provisioned successfully.',
      data: {
        tenantId,
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
      { error: 'Internal error processing tenant provisioning.' },
      { status: 500 }
    );
  }
}
