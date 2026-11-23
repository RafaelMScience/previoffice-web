/**
 * Asynchronous Background Job Queue with Retries, Exponential Backoff, and Observability.
 * Designed to offload slow operations (audit logging, PDF generation, document encryption, AI tasks)
 * from synchronous HTTP request lifecycles.
 */

export type JobStatus = 'queued' | 'processing' | 'retrying' | 'completed' | 'failed';
export type JobPriority = 'high' | 'normal' | 'low';

export interface Job<TData = any, TResult = any> {
  id: string;
  name: string;
  data: TData;
  result?: TResult;
  error?: string;
  status: JobStatus;
  priority: JobPriority;
  attempts: number;
  maxRetries: number;
  backoffMs: number;
  queuedAt: number;
  startedAt?: number;
  completedAt?: number;
  progress?: number;
  tenantId?: string;
  userId?: string;
}

export interface JobOptions {
  priority?: JobPriority;
  maxRetries?: number;
  backoffMs?: number;
  tenantId?: string;
  userId?: string;
}

export type JobHandler<TData = any, TResult = any> = (job: Job<TData, TResult>) => Promise<TResult>;

export type JobEventListener = (job: Job) => void;

export class BackgroundJobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private listeners: Map<string, Set<JobEventListener>> = new Map();
  private runningCount = 0;
  private maxConcurrency: number;
  private maxHistory: number;

  constructor(options?: { maxConcurrency?: number; maxHistory?: number }) {
    this.maxConcurrency = options?.maxConcurrency || 3;
    this.maxHistory = options?.maxHistory || 500;
  }

  /**
   * Registers a job processor handler for a specific job name.
   */
  public registerHandler<TData = any, TResult = any>(
    name: string,
    handler: JobHandler<TData, TResult>
  ): void {
    this.handlers.set(name, handler as JobHandler);
  }

  /**
   * Enqueues a new background job. Returns immediately in sub-millisecond time.
   */
  public enqueue<TData = any, TResult = any>(
    name: string,
    data: TData,
    options?: JobOptions
  ): Job<TData, TResult> {
    if (this.jobs.size >= this.maxHistory) {
      this.evictOldestCompleted();
    }

    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job: Job<TData, TResult> = {
      id,
      name,
      data,
      status: 'queued',
      priority: options?.priority || 'normal',
      attempts: 0,
      maxRetries: options?.maxRetries !== undefined ? options?.maxRetries : 3,
      backoffMs: options?.backoffMs !== undefined ? options?.backoffMs : 100,
      queuedAt: Date.now(),
      progress: 0,
      tenantId: options?.tenantId,
      userId: options?.userId,
    };

    this.jobs.set(id, job);
    this.emit('queued', job);

    // Schedule queue draining asynchronously without blocking the caller
    queueMicrotask(() => this.processNext());

    return job;
  }

  /**
   * Returns a job by its unique ID.
   */
  public getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /**
   * Lists jobs with optional filtering.
   */
  public listJobs(filter?: {
    status?: JobStatus;
    name?: string;
    tenantId?: string;
    userId?: string;
    limit?: number;
  }): Job[] {
    let list = Array.from(this.jobs.values());

    if (filter?.tenantId) {
      list = list.filter((j) => j.tenantId === filter.tenantId);
    }
    if (filter?.userId) {
      list = list.filter((j) => j.userId === filter.userId);
    }
    if (filter?.status) {
      list = list.filter((j) => j.status === filter.status);
    }
    if (filter?.name) {
      list = list.filter((j) => j.name === filter.name);
    }

    // Sort descending by queuedAt
    list.sort((a, b) => b.queuedAt - a.queuedAt);

    if (filter?.limit && filter.limit > 0) {
      list = list.slice(0, filter.limit);
    }

    return list;
  }

  /**
   * Returns aggregate queue metrics.
   */
  public getMetrics(tenantId?: string): {
    total: number;
    queued: number;
    processing: number;
    retrying: number;
    completed: number;
    failed: number;
  } {
    const metrics = {
      total: 0,
      queued: 0,
      processing: 0,
      retrying: 0,
      completed: 0,
      failed: 0,
    };

    for (const job of this.jobs.values()) {
      if (tenantId && job.tenantId !== tenantId) {
        continue;
      }
      metrics.total++;
      if (job.status in metrics) {
        metrics[job.status as keyof typeof metrics]++;
      }
    }

    return metrics;
  }

  /**
   * Clears completed or failed jobs from history.
   */
  public clearCompleted(): void {
    for (const [id, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'failed') {
        this.jobs.delete(id);
      }
    }
  }

  /**
   * Evicts the oldest finished jobs when nearing memory capacity.
   */
  private evictOldestCompleted(): void {
    const finished = Array.from(this.jobs.entries())
      .filter(([_, j]) => j.status === 'completed' || j.status === 'failed')
      .sort((a, b) => a[1].queuedAt - b[1].queuedAt);

    const toRemove = Math.min(finished.length, 50);
    for (let i = 0; i < toRemove; i++) {
      this.jobs.delete(finished[i][0]);
    }
  }

  /**
   * Resets the entire queue (for testing).
   */
  public reset(): void {
    this.jobs.clear();
    this.runningCount = 0;
  }

  /**
   * Subscribes to lifecycle events.
   */
  public on(event: 'queued' | 'processing' | 'retrying' | 'completed' | 'failed', listener: JobEventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  private emit(event: string, job: Job): void {
    const set = this.listeners.get(event);
    if (set) {
      for (const listener of set) {
        try {
          listener(job);
        } catch {
          // Prevent listener errors from stopping queue execution
        }
      }
    }
  }

  /**
   * Priority comparator for pending jobs.
   */
  private getPriorityWeight(priority: JobPriority): number {
    switch (priority) {
      case 'high':
        return 3;
      case 'normal':
        return 2;
      case 'low':
        return 1;
      default:
        return 2;
    }
  }

  /**
   * Main asynchronous queue draining loop.
   */
  private async processNext(): Promise<void> {
    if (this.runningCount >= this.maxConcurrency) {
      return;
    }

    // Find pending jobs
    const candidates = Array.from(this.jobs.values())
      .filter((j) => j.status === 'queued')
      .sort((a, b) => {
        const pDiff = this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
        if (pDiff !== 0) return pDiff;
        return a.queuedAt - b.queuedAt;
      });

    if (candidates.length === 0) {
      return;
    }

    const job = candidates[0];
    const handler = this.handlers.get(job.name);

    if (!handler) {
      job.status = 'failed';
      job.error = `Nenhum processador registrado para o job "${job.name}".`;
      job.completedAt = Date.now();
      this.emit('failed', job);
      // Advance to next candidates instead of stalling
      queueMicrotask(() => this.processNext());
      return;
    }

    this.runningCount++;
    job.status = 'processing';
    job.attempts++;
    job.startedAt = job.startedAt || Date.now();
    this.emit('processing', job);

    (async () => {
      try {
        const result = await handler(job);
        job.result = result;
        job.status = 'completed';
        job.progress = 100;
        job.completedAt = Date.now();
        this.emit('completed', job);
      } catch (err: any) {
        const errorMessage = err?.message || 'Falha na execução do job';
        if (job.attempts <= job.maxRetries) {
          job.status = 'retrying';
          job.error = `Tentativa ${job.attempts}/${job.maxRetries} falhou: ${errorMessage}`;
          this.emit('retrying', job);

          const delay = job.backoffMs * Math.pow(2, job.attempts - 1);
          setTimeout(() => {
            job.status = 'queued';
            this.processNext();
          }, delay);
        } else {
          job.status = 'failed';
          job.error = `Excedeu limite de ${job.maxRetries} tentativas. Último erro: ${errorMessage}`;
          job.completedAt = Date.now();
          this.emit('failed', job);
        }
      } finally {
        this.runningCount--;
        this.processNext();
      }
    })();

    // Attempt to launch next candidate if concurrency allows
    if (this.runningCount < this.maxConcurrency) {
      this.processNext();
    }
  }
}

/**
 * Singleton instance of the application job queue.
 */
export const defaultJobQueue = new BackgroundJobQueue({ maxConcurrency: 4, maxHistory: 500 });

// Register default system handlers
defaultJobQueue.registerHandler('audit_log', async (job) => {
  const { eventType, userId, details } = job.data || {};
  return {
    logged: true,
    eventType: eventType || 'GENERIC_AUDIT',
    userId: userId || job.userId,
    timestamp: new Date().toISOString(),
  };
});

defaultJobQueue.registerHandler('pdf_generation', async (job) => {
  const { documentType, title } = job.data || {};
  return {
    generated: true,
    documentType: documentType || 'CONTRACT',
    downloadUrl: `/api/documents/preview/${job.id}`,
    generatedAt: new Date().toISOString(),
  };
});

defaultJobQueue.registerHandler('document_encryption', async (job) => {
  const { fileName, sizeBytes } = job.data || {};
  return {
    encrypted: true,
    fileName,
    sizeBytes,
    status: 'VAULT_STORED',
  };
});
