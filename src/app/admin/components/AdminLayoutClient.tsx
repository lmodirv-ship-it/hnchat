'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

const adminNav = [
  { label: 'Dashboard', icon: 'ChartBarSquareIcon', path: '/admin' },
  { label: 'Users', icon: 'UsersIcon', path: '/admin/users' },
  { label: 'Posts', icon: 'DocumentTextIcon', path: '/admin/posts' },
  { label: 'Analytics', icon: 'PresentationChartLineIcon', path: '/admin/analytics' },
  { label: 'Reports', icon: 'FlagIcon', path: '/admin/reports' },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name?: string; username?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/sign-up-login');
      return;
    }
    supabase
      .from('user_profiles')
      .select('is_admin, full_name, username')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (!data?.is_admin) {
          router.push('/home-feed');
        } else {
          setIsAdmin(true);
          setUserProfile({ full_name: data.full_name, username: data.username });
        }
        setChecking(false);
      });
  }, [user]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/admin/users?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050508]">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const userInitial = (userProfile?.full_name || userProfile?.username || user?.email || 'A')[0].toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050508' }}>
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00d2ff 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #9b59ff 0%, transparent 70%)' }} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative z-40 lg:z-auto flex flex-col h-full transition-transform duration-300 flex-shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: 240,
          background: 'linear-gradient(180deg, rgba(8,8,14,0.98) 0%, rgba(10,10,18,0.97) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(32px)',
        }}
      >
        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.4), rgba(155,89,255,0.3), transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.35)' }}>
            <AppLogo size={22} />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-tight">hnChat</span>
            <div className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: '#00d2ff', fontSize: 9 }}>Admin Panel</div>
          </div>
        </div>

        {/* Nav label */}
        <p className="text-xs font-semibold uppercase tracking-widest px-5 mb-2"
          style={{ color: 'rgba(0,210,255,0.35)', fontSize: 9 }}>Main Menu</p>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group ${
                  isActive
                    ? 'text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(0,210,255,0.15) 0%, rgba(155,89,255,0.1) 100%)',
                  border: '1px solid rgba(0,210,255,0.2)',
                  boxShadow: '0 0 20px rgba(0,210,255,0.08)',
                } : { border: '1px solid transparent' }}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                    style={{ background: 'linear-gradient(180deg, #00d2ff, #9b59ff)' }} />
                )}
                <Icon
                  name={item.icon as any}
                  size={18}
                  style={isActive ? { color: '#00d2ff', filter: 'drop-shadow(0 0 6px rgba(0,210,255,0.5))' } : {}}
                />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="mx-4 mb-3" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

        {/* Back to app */}
        <div className="px-3 pb-4">
          <Link
            href="/home-feed"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 transition-all duration-200 hover:bg-white/[0.03]"
            style={{ border: '1px solid transparent' }}
          >
            <Icon name="ArrowLeftIcon" size={16} />
            <span className="text-sm font-medium">Back to App</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative z-10">
        {/* Topbar */}
        <header className="flex items-center gap-4 px-4 lg:px-6 h-14 flex-shrink-0"
          style={{
            background: 'rgba(5,5,8,0.85)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            backdropFilter: 'blur(20px)',
          }}>
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
          >
            <Icon name="Bars3Icon" size={20} />
          </button>

          {/* Page title */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,210,255,0.12)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.2)' }}>
              ⚡ Admin
            </span>
            <span className="text-sm text-slate-400 hidden sm:block">
              {adminNav.find(n => n.path === pathname)?.label || 'Dashboard'}
            </span>
          </div>

          <div className="flex-1" />

          {/* Topbar actions */}
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="pl-8 pr-4 py-1.5 rounded-lg text-sm text-slate-300 placeholder-slate-600 outline-none w-40 focus:w-56 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <Link href="/notifications">
              <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all" title="Notifications">
                <Icon name="BellIcon" size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
                  style={{ background: '#f87171', boxShadow: '0 0 6px rgba(248,113,113,0.6)' }} />
              </button>
            </Link>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-black flex-shrink-0 cursor-default"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 12px rgba(0,210,255,0.3)' }}
              title={userProfile?.full_name || userProfile?.username || 'Admin'}
            >
              {userInitial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
