import { NextRequest, NextResponse } from 'next/server';
import {
  getEmailAggregatedStats,
  getEmailDailyReports,
  EMAIL_TAGS,
} from '@/lib/services/brevoEmailService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag') || undefined;
    const days = parseInt(searchParams.get('days') || '30', 10);

    const [aggregated, daily] = await Promise.all([
      getEmailAggregatedStats(tag, days),
      getEmailDailyReports(tag, Math.min(days, 14)),
    ]);

    // Compute per-tag aggregated stats for all email types
    const [welcomeStats, reengagementStats, weeklyStats, trendingStats] = await Promise.all([
      getEmailAggregatedStats(EMAIL_TAGS.welcome, days),
      getEmailAggregatedStats(EMAIL_TAGS.reengagement, days),
      getEmailAggregatedStats(EMAIL_TAGS.weeklyDigest, days),
      getEmailAggregatedStats(EMAIL_TAGS.trendingAlert, days),
    ]);

    return NextResponse.json({
      aggregated,
      daily,
      byType: {
        welcome: welcomeStats,
        reengagement: reengagementStats,
        weeklyDigest: weeklyStats,
        trendingAlert: trendingStats,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
