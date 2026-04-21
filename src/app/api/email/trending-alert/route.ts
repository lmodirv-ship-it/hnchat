import { NextRequest, NextResponse } from 'next/server';
import { sendTrendingAlertEmail } from '@/lib/services/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name, videoTitle, videoUrl } = await request.json();
    if (!email || !videoTitle) {
      return NextResponse.json({ error: 'email and videoTitle required' }, { status: 400 });
    }
    const sent = await sendTrendingAlertEmail(
      email,
      name || '',
      videoTitle,
      videoUrl || 'https://hnchat.net/short-videos'
    );
    return NextResponse.json({ success: sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
