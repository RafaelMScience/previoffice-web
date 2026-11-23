/**
 * Server-to-Database Latency Benchmark & Region Alignment Diagnostic (Item 19)
 * 
 * Detects whether the serverless runtime and Supabase database are co-located in the same region.
 * Benchmarks simple queries and classifies latency impact.
 */

export interface LatencyReport {
  durationMs: number;
  status: 'EXCELLENT_SAME_REGION' | 'ACCEPTABLE' | 'CROSS_REGION_MISMATCH';
  message: string;
  recommendation: string;
}

export function classifyDatabaseLatency(durationMs: number): LatencyReport {
  if (durationMs <= 25) {
    return {
      durationMs,
      status: 'EXCELLENT_SAME_REGION',
      message: `Excelente: Consulta respondeu em ${durationMs}ms. Servidor e Banco estão na mesma região geográfica.`,
      recommendation: 'Nenhuma alteração necessária.',
    };
  }

  if (durationMs <= 80) {
    return {
      durationMs,
      status: 'ACCEPTABLE',
      message: `Aceitável: Consulta respondeu em ${durationMs}ms. Latência normal entre regiões vizinhas.`,
      recommendation: 'Monitore horários de pico.',
    };
  }

  return {
    durationMs,
    status: 'CROSS_REGION_MISMATCH',
    message: `Alerta de Latência (${durationMs}ms): O servidor e o banco de dados estão provavelmente em regiões diferentes (ex: Vercel nos EUA e Supabase no Brasil, ou vice-versa).`,
    recommendation: 'Configure a região do Vercel para gru1 (São Paulo) se o Supabase estiver em sa-east-1, eliminando o atraso de ~120ms de travessia continental.',
  };
}

export async function benchmarkDatabaseQuery(queryFn: () => Promise<unknown>): Promise<LatencyReport> {
  const start = performance.now();
  await queryFn();
  const durationMs = Math.round((performance.now() - start) * 100) / 100;
  return classifyDatabaseLatency(durationMs);
}
