import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseSupabasePoolerConfig, getOptimizedPoolerConnectionString } from './pooler.ts';
import { createClient } from './client.ts';

describe('Item 25: Pool de Conexões e Reutilização de Cliente Supabase', () => {
  it('createClient reuses single client instance in browser environment', () => {
    // Simulate browser window
    const originalWindow = (global as any).window;
    (global as any).window = {};

    try {
      const client1 = createClient();
      const client2 = createClient();
      assert.equal(client1, client2, 'createClient must return the exact same singleton instance');
    } finally {
      (global as any).window = originalWindow;
    }
  });

  it('detects and configures Supavisor pooler on port 6543 in transaction mode', () => {
    const config = parseSupabasePoolerConfig('postgresql://postgres.project:secret@aws-0-sa-east-1.pooler.supabase.com:6543/postgres');
    assert.equal(config.port, 6543);
    assert.equal(config.mode, 'transaction');
    assert.equal(config.ssl, true);
  });

  it('optimizes direct port 5432 connection string to use Supavisor pooler (port 6543)', () => {
    const directUri = 'postgresql://postgres.project:secret@aws-0-sa-east-1.pooler.supabase.com:5432/postgres';
    const optimized = getOptimizedPoolerConnectionString(directUri);

    assert.ok(optimized.includes(':6543/'), 'Must redirect to pooler port 6543');
    assert.ok(optimized.includes('pgbouncer=true'), 'Must include pgbouncer transaction mode flag');
  });
});
