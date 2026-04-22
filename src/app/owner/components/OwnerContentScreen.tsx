'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface PostRow {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_published: boolean;
  user_profiles: { username: string | null; full_name: string | null } | null;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OwnerContentScreen() {
  const supabase = createClient();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; fn: () => void } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const ownerFetch = useCallback(async (url: string, opts: RequestInit = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'x-owner-access': 'granted',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(opts.headers as Record<string, string> || {}),
      },
    });
  }, []);

  const loadPosts = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const res = await ownerFetch(`/api/owner-actions?type=posts&page=${p}`);
      const json = await res.json();
      let data: PostRow[] = json.data || [];
      if (filter === 'published') data = data.filter(p => p.is_published);
      if (filter === 'hidden') data = data.filter(p => !p.is_published);
      setPosts(data);
    } catch {
      showToast('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  }, [ownerFetch, filter]);

  useEffect(() => { loadPosts(0); setPage(0); }, [filter]);

  // Real-time subscription for posts changes
  useEffect(() => {
    const channel = supabase
      .channel('owner-content-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          loadPosts(page);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, page, filter, loadPosts]);

  const doAction = async (action: string, payload: Record<string, string>, successMsg: string) => {
    setActionLoading(`${action}_${Object.values(payload)[0]}`);
    try {
      const res = await ownerFetch('/api/owner-actions', {
        method: 'POST',
        body: JSON.stringify({ action, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');
      showToast(json.message || successMsg, 'success');
      await loadPosts(page);
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
          style={{
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
            backdropFilter: 'blur(20px)',
          }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <p className="text-sm font-medium text-white">{toast.msg}</p>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4"
            style={{ background: 'rgba(15,15,25,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-white">{confirm.msg}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-slate-400"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={() => { setConfirm(null); confirm.fn(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white">Content Moderation</h1>
        <p className="text-sm mt-1" style={{ color: '#78716c' }}>Review, hide, or delete posts across the platform</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'published', 'hidden'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: filter === f ? '#fbbf24' : '#78716c',
            }}>
            {f}
          </button>
        ))}
        <button onClick={() => loadPosts(page)}
          className="px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ml-auto"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#78716c' }}>
          <Icon name="ArrowPathIcon" size={15} />
        </button>
      </div>

      {/* Posts list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-sm font-bold text-white">Posts</h3>
          <span className="text-xs" style={{ color: '#78716c' }}>{posts.length} shown</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm py-16" style={{ color: '#57534e' }}>No posts found</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {posts.map(post => (
              <div key={post.id} className="px-5 py-4 hover:bg-white/[0.015] transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                        @{post.user_profiles?.username || 'unknown'}
                      </span>
                      <span className="text-xs" style={{ color: '#57534e' }}>{timeAgo(post.created_at)}</span>
                      {!post.is_published && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Hidden</span>
                      )}
                    </div>
                    <p className="text-sm text-white leading-relaxed line-clamp-3">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs flex items-center gap-1" style={{ color: '#57534e' }}>
                        <Icon name="HeartIcon" size={12} /> {post.likes_count}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: '#57534e' }}>
                        <Icon name="ChatBubbleLeftIcon" size={12} /> {post.comments_count}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button disabled={!!actionLoading}
                      onClick={() => doAction(post.is_published ? 'hide_post' : 'show_post', { postId: post.id }, '')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                      {post.is_published ? 'Hide' : 'Show'}
                    </button>
                    <button disabled={!!actionLoading}
                      onClick={() => setConfirm({ msg: 'Delete this post permanently?', fn: () => doAction('delete_post', { postId: post.id }, '') })}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                      style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button disabled={page === 0 || loading}
            onClick={() => { const p = page - 1; setPage(p); loadPosts(p); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
            ← Previous
          </button>
          <span className="text-xs" style={{ color: '#57534e' }}>Page {page + 1}</span>
          <button disabled={posts.length < 20 || loading}
            onClick={() => { const p = page + 1; setPage(p); loadPosts(p); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
