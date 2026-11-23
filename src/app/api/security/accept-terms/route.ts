import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { generateIntegritySeal } from '@/lib/services/audit-service';

export async function POST(request: NextRequest) {
  try {
    const adminClient = createAdminClient();

    // 1. Authenticate caller (via session cookies or Bearer token)
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
        { error: 'Não autenticado para formalizar aceite dos termos.' },
        { status: 401 }
      );
    }

    // 2. Fetch user profile
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('id, tenant_id, full_name, role')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile) {
      return NextResponse.json(
        { error: 'Perfil do operador não localizado.' },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const termsVersion = body.termsVersion || '1.0';
    const timestamp = new Date().toISOString();

    // 3. Update profile with terms acceptance
    await (adminClient.from('profiles') as any)
      .update({
        terms_accepted_at: timestamp,
        terms_version: termsVersion,
      })
      .eq('id', callerUser.id);

    // 4. Record tamper-evident forensic audit log
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Browser Client';

    const payload = `${callerProfile.tenant_id}:${callerProfile.id}:LGPD_TERMS_ACCEPTED:TERMS_OF_RESPONSIBILITY_v${termsVersion}:${timestamp}`;
    const integrityHash = generateIntegritySeal(payload);

    await (adminClient.from('audit_logs') as any).insert({
      tenant_id: callerProfile.tenant_id,
      actor_id: callerProfile.id,
      actor_name: callerProfile.full_name || 'Operador',
      actor_role: callerProfile.role || 'Operador',
      action: 'LGPD_TERMS_ACCEPTED',
      action_description: `Operador formalizou o aceite do Termo de Responsabilidade e Consentimento LGPD (v${termsVersion}).`,
      target_resource: `PROFILE:${callerProfile.id}`,
      ip_address: ip,
      user_agent: userAgent,
      severity: 'INFO',
      integrity_hash: integrityHash,
      created_at: timestamp,
    });

    return NextResponse.json({
      success: true,
      termsAcceptedAt: timestamp,
      termsVersion,
    });
  } catch (error: any) {
    console.error('Error accepting LGPD terms:', error);
    return NextResponse.json(
      { error: 'Falha ao registrar aceite dos termos.' },
      { status: 500 }
    );
  }
}
