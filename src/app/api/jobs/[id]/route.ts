import { NextResponse, type NextRequest } from 'next/server';
import { defaultJobQueue } from '@/lib/queue/job-queue';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClientServer } from '@/lib/supabase/server';

async function getAuthenticatedUser(request: NextRequest) {
  const adminClient = createAdminClient();
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

  if (!callerUser) return null;

  const { data: profile } = await (adminClient.from('profiles') as any)
    .select('id, tenant_id, role')
    .eq('id', callerUser.id)
    .maybeSingle();

  return {
    user: callerUser,
    tenantId: profile?.tenant_id || callerUser.id,
    role: profile?.role || 'authenticated',
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para consultar detalhes da tarefa.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const job = defaultJobQueue.getJob(id);

    if (!job) {
      return NextResponse.json(
        { error: `Tarefa com ID "${id}" não encontrada na fila.` },
        { status: 404 }
      );
    }

    // Tenant isolation: callers can only inspect jobs belonging to their tenant
    if (job.tenantId && job.tenantId !== auth.tenantId && auth.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Esta tarefa pertence a outro escritório.' },
        { status: 403 }
      );
    }

    const durationMs = job.completedAt && job.startedAt ? job.completedAt - job.startedAt : undefined;

    return NextResponse.json({
      job: {
        ...job,
        durationMs,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Falha ao consultar detalhes da tarefa' },
      { status: 500 }
    );
  }
}
