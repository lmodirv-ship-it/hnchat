import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin/owner
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('is_admin, is_owner')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin && !profile?.is_owner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { receipt_id, action, rejection_reason, subscription_id, plan_name } = await req.json();

  if (action === 'approve') {
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + 30);

    await supabase
      .from('payment_receipts')
      .update({ status: 'approved', reviewed_by: user.id, reviewed_at: now.toISOString() })
      .eq('id', receipt_id);

    await supabase
      .from('subscriptions')
      .update({
        status: 'approved',
        starts_at: now.toISOString(),
        expires_at: expires.toISOString(),
      })
      .eq('id', subscription_id);

    return NextResponse.json({ success: true, message: 'تم تأكيد الدفع وتفعيل الاشتراك' });
  }

  if (action === 'reject') {
    await supabase
      .from('payment_receipts')
      .update({
        status: 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejection_reason || 'لم يتم قبول الإيصال',
      })
      .eq('id', receipt_id);

    await supabase
      .from('subscriptions')
      .update({ status: 'rejected' })
      .eq('id', subscription_id);

    return NextResponse.json({ success: true, message: 'تم رفض الإيصال' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
