import { NextRequest, NextResponse } from 'next/server';
import { sendNotificationDigestEmail } from '@/lib/services/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name, notifications } = await request.json();
    if (!email || !notifications?.length) {
      return NextResponse.json({ error: 'email and notifications required' }, { status: 400 });
    }
    const sent = await sendNotificationDigestEmail(email, name || '', notifications);
    return NextResponse.json({ success: sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
