'use server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const OWNER_EMAIL = 'lmodirv@gmail.com';
const OWNER_ACCESS_KEY_HEADER = 'x-owner-access';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

async function verifyOwner(req: NextRequest): Promise<boolean> {
  // Check owner access header (set by client from localStorage)
  const ownerAccess = req.headers.get(OWNER_ACCESS_KEY_HEADER);
  if (ownerAccess === 'granted') return true;

  // Also check Supabase session
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const supabase = getServiceClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user?.email === OWNER_EMAIL) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  const isOwner = await verifyOwner(req);
  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { action, userId, postId, reportId, value } = body;
  const supabase = getServiceClient();

  try {
    switch (action) {
      // ── USER ACTIONS ──
      case 'ban_user': {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_active: false })
          .eq('id', userId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'User banned successfully' });
      }

      case 'unban_user': {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_active: true })
          .eq('id', userId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'User unbanned successfully' });
      }

      case 'verify_user': {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_verified: true })
          .eq('id', userId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'User verified successfully' });
      }

      case 'unverify_user': {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_verified: false })
          .eq('id', userId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'User unverified successfully' });
      }

      case 'make_admin': {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_admin: true, role: 'admin' })
          .eq('id', userId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'User promoted to admin' });
      }

      case 'remove_admin': {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_admin: false, role: 'user' })
          .eq('id', userId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Admin role removed' });
      }

      case 'delete_user': {
        // Delete user profile (cascade will handle related data)
        const { error } = await supabase
          .from('user_profiles')
          .delete()
          .eq('id', userId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
      }

      // ── POST ACTIONS ──
      case 'delete_post': {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Post deleted successfully' });
      }

      case 'hide_post': {
        const { error } = await supabase
          .from('posts')
          .update({ is_published: false })
          .eq('id', postId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Post hidden successfully' });
      }

      case 'show_post': {
        const { error } = await supabase
          .from('posts')
          .update({ is_published: true })
          .eq('id', postId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Post published successfully' });
      }

      // ── REPORT ACTIONS ──
      case 'resolve_report': {
        const { error } = await supabase
          .from('reports')
          .update({ status: 'resolved', updated_at: new Date().toISOString() })
          .eq('id', reportId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Report resolved' });
      }

      case 'dismiss_report': {
        const { error } = await supabase
          .from('reports')
          .update({ status: 'dismissed', updated_at: new Date().toISOString() })
          .eq('id', reportId);
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Report dismissed' });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Action failed' }, { status: 500 });
  }
}

// GET: fetch extended data for owner
export async function GET(req: NextRequest) {
  const isOwner = await verifyOwner(req);
  if (!isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const supabase = getServiceClient();

  try {
    if (type === 'users') {
      const page = parseInt(searchParams.get('page') || '0');
      const search = searchParams.get('search') || '';
      let query = supabase
        .from('user_profiles')
        .select('id, full_name, username, email, avatar_url, is_verified, is_active, is_admin, is_owner, role, created_at, followers_count, posts_count')
        .order('created_at', { ascending: false })
        .range(page * 20, page * 20 + 19);

      if (search) {
        query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      return NextResponse.json({ data, count });
    }

    if (type === 'reports') {
      const status = searchParams.get('status') || 'pending';
      const { data, error } = await supabase
        .from('reports')
        .select('id, reason, description, status, created_at, reporter_id, reported_user_id, reported_post_id')
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return NextResponse.json({ data });
    }

    if (type === 'posts') {
      const page = parseInt(searchParams.get('page') || '0');
      const { data, error } = await supabase
        .from('posts')
        .select('id, content, is_published, created_at, likes_count, comments_count, user_profiles(username, full_name)')
        .order('created_at', { ascending: false })
        .range(page * 20, page * 20 + 19);
      if (error) throw error;
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Unknown type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
