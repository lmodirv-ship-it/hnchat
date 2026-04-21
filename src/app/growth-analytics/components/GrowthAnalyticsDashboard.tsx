'use client';
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

import { trackEvent } from '@/lib/analytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,  } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface TopVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  shares: number;
  watch_time: number;
  creator: string;
}

interface TopUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  followers_count: number;
  posts_count: number;
  engagement_rate: number;
}

interface FunnelStep {
  label: string;
  value: number;
  icon: string;
  color: string;
  event: string;
}

// ─── Mock data (replace with Supabase queries when tables are ready) ──────────
const GROWTH_DATA = [
  { day: 'Mon', users: 120, sessions: 340, shares: 45 },
  { day: 'Tue', users: 185, sessions: 420, shares: 72 },
  { day: 'Wed', users: 210, sessions: 510, shares: 88 },
  { day: 'Thu', users: 175, sessions: 390, shares: 61 },
  { day: 'Fri', users: 290, sessions: 680, shares: 130 },
  { day: 'Sat', users: 380, sessions: 870, shares: 195 },
  { day: 'Sun', users: 440, sessions: 1020, shares: 240 },
];

const RETENTION_DATA = [
  { label: 'Day 1', rate: 68 },
  { label: 'Day 3', rate: 52 },
  { label: 'Day 7', rate: 38 },
  { label: 'Day 14', rate: 29 },
  { label: 'Day 30', rate: 21 },
];

const TOP_VIDEOS_MOCK: TopVideo[] = [
  { id: '1', title: 'How to build a viral app in 7 days', thumbnail: 'https://picsum.photos/seed/v1/120/68', views: 24800, likes: 3200, shares: 870, watch_time: 82, creator: 'sara.nova' },
  { id: '2', title: 'hnChat AI features explained', thumbnail: 'https://picsum.photos/seed/v2/120/68', views: 18400, likes: 2100, shares: 540, watch_time: 74, creator: 'karim.dev' },
  { id: '3', title: 'Crypto trading tips 2026', thumbnail: 'https://picsum.photos/seed/v3/120/68', views: 15200, likes: 1800, shares: 420, watch_time: 68, creator: 'youssef.trade' },
  { id: '4', title: 'Morning routine that changed my life', thumbnail: 'https://picsum.photos/seed/v4/120/68', views: 12900, likes: 1600, shares: 310, watch_time: 91, creator: 'fatima.life' },
  { id: '5', title: 'hnShop marketplace walkthrough', thumbnail: 'https://picsum.photos/seed/v5/120/68', views: 9700, likes: 1100, shares: 220, watch_time: 63, creator: 'admin.hn' },
];

const TOP_USERS_MOCK: TopUser[] = [
  { id: '1', username: 'sara.nova', full_name: 'Sara Nova', avatar_url: 'https://i.pravatar.cc/48?img=5', followers_count: 12400, posts_count: 87, engagement_rate: 8.4 },
  { id: '2', username: 'karim.dev', full_name: 'Karim Dev', avatar_url: 'https://i.pravatar.cc/48?img=12', followers_count: 9800, posts_count: 64, engagement_rate: 7.1 },
  { id: '3', username: 'youssef.trade', full_name: 'Youssef Trade', avatar_url: 'https://i.pravatar.cc/48?img=15', followers_count: 7200, posts_count: 52, engagement_rate: 6.3 },
  { id: '4', username: 'fatima.life', full_name: 'Fatima Life', avatar_url: 'https://i.pravatar.cc/48?img=9', followers_count: 5600, posts_count: 41, engagement_rate: 9.2 },
  { id: '5', username: 'adam.creator', full_name: 'Adam Creator', avatar_url: 'https://i.pravatar.cc/48?img=20', followers_count: 4100, posts_count: 33, engagement_rate: 5.8 },
];

