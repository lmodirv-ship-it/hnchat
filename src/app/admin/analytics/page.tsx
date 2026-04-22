'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,  } from 'recharts';

interface DailyStats {
  date: string;
  users: number;
  posts: number;
  messages: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2.5 text-xs"
      style={{ background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}>
      <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-300 capitalize">{p.name}:</span>
          <span className="text-white font-semibold">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const supabase = createClient();
  const [stats, setStats] = useState<any>(null);
  const [dailyData, setDailyData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 14 | 30>(30);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, postsRes] = await Promise.all([
        supabase.rpc('get_admin_analytics'),
        supabase
          .from('user_profiles')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()),
        supabase
          .from('posts')
          .select('created_at')
          .gte('created_at', new Date(Date.now() - period * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      if (statsRes.data) setStats(statsRes.data);

      // Build daily chart data
      const days: Record<string, DailyStats> = {};
      for (let i = period - 1; i >= 0; i--) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        days[key] = { date: key, users: 0, posts: 0, messages: 0 };
      }

      usersRes.data?.forEach(u => {
        const key = new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[key]) days[key].users++;
      });

      postsRes.data?.forEach(p => {
        const key = new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (days[key]) days[key].posts++;
      });

      setDailyData(Object.values(days));
    } catch (err) {
      console.error('loadAnalytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const summaryCards = [
    { label: 'Total Users', value: stats?.total_users ?? 0, icon: 'UsersIcon', color: '#00d2ff' },
    { label: 'Active Users', value: stats?.active_users ?? 0, icon: 'UserCircleIcon', color: '#a78bfa' },
    { label: 'Total Posts', value: stats?.total_posts ?? 0, icon: 'DocumentTextIcon', color: '#34d399' },
    { label: 'Pending Reports', value: stats?.pending_reports ?? 0, icon: 'FlagIcon', color: '#f87171' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-500 mt-0.5">Platform growth and activity insights</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {([7, 14, 30] as const).map(d => (
            <button key={d} onClick={() => setPeriod(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                period === d ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              style={period === d ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.25)' } : {}}>
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="rounded-2xl p-4 transition-all hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, ${card.color}12 0%, rgba(255,255,255,0.02) 100%)`,
              border: `1px solid ${card.color}25`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${card.color}18`, border: `1px solid ${card.color}25` }}>
              <Icon name={card.icon as any} size={18} style={{ color: card.color }} />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">{(card.value as number).toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          {/* User Growth Chart */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">User Growth</h3>
                <p className="text-xs text-slate-600 mt-0.5">New registrations over time</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: '#00d2ff' }} />
                  Users
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                  interval={Math.floor(dailyData.length / 6)} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#00d2ff" strokeWidth={2}
                  fill="url(#userGrad)" dot={false} activeDot={{ r: 4, fill: '#00d2ff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Posts Activity Chart */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Post Activity</h3>
                <p className="text-xs text-slate-600 mt-0.5">Daily posts published</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#a78bfa' }} />
                  Posts
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                  interval={Math.floor(dailyData.length / 6)} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="posts" fill="#a78bfa" radius={[4, 4, 0, 0]}
                  maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Combined line chart */}
          <div className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Platform Activity Overview</h3>
                <p className="text-xs text-slate-600 mt-0.5">Users vs Posts comparison</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: '#00d2ff' }} />
                  Users
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 rounded-full inline-block" style={{ background: '#34d399' }} />
                  Posts
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={dailyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false}
                  interval={Math.floor(dailyData.length / 6)} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="users" stroke="#00d2ff" strokeWidth={2}
                  dot={false} activeDot={{ r: 4 }} />
                <Line type="monotone" dataKey="posts" stroke="#34d399" strokeWidth={2}
                  dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
