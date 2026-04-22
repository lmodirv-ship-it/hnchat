import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const OWNER_EMAIL = 'lmodirv@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Send magic link OTP to owner email
    const { error } = await supabase.auth.signInWithOtp({
      email: OWNER_EMAIL,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/owner`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Magic link sent to owner email' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to send login link' }, { status: 500 });
  }
}
