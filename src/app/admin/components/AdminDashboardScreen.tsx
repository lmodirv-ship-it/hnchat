'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_posts: number;
  total_videos: number;
  total_messages: number;
  pending_reports: number;
  new_users_today: number;
  new_posts_today: number;
}

const statCards = (stats: AdminStats | null) => [
  {
    label: 'Total Users',
    value: stats?.total_users ?? 0,
    icon: 'UsersIcon',
    color: '#00d2ff',
    glow: 'rgba(0,210,255,0.15)',
    border: 'rgba(0,210,255,0.2)',
    change: `+${stats?.new_users_today ?? 0} today`,
    trend: 'up',
  },
  {
    label: 'Active Users',
    value: stats?.active_users ?? 0,
    icon: 'UserCircleIcon',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    border: 'rgba(167,139,250,0.2)',
    change: 'Currently active',
    trend: 'up',
  },
  {
    label: 'Total Posts',
    value: stats?.total_posts ?? 0,
    icon: 'DocumentTextIcon',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.15)',
    border: 'rgba(52,211,153,0.2)',
    change: `+${stats?.new_posts_today ?? 0} today`,
    trend: 'up',
  },
  {
    label: 'Total Videos',
    value: stats?.total_videos ?? 0,
    icon: 'FilmIcon',
    color: '#f472b6',
    glow: 'rgba(244,114,182,0.15)',
    border: 'rgba(244,114,182,0.2)',
    change: 'Published',
    trend: 'neutral',
  },
  {
    label: 'Messages',
    value: stats?.total_messages ?? 0,
    icon: 'ChatBubbleLeftRightIcon',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.15)',
    border: 'rgba(251,146,60,0.2)',
    change: 'All time',
    trend: 'neutral',
  },
  {
    label: 'Pending Reports',
    value: stats?.pending_reports ?? 0,
    icon: 'FlagIcon',
    color: '#f87171',
    glow: 'rgba(248,113,113,0.15)',
    border: 'rgba(248,113,113,0.2)',
    change: 'Needs review',
    trend: 'down',
  },
];

export default function AdminDashboardScreen() {
  const supabase = createClient();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, postsRes] = await Promise.all([
        supabase.rpc('get_admin_analytics'),
        supabase
          .from('user_profiles')
          .select('id, username, full_name, avatar_url, is_active, is_admin, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('posts')
          .select('id, content, post_type, likes_count, created_at, user_profiles(username)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      if (statsRes.data) setStats(statsRes.data as AdminStats);
      if (usersRes.data) setRecentUsers(usersRes.data);
      if (postsRes.data) setRecentPosts(postsRes.data as any[]);
    } catch (err) {
      console.error('loadData error:', err);
    } finally {
      setLoading(false);
    }
  };

  const cards = statCards(stats);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back — here's what's happening on hnChat</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all duration-200"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <Icon name="ArrowPathIcon" size={15} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] cursor-default group"
              style={{
                background: `linear-gradient(135deg, ${card.glow} 0%, rgba(255,255,255,0.02) 100%)`,
                border: `1px solid ${card.border}`,
                boxShadow: `0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: card.glow, border: `1px solid ${card.border}` }}
                >
                  <Icon name={card.icon as any} size={20} style={{ color: card.color }} />
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: card.trend === 'up' ? 'rgba(52,211,153,0.12)' : card.trend === 'down' ? 'rgba(248,113,113,0.12)' : 'rgba(255,255,255,0.06)',
                    color: card.trend === 'up' ? '#34d399' : card.trend === 'down' ? '#f87171' : '#94a3b8',
                  }}>
                  {card.change}
                </span>
              </div>
              <div className="text-3xl font-bold text-white tabular-nums mb-1"
                style={{ textShadow: `0 0 20px ${card.color}30` }}>
                {card.value.toLocaleString()}
              </div>
              <div className="text-sm font-medium text-slate-400">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom grid: recent users + recent posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="text-sm font-semibold text-slate-200">Recent Users</h3>
            <a href="/admin/users" className="text-xs font-medium transition-colors hover:text-white"
              style={{ color: '#00d2ff' }}>View all →</a>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                  {(u.full_name || u.username || 'U')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{u.full_name || u.username || 'Unknown'}</p>
                  <p className="text-xs text-slate-600 truncate">@{u.username}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {u.is_admin && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                      style={{ background: 'rgba(0,210,255,0.15)', color: '#00d2ff' }}>Admin</span>
                  )}
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={u.is_active
                      ? { background: 'rgba(52,211,153,0.12)', color: '#34d399' }
                      : { background: 'rgba(248,113,113,0.12)', color: '#f87171' }}>
                    {u.is_active ? 'Active' : 'Banned'}
                  </span>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && !loading && (
              <div className="py-8 text-center text-sm text-slate-600">No users yet</div>
            )}
          </div>
        </div>

        {/* Recent Posts */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="text-sm font-semibold text-slate-200">Recent Posts</h3>
            <a href="/admin/posts" className="text-xs font-medium transition-colors hover:text-white"
              style={{ color: '#00d2ff' }}>View all →</a>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {recentPosts.map((p) => (
              <div key={p.id} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-slate-400">
                    @{(p.user_profiles as any)?.username || 'unknown'}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff' }}>
                    {p.post_type}
                  </span>
                  <span className="text-xs text-slate-600 ml-auto">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-1">{p.content || '(no content)'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-600">❤️ {p.likes_count ?? 0}</span>
                </div>
              </div>
            ))}
            {recentPosts.length === 0 && !loading && (
              <div className="py-8 text-center text-sm text-slate-600">No posts yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
