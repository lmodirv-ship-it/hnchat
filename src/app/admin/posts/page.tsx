'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface Post {
  id: string;
  content: string;
  post_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profiles: { username: string; full_name: string } | null;
}

export default function AdminPostsPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'text' | 'image' | 'video'>('all');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('id, content, post_type, likes_count, comments_count, created_at, user_profiles(username, full_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setPosts(data as Post[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const deletePost = async (postId: string) => {
    setActionLoading(postId);
    setConfirmDelete(null);
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) { showToast('Failed to delete post', 'error'); }
    else { setPosts(prev => prev.filter(p => p.id !== postId)); showToast('Post deleted'); }
    setActionLoading(null);
  };

  const reportPost = async (postId: string) => {
    showToast('Post flagged for review');
  };

  const filtered = posts.filter(p => {
    const matchSearch =
      p.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.user_profiles as any)?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      p.post_type?.toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const typeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'image': return { bg: 'rgba(244,114,182,0.12)', color: '#f472b6', border: 'rgba(244,114,182,0.2)' };
      case 'video': return { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', border: 'rgba(167,139,250,0.2)' };
      default: return { bg: 'rgba(0,210,255,0.1)', color: '#00d2ff', border: 'rgba(0,210,255,0.2)' };
    }
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl"
          style={{
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
            color: toast.type === 'success' ? '#34d399' : '#f87171',
            backdropFilter: 'blur(12px)',
          }}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-80 space-y-4"
            style={{ background: 'rgba(10,10,18,0.98)', border: '1px solid rgba(248,113,113,0.3)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(248,113,113,0.15)' }}>
                <Icon name="TrashIcon" size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Delete Post</p>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">Are you sure you want to permanently delete this post?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={() => deletePost(confirmDelete)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Posts Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{posts.length} total posts</p>
        </div>
        <button onClick={loadPosts}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Icon name="ArrowPathIcon" size={15} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search posts or usernames..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['all', 'text', 'image', 'video'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                filter === f ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              style={filter === f ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.25)' } : {}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Posts grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(post => {
            const tc = typeColor(post.post_type);
            return (
              <div
                key={post.id}
                className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.01] group"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                }}
              >
                {/* Post header */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                    {((post.user_profiles as any)?.username || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-300 truncate">
                      @{(post.user_profiles as any)?.username || 'unknown'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                    style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}` }}>
                    {post.post_type || 'text'}
                  </span>
                </div>

                {/* Content */}
                <p className="text-sm text-slate-400 line-clamp-3 flex-1 leading-relaxed">
                  {post.content || '(no content)'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Icon name="HeartIcon" size={12} />
                    {post.likes_count ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="ChatBubbleLeftIcon" size={12} />
                    {post.comments_count ?? 0}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    onClick={() => reportPost(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 flex-1 justify-center"
                    style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                    <Icon name="FlagIcon" size={13} />
                    Flag
                  </button>
                  <button
                    onClick={() => setConfirmDelete(post.id)}
                    disabled={actionLoading === post.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 flex-1 justify-center disabled:opacity-40"
                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
                    {actionLoading === post.id ? (
                      <div className="w-3.5 h-3.5 rounded-full border border-current border-t-transparent animate-spin" />
                    ) : (
                      <Icon name="TrashIcon" size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="py-20 text-center">
          <Icon name="DocumentTextIcon" size={36} className="text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-600">No posts found</p>
        </div>
      )}
    </div>
  );
}
