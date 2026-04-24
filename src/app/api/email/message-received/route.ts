import { NextRequest, NextResponse } from 'next/server';
import { sendMessageReceivedEmail } from '@/lib/services/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name, senderName, messagePreview } = await request.json();
    if (!email || !senderName) {
      return NextResponse.json({ error: 'email and senderName required' }, { status: 400 });
    }
    const sent = await sendMessageReceivedEmail(
      email,
      name || '',
      senderName,
      messagePreview || ''
    );
    return NextResponse.json({ success: sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
