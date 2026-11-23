import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let browserClientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * Reusable Singleton Supabase Browser Client (Item 25)
 * Prevents connection leakage and repeated client allocation across component renders.
 */
export function createClient() {
  if (typeof window !== 'undefined' && browserClientInstance) {
    return browserClientInstance;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const client = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  if (typeof window !== 'undefined') {
    browserClientInstance = client;
  }

  return client;
}
