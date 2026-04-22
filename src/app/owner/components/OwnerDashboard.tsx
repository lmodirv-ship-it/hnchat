'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

const OWNER_EMAIL = 'lmodirv@gmail.com';

interface SiteStats {
  total_users: number;
  total_posts: number;
  total_videos: number;
  total_messages: number;
  new_users_today: number;
  new_posts_today: number;
  pending_reports: number;
  total_products: number;
}

interface RecentUser {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  is_verified: boolean;
}

interface RecentPost {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_profiles: { username: string | null; full_name: string | null } | null;
}

const managementSections = [
  {
    title: 'Core Management',
    items: [
      { label: 'Admin Dashboard', icon: 'ChartBarSquareIcon', href: '/admin', color: '#00d2ff', desc: 'Main control panel' },
      { label: 'Manage Users', icon: 'UsersIcon', href: '/admin/users', color: '#a78bfa', desc: 'Ban, delete, promote' },
      { label: 'Manage Posts', icon: 'DocumentTextIcon', href: '/admin/posts', color: '#34d399', desc: 'Moderate content' },
      { label: 'Reports', icon: 'FlagIcon', href: '/admin/reports', color: '#f87171', desc: 'Review flagged content' },
    ],
  },
  {
    title: 'Analytics & Growth',
    items: [
      { label: 'Analytics', icon: 'PresentationChartLineIcon', href: '/admin/analytics', color: '#fb923c', desc: 'Traffic & engagement' },
      { label: 'Growth Analytics', icon: 'ArrowTrendingUpIcon', href: '/growth-analytics', color: '#4ade80', desc: 'Growth metrics' },
      { label: 'Monitoring', icon: 'ServerIcon', href: '/monitoring', color: '#f472b6', desc: 'System health' },
      { label: 'Push Strategy', icon: 'BellIcon', href: '/push-strategy', color: '#fbbf24', desc: 'Notification campaigns' },
    ],
  },
  {
    title: 'Marketing & Revenue',
    items: [
      { label: 'Email Dashboard', icon: 'EnvelopeIcon', href: '/email-dashboard', color: '#60a5fa', desc: 'Email campaigns' },
      { label: 'Ads Manager', icon: 'MegaphoneIcon', href: '/ads-manager', color: '#e879f9', desc: 'Ad campaigns' },
      { label: 'Ads & Promo', icon: 'SparklesIcon', href: '/ads-promo', color: '#fde68a', desc: 'Promotions' },
      { label: 'Marketplace', icon: 'ShoppingBagIcon', href: '/marketplace', color: '#6ee7b7', desc: 'Product listings' },
    ],
  },
  {
    title: 'Platform Features',
    items: [
      { label: 'Home Feed', icon: 'HomeIcon', href: '/home-feed', color: '#94a3b8', desc: 'Main social feed' },
      { label: 'Short Videos', icon: 'FilmIcon', href: '/short-videos', color: '#c084fc', desc: 'Video content' },
      { label: 'Voice Rooms', icon: 'MicrophoneIcon', href: '/voice-rooms', color: '#67e8f9', desc: 'Live audio' },
      { label: 'AI Assistant', icon: 'CpuChipIcon', href: '/ai-assistant', color: '#86efac', desc: 'AI features' },
    ],
  },
];

