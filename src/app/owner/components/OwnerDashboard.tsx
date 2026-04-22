'use client';
import React, { useState, useEffect } from 'react';
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
  active_users: number;
  new_users_today: number;
}

const quickLinks = [
  { label: 'Admin Dashboard', icon: 'ChartBarSquareIcon', href: '/admin', color: '#00d2ff' },
  { label: 'Manage Users', icon: 'UsersIcon', href: '/admin/users', color: '#a78bfa' },
  { label: 'Manage Posts', icon: 'DocumentTextIcon', href: '/admin/posts', color: '#34d399' },
  { label: 'Analytics', icon: 'PresentationChartLineIcon', href: '/admin/analytics', color: '#fb923c' },
  { label: 'Reports', icon: 'FlagIcon', href: '/admin/reports', color: '#f87171' },
  { label: 'Monitoring', icon: 'ServerIcon', href: '/monitoring', color: '#f472b6' },
  { label: 'Email Dashboard', icon: 'EnvelopeIcon', href: '/email-dashboard', color: '#60a5fa' },
  { label: 'Push Strategy', icon: 'BellIcon', href: '/push-strategy', color: '#fbbf24' },
  { label: 'Growth Analytics', icon: 'ArrowTrendingUpIcon', href: '/growth-analytics', color: '#4ade80' },
  { label: 'Ads Manager', icon: 'MegaphoneIcon', href: '/ads-manager', color: '#e879f9' },
  { label: 'Home Feed', icon: 'HomeIcon', href: '/home-feed', color: '#94a3b8' },
  { label: 'User Settings', icon: 'Cog6ToothIcon', href: '/user-settings', color: '#64748b' },
];

export default function OwnerDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<{ full_name?: string; email?: string } | null>(null);

  useEffect(() => {
    checkOwnerAccess();
  }, []);

  const checkOwnerAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      router.replace('/owner-login');
      return;
    }

    if (session.user.email !== OWNER_EMAIL) {
      router.replace('/home-feed');
      return;
    }

    // Ensure owner flags are set in DB
    await fetch('/api/owner-setup', { method: 'POST' });

    setOwnerProfile({ full_name: 'Site Owner', email: OWNER_EMAIL });
    await loadStats();
    setLoading(false);
  };

  const loadStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usersRes, postsRes, videosRes, messagesRes, newUsersRes] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('videos').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    ]);

    setStats({
      total_users: usersRes.count ?? 0,
      total_posts: postsRes.count ?? 0,
      total_videos: videosRes.count ?? 0,
      total_messages: messagesRes.count ?? 0,
      active_users: usersRes.count ?? 0,
      new_users_today: newUsersRes.count ?? 0,
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-up-login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#050508' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Verifying owner access...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.total_users ?? 0, icon: 'UsersIcon', color: '#00d2ff' },
    { label: 'Total Posts', value: stats?.total_posts ?? 0, icon: 'DocumentTextIcon', color: '#34d399' },
    { label: 'Total Videos', value: stats?.total_videos ?? 0, icon: 'FilmIcon', color: '#f472b6' },
    { label: 'Messages', value: stats?.total_messages ?? 0, icon: 'ChatBubbleLeftRightIcon', color: '#fb923c' },
    { label: 'New Today', value: stats?.new_users_today ?? 0, icon: 'UserPlusIcon', color: '#a78bfa' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#050508' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00d2ff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #9b59ff 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 30px rgba(0,210,255,0.4)' }}>
              <AppLogo size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Owner Dashboard</h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }}>
                  👑 OWNER
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{OWNER_EMAIL} · Full site control</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <Icon name="ArrowRightOnRectangleIcon" size={16} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Owner Info Banner */}
        <div className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(0,210,255,0.08) 0%, rgba(155,89,255,0.06) 100%)',
            border: '1px solid rgba(0,210,255,0.2)',
          }}>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,210,255,0.15)', border: '1px solid rgba(0,210,255,0.3)' }}>
              <Icon name="ShieldCheckIcon" size={20} style={{ color: '#00d2ff' }} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Protected Owner Account</p>
              <p className="text-xs text-slate-400 mt-1">
                This account (<span style={{ color: '#00d2ff' }}>{OWNER_EMAIL}</span>) has full administrative privileges.
                It is permanently protected from deletion, banning, or demotion by any other user or admin.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Site Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-2xl p-4 space-y-2"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${card.color}18` }}>
                  <Icon name={card.icon as any} size={16} style={{ color: card.color }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-600">{card.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">Site Management</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <div className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                    style={{ background: `${link.color}18`, border: `1px solid ${link.color}30` }}>
                    <Icon name={link.icon as any} size={18} style={{ color: link.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                    {link.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Owner Privileges */}
        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Owner Privileges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: '🛡️', title: 'Deletion Protection', desc: 'Account cannot be deleted by any admin or system process' },
              { icon: '👑', title: 'Permanent Admin', desc: 'Admin status cannot be revoked or downgraded' },
              { icon: '🔓', title: 'Password-Free Login', desc: 'Access via secure magic link sent to your email' },
              { icon: '⚡', title: 'Full Site Control', desc: 'Access to all admin panels, analytics, and management tools' },
            ].map((priv) => (
              <div key={priv.title} className="flex items-start gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-xl flex-shrink-0">{priv.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-300">{priv.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{priv.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