const FUNNEL_STEPS: FunnelStep[] = [
  { label: 'Visit', value: 10000, icon: 'EyeIcon', color: '#00d2ff', event: 'funnel_visit' },
  { label: 'Sign Up', value: 3200, icon: 'UserPlusIcon', color: '#9b59ff', event: 'funnel_signup' },
  { label: 'Watch', value: 2100, icon: 'PlayCircleIcon', color: '#f59e0b', event: 'funnel_watch' },
  { label: 'Like', value: 1400, icon: 'HeartIcon', color: '#f43f5e', event: 'funnel_like' },
  { label: 'Share', value: 680, icon: 'ShareIcon', color: '#10b981', event: 'funnel_share' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function StatCard({ label, value, icon, color, delta }: { label: string; value: string; icon: string; color: string; delta?: string }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
          <Icon name={icon} size={16} color={color} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {delta && (
        <div className="flex items-center gap-1 text-xs" style={{ color: '#10b981' }}>
          <Icon name="ArrowTrendingUpIcon" size={12} color="#10b981" />
          {delta}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function GrowthAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'users' | 'funnel'>('overview');
  const [shareModal, setShareModal] = useState<TopVideo | null>(null);

  useEffect(() => {
    trackEvent('page_view_growth_analytics', { page: 'growth_analytics' });
  }, []);

  const handleShare = (video: TopVideo, platform: string) => {
    trackEvent('viral_share', { video_id: video.id, platform, video_title: video.title });
    const url = `https://hnchat.net/video/${video.id}`;
    const text = `Check out this video on hnChat: ${video.title}`;
    const links: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    };
    if (links[platform]) window.open(links[platform], '_blank');
    setShareModal(null);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ChartBarIcon' },
    { id: 'videos', label: 'Top Videos', icon: 'PlayCircleIcon' },
    { id: 'users', label: 'Top Users', icon: 'UsersIcon' },
    { id: 'funnel', label: 'Funnel', icon: 'FunnelIcon' },
  ] as const;

  return (
    <AppLayout>
      <div className="min-h-screen p-4 md:p-6" style={{ background: 'transparent' }}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00d2ff,#9b59ff)' }}>
              <Icon name="ChartBarIcon" size={20} color="#fff" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Growth Analytics</h1>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Real-time data · Pre-Viral Stage 🟢</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: activeTab === t.id ? 'linear-gradient(135deg,#00d2ff22,#9b59ff22)' : 'rgba(255,255,255,0.04)',
                border: activeTab === t.id ? '1px solid rgba(0,210,255,0.35)' : '1px solid rgba(255,255,255,0.07)',
                color: activeTab === t.id ? '#00d2ff' : 'rgba(255,255,255,0.55)',
              }}
            >
              <Icon name={t.icon} size={14} color={activeTab === t.id ? '#00d2ff' : 'rgba(255,255,255,0.45)'} />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Total Users" value="4,820" icon="UsersIcon" color="#00d2ff" delta="+18% this week" />
              <StatCard label="Growth Rate" value="+24%" icon="ArrowTrendingUpIcon" color="#10b981" delta="+6% vs last week" />
              <StatCard label="Avg Session" value="14m 32s" icon="ClockIcon" color="#f59e0b" delta="+2m 10s" />
              <StatCard label="Viral Shares" value="2,340" icon="ShareIcon" color="#f43f5e" delta="+41% this week" />
            </div>

            {/* Growth Chart */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-semibold text-white mb-4">Weekly Growth</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={GROWTH_DATA}>
                  <defs>
                    <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gShares" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                  <Area type="monotone" dataKey="users" stroke="#00d2ff" strokeWidth={2} fill="url(#gUsers)" name="New Users" />
                  <Area type="monotone" dataKey="shares" stroke="#10b981" strokeWidth={2} fill="url(#gShares)" name="Shares" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Retention */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-semibold text-white mb-4">Retention Rate</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={RETENTION_DATA} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v: any) => [`${v}%`, 'Retention']} />
                  <Bar dataKey="rate" fill="url(#retGrad)" radius={[6, 6, 0, 0]}>
                    <defs>
                      <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#9b59ff" />
                        <stop offset="100%" stopColor="#00d2ff" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-3">
                {RETENTION_DATA.map(r => (
                  <div key={r.label} className="text-center">
                    <div className="text-sm font-bold" style={{ color: r.rate >= 50 ? '#10b981' : r.rate >= 30 ? '#f59e0b' : '#f43f5e' }}>{r.rate}%</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TOP VIDEOS ── */}
        {activeTab === 'videos' && (
          <div className="space-y-3">
            {TOP_VIDEOS_MOCK.map((video, i) => (
              <div
                key={video.id}
                className="rounded-2xl p-4 flex gap-4 items-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-lg font-bold w-6 text-center" style={{ color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>#{i + 1}</div>
                <div className="relative w-20 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <AppImage src={video.thumbnail} alt={video.title} fill className="object-cover" sizes="80px" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{video.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>@{video.creator}</div>
                  <div className="flex gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <Icon name="EyeIcon" size={11} color="rgba(255,255,255,0.4)" />{formatNum(video.views)}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#f43f5e' }}>
                      <Icon name="HeartIcon" size={11} color="#f43f5e" />{formatNum(video.likes)}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#10b981' }}>
                      <Icon name="ShareIcon" size={11} color="#10b981" />{formatNum(video.shares)}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#f59e0b' }}>
                      <Icon name="ClockIcon" size={11} color="#f59e0b" />{video.watch_time}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => { setShareModal(video); trackEvent('share_button_click', { video_id: video.id }); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg,#00d2ff22,#9b59ff22)', border: '1px solid rgba(0,210,255,0.3)', color: '#00d2ff' }}
                >
                  <Icon name="ShareIcon" size={12} color="#00d2ff" />
                  Share
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── TOP USERS ── */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {TOP_USERS_MOCK.map((user, i) => (
              <div
                key={user.id}
                className="rounded-2xl p-4 flex gap-4 items-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-lg font-bold w-6 text-center" style={{ color: i === 0 ? '#f59e0b' : 'rgba(255,255,255,0.3)' }}>#{i + 1}</div>
                <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0">
                  <AppImage src={user.avatar_url} alt={user.full_name} fill className="object-cover" sizes="44px" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{user.full_name}</div>
                  <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>@{user.username}</div>
                  <div className="flex gap-3 mt-1.5">
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <Icon name="UsersIcon" size={11} color="rgba(255,255,255,0.4)" />{formatNum(user.followers_count)}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#9b59ff' }}>
                      <Icon name="DocumentTextIcon" size={11} color="#9b59ff" />{user.posts_count} posts
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#10b981' }}>
                      <Icon name="ArrowTrendingUpIcon" size={11} color="#10b981" />{user.engagement_rate}% eng.
                    </span>
                  </div>
                </div>
                <div
                  className="px-2.5 py-1 rounded-lg text-xs font-bold"
                  style={{ background: user.engagement_rate >= 8 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: user.engagement_rate >= 8 ? '#10b981' : '#f59e0b' }}
                >
                  {user.engagement_rate >= 8 ? '🔥 Hot' : '📈 Rising'}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FUNNEL ── */}
        {activeTab === 'funnel' && (
          <div className="space-y-4">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-semibold text-white mb-5">User Journey Funnel</h3>
              <div className="space-y-3">
                {FUNNEL_STEPS.map((step, i) => {
                  const pct = Math.round((step.value / FUNNEL_STEPS[0].value) * 100);
                  const dropoff = i > 0 ? Math.round(((FUNNEL_STEPS[i - 1].value - step.value) / FUNNEL_STEPS[i - 1].value) * 100) : 0;
                  return (
                    <div key={step.label}>
                      {i > 0 && (
                        <div className="flex items-center gap-2 py-1 px-3">
                          <Icon name="ArrowDownIcon" size={12} color="rgba(255,255,255,0.2)" />
                          <span className="text-xs" style={{ color: dropoff > 50 ? '#f43f5e' : 'rgba(255,255,255,0.35)' }}>
                            -{dropoff}% drop-off
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${step.color}22` }}>
                          <Icon name={step.icon} size={15} color={step.color} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-medium text-white">{step.label}</span>
                            <span className="text-xs font-bold" style={{ color: step.color }}>{formatNum(step.value)} ({pct}%)</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${step.color}, ${step.color}88)` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Viral Loop Diagram */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-semibold text-white mb-4">🔥 Viral Loop</h3>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {['Watch', '→', 'Like', '→', 'Share', '→', 'New User', '→', 'Watch'].map((item, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl"
                    style={item === '→' ? { color: 'rgba(255,255,255,0.3)' } : {
                      background: 'linear-gradient(135deg,rgba(0,210,255,0.12),rgba(155,89,255,0.12))',
                      border: '1px solid rgba(0,210,255,0.2)',
                      color: '#00d2ff',
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
                  <div className="text-lg font-bold" style={{ color: '#10b981' }}>6.8%</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Share Rate</div>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div className="text-lg font-bold" style={{ color: '#f59e0b' }}>1.24</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Viral Coeff.</div>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)' }}>
                  <div className="text-lg font-bold" style={{ color: '#00d2ff' }}>38%</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>D7 Retention</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Share Modal ── */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: 'linear-gradient(135deg,rgba(13,13,26,0.98),rgba(20,20,40,0.98))', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Share Video 🔥</h3>
              <button onClick={() => setShareModal(null)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Icon name="XMarkIcon" size={16} color="rgba(255,255,255,0.6)" />
              </button>
            </div>
            <p className="text-xs mb-5 truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{shareModal.title}</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: 'ChatBubbleLeftRightIcon', color: '#25d366' },
                { id: 'twitter', label: 'Twitter/X', icon: 'HashtagIcon', color: '#1da1f2' },
                { id: 'telegram', label: 'Telegram', icon: 'PaperAirplaneIcon', color: '#0088cc' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => handleShare(shareModal, p.id)}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105"
                  style={{ background: `${p.color}18`, border: `1px solid ${p.color}33` }}
                >
                  <Icon name={p.icon} size={22} color={p.color} />
                  <span className="text-xs font-medium" style={{ color: p.color }}>{p.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="text-xs flex-1 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                https://hnchat.net/video/{shareModal.id}
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(`https://hnchat.net/video/${shareModal.id}`); trackEvent('copy_link', { video_id: shareModal.id }); }}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ background: 'rgba(0,210,255,0.15)', color: '#00d2ff' }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
