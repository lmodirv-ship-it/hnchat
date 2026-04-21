import { NextRequest, NextResponse } from 'next/server';
import { sendReEngagementEmail } from '@/lib/services/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    const sent = await sendReEngagementEmail(email, name || '');
    return NextResponse.json({ success: sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
