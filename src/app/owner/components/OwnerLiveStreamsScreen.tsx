'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface LiveStream {
  id: string;
  title: string | null;
  description: string | null;
  is_live: boolean;
  viewer_count: number;
  created_at: string;
  user_id: string | null;
  user_profiles?: { username: string | null; full_name: string | null } | null;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function OwnerLiveStreamsScreen() {
  const supabase = createClient();
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'live' | 'ended'>('all');
  const [stats, setStats] = useState({ total: 0, live: 0, totalViewers: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadStreams = useCallback(async (f = filter) => {
    setLoading(true);
    try {
      let query = supabase
        .from('videos')
        .select('*, user_profiles!videos_user_id_fkey(username, full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (error) throw error;
      // Use videos table as proxy for live streams (filter by title containing "live" or use all)
      const mapped: LiveStream[] = (data || []).map(v => ({
        id: v.id,
        title: v.title,
        description: v.description,
        is_live: false,
        viewer_count: v.views_count || 0,
        created_at: v.created_at,
        user_id: v.user_id,
        user_profiles: v.user_profiles,
      }));
      const filtered = f === 'live' ? mapped.filter(s => s.is_live) : f === 'ended' ? mapped.filter(s => !s.is_live) : mapped;
      setStreams(filtered);
      setStats({
        total: mapped.length,
        live: mapped.filter(s => s.is_live).length,
        totalViewers: mapped.reduce((s, v) => s + v.viewer_count, 0),
      });
    } catch {
      showToast('Failed to load streams', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadStreams(filter);
    const channel = supabase.channel('owner-live-streams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => loadStreams(filter))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const endStream = async (id: string) => {
    if (!confirm('Force end this stream?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('videos').update({ is_published: false }).eq('id', id);
      if (error) throw error;
      showToast('Stream ended', 'success');
      loadStreams(filter);
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteStream = async (id: string) => {
    if (!confirm('Delete this stream record?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('videos').delete().eq('id', id);
      if (error) throw error;
      setStreams(prev => prev.filter(s => s.id !== id));
      showToast('Stream deleted', 'success');
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
          <h1 className="text-2xl font-bold text-white">Live Streams</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Monitor and manage live broadcasts</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          Live Monitor
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Streams', value: stats.total, icon: 'VideoCameraIcon', color: '#67e8f9' },
          { label: 'Currently Live', value: stats.live, icon: 'SignalIcon', color: '#f87171' },
          { label: 'Total Viewers', value: stats.totalViewers.toLocaleString(), icon: 'UsersIcon', color: '#fbbf24' },
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

      <div className="flex gap-2">
        {(['all', 'live', 'ended'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(103,232,249,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#67e8f9' : '#78716c',
              border: `1px solid ${filter === f ? 'rgba(103,232,249,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>{f}</button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Stream', 'Broadcaster', 'Viewers', 'Status', 'Started', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#57534e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading...</td></tr>
              ) : streams.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>No streams found</td></tr>
              ) : streams.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: s.is_live ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.05)' }}>
                        <Icon name="VideoCameraIcon" size={16} style={{ color: s.is_live ? '#f87171' : '#57534e' }} />
                      </div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{s.title || 'Untitled Stream'}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>
                    {s.user_profiles?.username || s.user_profiles?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: '#fbbf24' }}>{s.viewer_count.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-fit"
                      style={{
                        background: s.is_live ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.05)',
                        color: s.is_live ? '#f87171' : '#78716c',
                      }}>
                      {s.is_live && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
                      {s.is_live ? 'LIVE' : 'Ended'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#57534e' }}>{timeAgo(s.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {s.is_live && (
                        <button onClick={() => endStream(s.id)} disabled={actionLoading === s.id}
                          className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                          End
                        </button>
                      )}
                      <button onClick={() => deleteStream(s.id)} disabled={actionLoading === s.id}
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
