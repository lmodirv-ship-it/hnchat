import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { error_type, message, path, stack, severity = 'error', user_agent, metadata } = body;

    if (!error_type || !message) {
      return NextResponse.json({ error: 'error_type and message are required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('error_logs')
      .insert({
        error_type,
        message,
        path: path ?? null,
        stack: stack ?? null,
        severity,
        user_agent: user_agent ?? req.headers.get('user-agent') ?? null,
        metadata: metadata ?? {},
      })
      .select('id')
      .single();

    if (error) {
      console.error('[error-logs POST]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id }, { status: 201 });
  } catch (err) {
    console.error('[error-logs POST] unexpected', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);
    const resolved = searchParams.get('resolved');

    const supabase = await createClient();

    let query = supabase
      .from('error_logs')
      .select('id, created_at, error_type, message, path, severity, resolved, resolved_at, metadata')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (resolved === 'true') query = query.eq('resolved', true);
    else if (resolved === 'false') query = query.eq('resolved', false);

    const { data, error } = await query;

    if (error) {
      console.error('[error-logs GET]', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ logs: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[error-logs GET] unexpected', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, resolved } = await req.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const supabase = await createClient();
    const { error } = await supabase
      .from('error_logs')
      .update({ resolved: !!resolved, resolved_at: resolved ? new Date().toISOString() : null })
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[error-logs PATCH] unexpected', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
