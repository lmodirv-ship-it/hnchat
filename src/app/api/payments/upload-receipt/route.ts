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

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const subscription_id = formData.get('subscription_id') as string;
  const transfer_reference = formData.get('transfer_reference') as string;
  const notes = formData.get('notes') as string;

  if (!file || !subscription_id) {
    return NextResponse.json({ error: 'Missing file or subscription_id' }, { status: 400 });
  }

  // Upload to Supabase Storage
  const ext = file.name.split('.').pop();
  const filename = `${user.id}/${subscription_id}_${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('payment-receipts')
    .upload(filename, buffer, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from('payment-receipts')
    .getPublicUrl(filename);

  // Save receipt record
  const { data, error } = await supabase
    .from('payment_receipts')
    .insert({
      subscription_id,
      user_id: user.id,
      receipt_url: uploadData.path,
      receipt_filename: file.name,
      transfer_reference: transfer_reference || null,
      notes: notes || null,
      status: 'pending_verification',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'pending_verification' })
    .eq('id', subscription_id);

  return NextResponse.json({ receipt: data, path: uploadData.path });
}
