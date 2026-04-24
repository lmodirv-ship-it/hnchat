import { NextRequest, NextResponse } from 'next/server';
import { sendPurchaseConfirmationEmail } from '@/lib/services/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name, orderId, items, total } = await request.json();
    if (!email || !orderId) {
      return NextResponse.json({ error: 'email and orderId required' }, { status: 400 });
    }
    const sent = await sendPurchaseConfirmationEmail(
      email,
      name || '',
      orderId,
      items || [],
      total || 0
    );
    return NextResponse.json({ success: sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
