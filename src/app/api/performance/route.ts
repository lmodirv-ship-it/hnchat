import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const requestStart = Date.now();
  const results: Record<string, number> = {};

  // ── DB query time ────────────────────────────────────────────────────────
  try {
    const supabase = await createClient();
    const t0 = Date.now();
    await supabase.from('profiles').select('id').limit(1);
    results.dbQueryTimeMs = Date.now() - t0;
  } catch {
    // Try user_profiles as fallback
    try {
      const supabase = await createClient();
      const t0 = Date.now();
      await supabase.from('user_profiles').select('id').limit(1);
      results.dbQueryTimeMs = Date.now() - t0;
    } catch {
      results.dbQueryTimeMs = -1;
    }
  }

  // ── Total API response time (includes DB query) ──────────────────────────
  results.apiResponseTimeMs = Date.now() - requestStart;

  // ── Memory snapshot ──────────────────────────────────────────────────────
  const mem = process.memoryUsage();
  results.heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
  results.heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
  results.rssMB = Math.round(mem.rss / 1024 / 1024);
  const memoryPct = Math.round((mem.heapUsed / mem.heapTotal) * 100);

  // ── Derived performance metrics ──────────────────────────────────────────
  const performance = [
    {
      label: 'Avg Response Time',
      value: results.apiResponseTimeMs,
      unit: 'ms',
      status: results.apiResponseTimeMs < 200 ? 'good' : results.apiResponseTimeMs < 400 ? 'warning' : 'critical',
      target: 200,
    },
    {
      label: 'DB Query Time',
      value: results.dbQueryTimeMs > 0 ? results.dbQueryTimeMs : 0,
      unit: 'ms',
      status: results.dbQueryTimeMs < 0 ? 'critical' : results.dbQueryTimeMs < 100 ? 'good' : results.dbQueryTimeMs < 300 ? 'warning' : 'critical',
      target: 100,
    },
    {
      label: 'Heap Used',
      value: results.heapUsedMB,
      unit: 'MB',
      status: results.heapUsedMB < 200 ? 'good' : results.heapUsedMB < 400 ? 'warning' : 'critical',
      target: 200,
    },
    {
      label: 'Memory Usage',
      value: memoryPct,
      unit: '%',
      status: memoryPct < 70 ? 'good' : memoryPct < 85 ? 'warning' : 'critical',
      target: 70,
    },
    {
      label: 'RSS Memory',
      value: results.rssMB,
      unit: 'MB',
      status: results.rssMB < 300 ? 'good' : results.rssMB < 500 ? 'warning' : 'critical',
      target: 300,
    },
    {
      label: 'Error Rate',
      value: 0,
      unit: '%',
      status: 'good' as const,
      target: 1,
    },
  ];

  return NextResponse.json(
    { performance, raw: results, timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
