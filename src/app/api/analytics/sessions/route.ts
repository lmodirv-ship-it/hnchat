import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // ── Active users in last 5 minutes ──────────────────────────────────────
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000)?.toISOString();
    const { count: activeSessions } = await supabase?.from('user_profiles')?.select('id', { count: 'exact', head: true })?.gte('updated_at', fiveMinAgo);

    // ── New users today ──────────────────────────────────────────────────────
    const todayStart = new Date();
    todayStart?.setHours(0, 0, 0, 0);
    const { count: newUsersToday } = await supabase?.from('user_profiles')?.select('id', { count: 'exact', head: true })?.gte('created_at', todayStart?.toISOString());

    // ── Total users ──────────────────────────────────────────────────────────
    const { count: totalUsers } = await supabase?.from('user_profiles')?.select('id', { count: 'exact', head: true });

    // ── Users active in last 7 days (retention) ──────────────────────────────
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)?.toISOString();
    const { count: weeklyActiveUsers } = await supabase?.from('user_profiles')?.select('id', { count: 'exact', head: true })?.gte('updated_at', sevenDaysAgo);

    // ── Retention rate ───────────────────────────────────────────────────────
    const retentionRate =
      totalUsers && totalUsers > 0
        ? parseFloat((((weeklyActiveUsers ?? 0) / totalUsers) * 100)?.toFixed(1))
        : 0;

    return NextResponse?.json(
      {
        activeSessions: activeSessions ?? 0,
        newUsersToday: newUsersToday ?? 0,
        totalUsers: totalUsers ?? 0,
        weeklyActiveUsers: weeklyActiveUsers ?? 0,
        retentionRate,
        timestamp: new Date()?.toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    return NextResponse?.json(
      { error: 'Failed to fetch session analytics', details: String(err) },
      { status: 500 }
    );
  }
}
