import { NextResponse, type NextRequest } from 'next/server';
import { defaultJobQueue, type JobPriority, type JobStatus } from '@/lib/queue/job-queue';
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

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para enfileirar tarefas.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, data, priority, maxRetries, backoffMs } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'O nome da tarefa ("name") é obrigatório.' },
        { status: 400 }
      );
    }

    const start = performance.now();
    const job = defaultJobQueue.enqueue(name, data ?? {}, {
      priority: priority as JobPriority,
      maxRetries: typeof maxRetries === 'number' ? maxRetries : undefined,
      backoffMs: typeof backoffMs === 'number' ? backoffMs : undefined,
      tenantId: auth.tenantId,
      userId: auth.user.id,
    });
    const dispatchMs = (performance.now() - start).toFixed(2);

    return NextResponse.json(
      {
        success: true,
        message: 'Tarefa adicionada à fila de processamento em segundo plano.',
        dispatchMs: `${dispatchMs}ms`,
        job: {
          id: job.id,
          name: job.name,
          status: job.status,
          priority: job.priority,
          queuedAt: job.queuedAt,
        },
      },
      { status: 202 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Falha ao enfileirar tarefa' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Não autenticado. Faça login para visualizar as tarefas.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get('status') as JobStatus) || undefined;
    const name = searchParams.get('name') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const metrics = defaultJobQueue.getMetrics(auth.tenantId);
    const jobs = defaultJobQueue.listJobs({
      status,
      name,
      tenantId: auth.tenantId,
      limit,
    });

    return NextResponse.json({
      metrics,
      jobs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Falha ao consultar fila de tarefas' },
      { status: 500 }
    );
  }
}
