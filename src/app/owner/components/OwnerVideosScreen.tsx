'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface Video {
  id: string;
  title: string | null;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  views_count: number;
  likes_count: number;
  is_published: boolean;
  created_at: string;
  user_id: string | null;
  user_profiles?: { username: string | null; full_name: string | null } | null;
}

function formatDuration(secs: number | null) {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function OwnerVideosScreen() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'unpublished'>('all');
  const [stats, setStats] = useState({ total: 0, published: 0, totalViews: 0, totalLikes: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStats = useCallback(async () => {
    const { data } = await supabase.from('videos').select('is_published, views_count, likes_count');
    if (data) {
      setStats({
        total: data.length,
        published: data.filter(v => v.is_published).length,
        totalViews: data.reduce((s, v) => s + (v.views_count || 0), 0),
        totalLikes: data.reduce((s, v) => s + (v.likes_count || 0), 0),
      });
    }
  }, []);

  const loadVideos = useCallback(async (p = 0, q = '', f = filter) => {
    setLoading(true);
    try {
      let query = supabase
        .from('videos')
        .select('*, user_profiles!videos_user_id_fkey(username, full_name)')
        .order('created_at', { ascending: false })
        .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);

      if (q) query = query.ilike('title', `%${q}%`);
      if (f === 'published') query = query.eq('is_published', true);
      if (f === 'unpublished') query = query.eq('is_published', false);

      const { data, error } = await query;
      if (error) throw error;
      setVideos(data || []);
    } catch {
      showToast('Failed to load videos', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadVideos(0, search, filter);
    loadStats();
    const channel = supabase.channel('owner-videos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        loadVideos(page, search, filter);
        loadStats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const toggleVideo = async (id: string, current: boolean) => {
    setActionLoading(id);
    try {
      const { error } = await supabase.from('videos').update({ is_published: !current }).eq('id', id);
      if (error) throw error;
      setVideos(prev => prev.map(v => v.id === id ? { ...v, is_published: !current } : v));
      showToast(`Video ${!current ? 'published' : 'unpublished'}`, 'success');
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteVideo = async (id: string) => {
    if (!confirm('Delete this video permanently?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      setVideos(prev => prev.filter(v => v.id !== id));
      showToast('Video deleted', 'success');
      loadStats();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Videos</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage all video content</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(192,132,252,0.1)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.2)' }}>
          <Icon name="FilmIcon" size={14} style={{ color: '#c084fc' }} />
          Video Manager
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Videos', value: stats.total, icon: 'FilmIcon', color: '#c084fc' },
          { label: 'Published', value: stats.published, icon: 'PlayCircleIcon', color: '#34d399' },
          { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: 'EyeIcon', color: '#60a5fa' },
          { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), icon: 'HeartIcon', color: '#f87171' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon as any} size={16} style={{ color: s.color }} />
              <span className="text-xs" style={{ color: '#78716c' }}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); setPage(0); loadVideos(0, search, filter); }} className="flex gap-2 flex-1">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search videos..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-stone-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: 'rgba(192,132,252,0.15)', border: '1px solid rgba(192,132,252,0.3)' }}>Search</button>
        </form>
        <div className="flex gap-2">
          {(['all', 'published', 'unpublished'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(0); }}
              className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
              style={{
                background: filter === f ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#c084fc' : '#78716c',
                border: `1px solid ${filter === f ? 'rgba(192,132,252,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}>{f}</button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Video', 'Creator', 'Duration', 'Views', 'Likes', 'Status', 'Added', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#57534e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading...</td></tr>
              ) : videos.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>No videos found</td></tr>
              ) : videos.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(192,132,252,0.1)' }}>
                        <Icon name="FilmIcon" size={16} style={{ color: '#c084fc' }} />
                      </div>
                      <p className="text-sm font-medium text-white truncate max-w-[180px]">{v.title || 'Untitled'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>
                    {v.user_profiles?.username || v.user_profiles?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>{formatDuration(v.duration)}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: '#60a5fa' }}>{(v.views_count || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: '#f87171' }}>{(v.likes_count || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        background: v.is_published ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                        color: v.is_published ? '#34d399' : '#f87171',
                      }}>
                      {v.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#57534e' }}>{timeAgo(v.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleVideo(v.id, v.is_published)} disabled={actionLoading === v.id}
                        className="p-1.5 rounded-lg transition-all hover:bg-white/5">
                        <Icon name={v.is_published ? 'EyeSlashIcon' : 'EyeIcon'} size={15}
                          style={{ color: v.is_published ? '#f87171' : '#34d399' }} />
                      </button>
                      <button onClick={() => deleteVideo(v.id)} disabled={actionLoading === v.id}
                        className="p-1.5 rounded-lg transition-all hover:bg-red-500/10">
                        <Icon name="TrashIcon" size={15} style={{ color: '#f87171' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-xs" style={{ color: '#57534e' }}>Page {page + 1}</span>
          <div className="flex gap-2">
            <button onClick={() => { const p = Math.max(0, page - 1); setPage(p); loadVideos(p, search, filter); }}
              disabled={page === 0} className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#a8a29e' }}>Prev</button>
            <button onClick={() => { const p = page + 1; setPage(p); loadVideos(p, search, filter); }}
              disabled={videos.length < PAGE_SIZE} className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#a8a29e' }}>Next</button>
          </div>
        </div>
      </div>

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
    </div>
  );
}