const ownerPrivileges = [
  { icon: '🛡️', title: 'Deletion Protection', desc: 'Cannot be deleted by any admin or system process', color: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  { icon: '👑', title: 'Permanent Admin', desc: 'Admin status is irrevocable and permanent', color: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  { icon: '🔓', title: 'Password-Free Login', desc: 'Secure magic link — no password ever needed', color: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  { icon: '⚡', title: 'Full Site Control', desc: 'Unrestricted access to every panel and feature', color: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    setCurrentTime(new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkOwnerAccess();
  }, []);

  const checkOwnerAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.replace('/owner-login'); return; }
    if (session.user.email !== OWNER_EMAIL) { router.replace('/home-feed'); return; }
    await fetch('/api/owner-setup', { method: 'POST' });
    await loadAllData();
    setLoading(false);
  };

  const loadAllData = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usersRes, postsRes, videosRes, messagesRes, newUsersRes, newPostsRes, reportsRes, productsRes, recentUsersRes, recentPostsRes] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('videos').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('marketplace_products').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id, full_name, username, avatar_url, created_at, is_verified').order('created_at', { ascending: false }).limit(6),
      supabase.from('posts').select('id, content, created_at, likes_count, comments_count, user_profiles(username, full_name)').order('created_at', { ascending: false }).limit(6),
    ]);

    setStats({
      total_users: usersRes.count ?? 0,
      total_posts: postsRes.count ?? 0,
      total_videos: videosRes.count ?? 0,
      total_messages: messagesRes.count ?? 0,
      new_users_today: newUsersRes.count ?? 0,
      new_posts_today: newPostsRes.count ?? 0,
      pending_reports: reportsRes.count ?? 0,
      total_products: productsRes.count ?? 0,
    });
    setRecentUsers((recentUsersRes.data as RecentUser[]) || []);
    setRecentPosts((recentPostsRes.data as any[]) || []);
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-up-login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#050508' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border border-yellow-600 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>Verifying owner access...</p>
        </div>
      </div>
    );
  }

  const primaryStats = [
    { label: 'Total Users', value: stats?.total_users ?? 0, sub: `+${stats?.new_users_today ?? 0} today`, icon: 'UsersIcon', color: '#fbbf24', glow: 'rgba(251,191,36,0.2)' },
    { label: 'Total Posts', value: stats?.total_posts ?? 0, sub: `+${stats?.new_posts_today ?? 0} today`, icon: 'DocumentTextIcon', color: '#34d399', glow: 'rgba(52,211,153,0.15)' },
    { label: 'Total Videos', value: stats?.total_videos ?? 0, sub: 'Published', icon: 'FilmIcon', color: '#f472b6', glow: 'rgba(244,114,182,0.15)' },
    { label: 'Messages', value: stats?.total_messages ?? 0, sub: 'All time', icon: 'ChatBubbleLeftRightIcon', color: '#60a5fa', glow: 'rgba(96,165,250,0.15)' },
    { label: 'Products', value: stats?.total_products ?? 0, sub: 'Marketplace', icon: 'ShoppingBagIcon', color: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
    { label: 'Pending Reports', value: stats?.pending_reports ?? 0, sub: 'Need review', icon: 'FlagIcon', color: '#f87171', glow: 'rgba(248,113,113,0.15)' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#050508' }}>
      {/* Background layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[800px] h-[800px] rounded-full opacity-[0.035]"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 65%)' }} />
        <div className="absolute top-[40%] left-[50%] w-[500px] h-[500px] rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, #fde68a 0%, transparent 65%)' }} />
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Crown logo */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)',
                  boxShadow: '0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(251,191,36,0.2)',
                }}>
                <AppLogo size={28} />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 0 12px rgba(251,191,36,0.6)' }}>
                👑
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Owner Command Center</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}>
                  SUPREME ACCESS
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: '#78716c' }}>
                <span style={{ color: '#fbbf24' }}>{OWNER_EMAIL}</span>
                <span className="mx-2">·</span>
                <span>{currentTime}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAllData}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
              <Icon name="ArrowPathIcon" size={15} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Icon name="ArrowRightOnRectangleIcon" size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* ── OWNER IDENTITY BANNER ── */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.05) 50%, rgba(146,64,14,0.04) 100%)',
            border: '1px solid rgba(251,191,36,0.25)',
          }}>
          <div className="absolute top-0 right-0 w-64 h-full opacity-10"
            style={{ background: 'linear-gradient(to left, rgba(251,191,36,0.3), transparent)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)' }}>
                <Icon name="ShieldCheckIcon" size={22} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Protected Owner Account — Full Sovereignty</p>
                <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>
                  This account has permanent, irrevocable ownership of <span style={{ color: '#fbbf24' }}>hnChat</span>. No admin can modify, ban, or delete this account.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {ownerPrivileges.slice(0, 2).map((p) => (
                <div key={p.title} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: p.color, border: `1px solid ${p.border}`, color: '#fbbf24' }}>
                  <span>{p.icon}</span>
                  <span>{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRIMARY STATS BENTO ── */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#78716c' }}>Platform Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {primaryStats.map((card) => (
              <div key={card.label} className="rounded-2xl p-4 space-y-3 group hover:scale-[1.02] transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: card.glow, border: `1px solid ${card.color}30` }}>
                  <Icon name={card.icon as any} size={17} style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white leading-none">{card.value.toLocaleString()}</p>
                  <p className="text-xs font-medium mt-1" style={{ color: '#78716c' }}>{card.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: card.color, opacity: 0.8 }}>{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BENTO GRID: Activity + Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Activity — spans 2 cols */}
          <div className="lg:col-span-2 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-sm font-bold text-white">Recent Activity</h3>
              <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                {(['users', 'posts'] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className="px-3 py-1.5 text-xs font-medium capitalize transition-all"
                    style={{
                      background: activeTab === tab ? 'rgba(251,191,36,0.15)' : 'transparent',
                      color: activeTab === tab ? '#fbbf24' : '#78716c',
                    }}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="px-5 pb-5 space-y-2">
              {activeTab === 'users' ? (
                recentUsers.length === 0 ? (
                  <p className="text-xs text-slate-600 py-4 text-center">No users yet</p>
                ) : recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/[0.02]"
                    style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                      {(user.full_name || user.username || '?')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.full_name || user.username || 'Anonymous'}</p>
                      <p className="text-xs truncate" style={{ color: '#78716c' }}>@{user.username || 'unknown'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {user.is_verified && (
                        <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>✓</span>
                      )}
                      <span className="text-xs" style={{ color: '#57534e' }}>{formatTimeAgo(user.created_at)}</span>
                    </div>
                  </div>
                ))
              ) : (
                recentPosts.length === 0 ? (
                  <p className="text-xs text-slate-600 py-4 text-center">No posts yet</p>
                ) : recentPosts.map((post) => (
                  <div key={post.id} className="p-3 rounded-xl transition-all hover:bg-white/[0.02]"
                    style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium mb-1" style={{ color: '#fbbf24' }}>
                          @{post.user_profiles?.username || 'unknown'}
                        </p>
                        <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{post.content}</p>
                      </div>
                      <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#57534e' }}>{formatTimeAgo(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs flex items-center gap-1" style={{ color: '#78716c' }}>
                        <Icon name="HeartIcon" size={11} /> {post.likes_count}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: '#78716c' }}>
                        <Icon name="ChatBubbleLeftIcon" size={11} /> {post.comments_count}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Owner Privileges Panel */}
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-sm font-bold text-white">Owner Privileges</h3>
            <div className="space-y-2">
              {ownerPrivileges.map((priv) => (
                <div key={priv.title} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: priv.color, border: `1px solid ${priv.border}` }}>
                  <span className="text-lg flex-shrink-0 leading-none mt-0.5">{priv.icon}</span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#fbbf24' }}>{priv.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#a8a29e' }}>{priv.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Quick action */}
            <Link href="/admin/users">
              <div className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold text-center transition-all hover:scale-[1.02] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                View All Users →
              </div>
            </Link>
          </div>
        </div>

        {/* ── MANAGEMENT SECTIONS ── */}
        <div className="space-y-4">
          {managementSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#78716c' }}>{section.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {section.items.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
                      style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                        style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                        <Icon name={item.icon as any} size={19} style={{ color: item.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white group-hover:text-white transition-colors">{item.label}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#57534e' }}>{item.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── FOOTER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 pb-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <AppLogo size={12} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#57534e' }}>hnChat Owner Portal</span>
          </div>
          <p className="text-xs" style={{ color: '#44403c' }}>
            Logged in as <span style={{ color: '#fbbf24' }}>{OWNER_EMAIL}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
