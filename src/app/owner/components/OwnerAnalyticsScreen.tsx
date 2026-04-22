'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface DailyStats {
  date: string;
  users: number;
  posts: number;
  videos: number;
}

export default function OwnerAnalyticsScreen() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0, totalPosts: 0, totalVideos: 0, totalMessages: 0,
    totalProducts: 0, totalSubscriptions: 0, pendingReports: 0, totalLikes: 0,
  });
  const [chartData, setChartData] = useState<DailyStats[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [
        usersRes, postsRes, videosRes, messagesRes,
        productsRes, subsRes, reportsRes, likesRes, topUsersRes,
      ] = await Promise.all([
        supabase.from('user_profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('posts').select('id, created_at', { count: 'exact' }),
        supabase.from('videos').select('id, created_at', { count: 'exact' }),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
        supabase.from('marketplace_products').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('likes').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id, username, full_name, followers_count, posts_count').order('followers_count', { ascending: false }).limit(5),
      ]);

      setStats({
        totalUsers: usersRes.count ?? 0,
        totalPosts: postsRes.count ?? 0,
        totalVideos: videosRes.count ?? 0,
        totalMessages: messagesRes.count ?? 0,
        totalProducts: productsRes.count ?? 0,
        totalSubscriptions: subsRes.count ?? 0,
        pendingReports: reportsRes.count ?? 0,
        totalLikes: likesRes.count ?? 0,
      });

      setTopUsers(topUsersRes.data || []);

      // Build chart data from users and posts by day (last 7 days)
      const now = Date.now();
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now - (6 - i) * 86400000);
        return d.toISOString().split('T')[0];
      });

      const usersData = usersRes.data || [];
      const postsData = postsRes.data || [];
      const videosData = videosRes.data || [];

      const chart: DailyStats[] = days.map(date => ({
        date: date.slice(5),
        users: usersData.filter(u => u.created_at?.startsWith(date)).length,
        posts: postsData.filter(p => p.created_at?.startsWith(date)).length,
        videos: videosData.filter(v => v.created_at?.startsWith(date)).length,
      }));
      setChartData(chart);

      // Recent activity from posts
      const { data: recent } = await supabase
        .from('posts')
        .select('id, content, created_at, user_profiles!posts_user_id_fkey(username)')
        .order('created_at', { ascending: false })
        .limit(8);
      setRecentActivity(recent || []);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAnalytics(); }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'UsersIcon', color: '#a78bfa', change: '+' },
    { label: 'Total Posts', value: stats.totalPosts, icon: 'DocumentTextIcon', color: '#34d399', change: '+' },
    { label: 'Videos', value: stats.totalVideos, icon: 'FilmIcon', color: '#c084fc', change: '+' },
    { label: 'Messages', value: stats.totalMessages, icon: 'ChatBubbleLeftRightIcon', color: '#60a5fa', change: '+' },
    { label: 'Products', value: stats.totalProducts, icon: 'ShoppingBagIcon', color: '#6ee7b7', change: '+' },
    { label: 'Subscriptions', value: stats.totalSubscriptions, icon: 'CreditCardIcon', color: '#fbbf24', change: '+' },
    { label: 'Pending Reports', value: stats.pendingReports, icon: 'FlagIcon', color: '#f87171', change: '' },
    { label: 'Total Likes', value: stats.totalLikes, icon: 'HeartIcon', color: '#fb923c', change: '+' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Platform-wide performance metrics</p>
        </div>
        <button onClick={loadAnalytics} disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Icon name="ArrowPathIcon" size={14} style={{ color: '#fbbf24' }} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="rounded-2xl p-4 transition-all hover:bg-white/[0.04]"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${s.color}15` }}>
                <Icon name={s.icon as any} size={16} style={{ color: s.color }} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
            <p className="text-xs mt-1" style={{ color: '#78716c' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">User & Post Growth (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#57534e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#57534e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
              <Area type="monotone" dataKey="users" stroke="#a78bfa" fill="url(#usersGrad)" strokeWidth={2} name="Users" />
              <Area type="monotone" dataKey="posts" stroke="#34d399" fill="url(#postsGrad)" strokeWidth={2} name="Posts" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Video Uploads (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#57534e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#57534e', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0f0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
              <Bar dataKey="videos" fill="#c084fc" radius={[4, 4, 0, 0]} name="Videos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Users + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Top Users by Followers</h3>
          <div className="space-y-3">
            {topUsers.length === 0 ? (
              <p className="text-sm" style={{ color: '#57534e' }}>No data</p>
            ) : topUsers.map((u, i) => (
              <div key={u.id} className="flex items-center gap-3">
                <span className="text-xs font-bold w-5 text-center" style={{ color: '#57534e' }}>#{i + 1}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                  {(u.username || u.full_name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{u.username || u.full_name || 'Unknown'}</p>
                  <p className="text-xs" style={{ color: '#57534e' }}>{u.posts_count || 0} posts</p>
                </div>
                <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>{(u.followers_count || 0).toLocaleString()} followers</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-sm" style={{ color: '#57534e' }}>No recent activity</p>
            ) : recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(52,211,153,0.1)' }}>
                  <Icon name="DocumentTextIcon" size={13} style={{ color: '#34d399' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{a.content?.substring(0, 60) || 'Post'}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#57534e' }}>
                    by @{a.user_profiles?.username || 'unknown'} · {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
