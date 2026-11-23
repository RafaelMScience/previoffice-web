import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';
import { generateIntegritySeal } from '@/lib/services/audit-service';
import type { AuditAction, AuditSeverity } from '@/types/security';

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
        { error: 'Não autenticado para registrar auditoria.' },
        { status: 401 }
      );
    }

    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('tenant_id, full_name, role')
      .eq('id', callerUser.id)
      .maybeSingle();

    if (!callerProfile) {
      return NextResponse.json(
        { error: 'Perfil não localizado para auditoria.' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      action,
      actionDescription,
      targetResource,
      clientId,
      severity = 'INFO',
    }: {
      action: AuditAction;
      actionDescription: string;
      targetResource: string;
      clientId?: string;
      severity?: AuditSeverity;
    } = body;

    const timestamp = new Date().toISOString();
    const payload = `${callerProfile.tenant_id}:${callerUser.id}:${action}:${targetResource}:${timestamp}`;
    const integrityHash = generateIntegritySeal(payload);

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      '189.124.45.102';
    const userAgent = request.headers.get('user-agent') || 'Chrome 122 (Windows 11)';

    const { data: logEntry, error } = await adminClient
      .from('audit_logs')
      .insert({
        tenant_id: callerProfile.tenant_id,
        actor_id: callerUser.id,
        actor_name: callerProfile.full_name,
        actor_role:
          callerProfile.role === 'MANAGING_LAWYER'
            ? 'Advogado Sócio Titular'
            : callerProfile.role === 'ASSISTANT'
            ? 'Assistente / Recepção'
            : 'Advogado Associado',
        action,
        action_description: actionDescription,
        target_resource: targetResource,
        client_id: (clientId || null) as any,
        ip_address: ip,
        user_agent: userAgent,
        severity,
        integrity_hash: integrityHash,
        created_at: timestamp,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: logEntry }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro ao gravar log de auditoria.' },
      { status: 500 }
    );
  }
}
