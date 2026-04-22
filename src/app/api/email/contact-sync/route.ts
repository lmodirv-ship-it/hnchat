import { NextRequest, NextResponse } from 'next/server';
import { syncContactToBrevo, updateContactAttributes } from '@/lib/services/brevoEmailService';

export async function POST(request: NextRequest) {
  try {
    const { email, name, attributes } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }
    const synced = await syncContactToBrevo(email, name || '', attributes || {});
    return NextResponse.json({ success: synced });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { email, attributes } = await request.json();
    if (!email || !attributes) {
      return NextResponse.json({ error: 'email and attributes required' }, { status: 400 });
    }
    const updated = await updateContactAttributes(email, attributes);
    return NextResponse.json({ success: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
