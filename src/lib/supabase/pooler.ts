/**
 * Database Connection Pooling Configuration & Supavisor Manager (Item 25)
 * 
 * In serverless environments (Vercel Serverless Functions / Next.js API Routes),
 * direct PostgreSQL connections to port 5432 cause connection exhaustion under load.
 * 
 * Supabase provides Supavisor (Connection Pooler):
 * - Port 6543: Transaction Mode (mandatory for serverless - releases connection after each query).
 * - Port 5432: Session Mode (for stateful long-running connections).
 */

export interface DatabasePoolerConfig {
  host: string;
  port: number;
  mode: 'transaction' | 'session';
  poolSize?: number;
  ssl: boolean;
}

export function parseSupabasePoolerConfig(connectionUri?: string): DatabasePoolerConfig {
  const uri = connectionUri || process.env.DATABASE_URL || '';

  if (!uri) {
    return {
      host: 'aws-0-sa-east-1.pooler.supabase.com',
      port: 6543,
      mode: 'transaction',
      poolSize: 15,
      ssl: true,
    };
  }

  try {
    const parsed = new URL(uri);
    const port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    const isPooler = port === 6543 || parsed.hostname.includes('pooler');

    return {
      host: parsed.hostname,
      port: isPooler ? 6543 : port,
      mode: isPooler ? 'transaction' : 'session',
      poolSize: isPooler ? 20 : 5,
      ssl: parsed.searchParams.get('sslmode') !== 'disable',
    };
  } catch {
    return {
      host: 'localhost',
      port: 5432,
      mode: 'session',
      poolSize: 5,
      ssl: false,
    };
  }
}

/**
 * Returns optimized connection string enforcing Supavisor transaction pooler on port 6543.
 */
export function getOptimizedPoolerConnectionString(rawConnectionString: string): string {
  if (!rawConnectionString) return '';

  try {
    const url = new URL(rawConnectionString);
    // If connected to direct port 5432, point to Supavisor transaction pooler on 6543
    if (url.port === '5432') {
      url.port = '6543';
    }
    // Enforce pgbouncer/transaction mode parameter
    if (!url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }
    return url.toString();
  } catch {
    return rawConnectionString;
  }
}
