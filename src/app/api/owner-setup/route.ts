import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const OWNER_EMAIL = 'lmodirv@gmail.com';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (user.email !== OWNER_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Upsert owner profile with owner + admin flags
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: OWNER_EMAIL,
        full_name: 'Site Owner',
        username: 'owner',
        is_owner: true,
        is_admin: true,
        is_active: true,
        role: 'admin',
      }, { onConflict: 'id' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Setup failed' }, { status: 500 });
  }
}
