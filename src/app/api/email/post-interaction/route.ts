import { NextRequest, NextResponse } from 'next/server';
import { sendPostInteractionEmail } from '@/lib/services/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name, interactionType, actorName, postPreview } = await request.json();
    if (!email || !interactionType || !actorName) {
      return NextResponse.json({ error: 'email, interactionType, and actorName required' }, { status: 400 });
    }
    const sent = await sendPostInteractionEmail(
      email,
      name || '',
      interactionType,
      actorName,
      postPreview || ''
    );
    return NextResponse.json({ success: sent });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
