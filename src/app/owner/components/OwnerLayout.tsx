'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const OWNER_EMAIL = 'lmodirv@gmail.com';

const navGroups = [
  {
    label: 'Core',
    items: [
      { href: '/owner', label: 'Overview', icon: 'HomeIcon', exact: true },
      { href: '/owner/users', label: 'Users', icon: 'UsersIcon', exact: false },
      { href: '/owner/content', label: 'Content', icon: 'DocumentTextIcon', exact: false },
      { href: '/owner/reports', label: 'Reports', icon: 'FlagIcon', exact: false },
      { href: '/owner/payments', label: 'Payments', icon: 'BanknotesIcon', exact: false },
    ],
  },
  {
    label: 'Platform',
    items: [
      { href: '/owner/marketplace', label: 'Marketplace', icon: 'ShoppingBagIcon', exact: false },
      { href: '/owner/videos', label: 'Videos', icon: 'FilmIcon', exact: false },
      { href: '/owner/live-streams', label: 'Live Streams', icon: 'VideoCameraIcon', exact: false },
      { href: '/owner/subscriptions', label: 'Subscriptions', icon: 'CreditCardIcon', exact: false },
      { href: '/owner/ads', label: 'Ads Manager', icon: 'MegaphoneIcon', exact: false },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/owner/analytics', label: 'Analytics', icon: 'PresentationChartLineIcon', exact: false },
      { href: '/owner/ai-hub', label: 'AI Hub', icon: 'CpuChipIcon', exact: false },
      { href: '/owner/push-strategy', label: 'Push Strategy', icon: 'BellIcon', exact: false },
      { href: '/owner/email', label: 'Email', icon: 'EnvelopeIcon', exact: false },
      { href: '/owner/monitoring', label: 'Monitoring', icon: 'ServerIcon', exact: false },
    ],
  },
  {
    label: 'Features',
    items: [
      { href: '/owner/crypto', label: 'Crypto', icon: 'CurrencyDollarIcon', exact: false },
      { href: '/owner/games', label: 'Games Hub', icon: 'PuzzlePieceIcon', exact: false },
      { href: '/owner/settings', label: 'Settings', icon: 'Cog6ToothIcon', exact: false },
    ],
  },
];

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingReports, setPendingReports] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== OWNER_EMAIL) {
          router.replace('/owner-login');
          return;
        }
        setAuthChecked(true);

        const [reportsRes, paymentsRes] = await Promise.all([
          supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('payment_receipts').select('id', { count: 'exact', head: true }).eq('status', 'pending_verification'),
        ]);
        setPendingReports(reportsRes.count ?? 0);
        setPendingPayments(paymentsRes.count ?? 0);
      } catch {
        router.replace('/owner-login');
      }
    };
    checkAuth();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-up-login');
  };

  const isActive = (item: { href: string; exact: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const getBadge = (href: string) => {
    if (href === '/owner/reports') return pendingReports;
    if (href === '/owner/payments') return pendingPayments;
    return 0;
  };

  const isMainPage = pathname === '/owner';
  const sidebarWidth = collapsed ? 64 : 220;

  return (
    <div className="min-h-screen flex" style={{ background: '#050508' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 65%)' }} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: sidebarWidth, background: 'rgba(8,8,14,0.98)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}>
            <AppLogo size={18} />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white leading-none">Owner</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: '#78716c' }}>Command Center</p>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded-lg hover:bg-white/5 transition-all flex-shrink-0">
            <Icon name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'} size={14} style={{ color: '#57534e' }} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: '#44403c' }}>
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item);
                  const badge = getBadge(item.href);
                  return (
                    <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}>
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                        style={{
                          background: active ? 'rgba(251,191,36,0.12)' : 'transparent',
                          border: `1px solid ${active ? 'rgba(251,191,36,0.3)' : 'transparent'}`,
                        }}
                        title={collapsed ? item.label : undefined}>
                        <Icon name={item.icon as any} size={17}
                          style={{ color: active ? '#fbbf24' : '#57534e', flexShrink: 0 }} />
                        {!collapsed && (
                          <>
                            <span className="text-sm font-medium flex-1 truncate"
                              style={{ color: active ? '#fbbf24' : '#78716c' }}>
                              {item.label}
                            </span>
                            {badge > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171' }}>
                                {badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && badge > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 space-y-0.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href="/admin">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.03]"
              title={collapsed ? 'Admin Panel' : undefined}>
              <Icon name="ChartBarSquareIcon" size={17} style={{ color: '#57534e' }} />
              {!collapsed && <span className="text-sm font-medium" style={{ color: '#78716c' }}>Admin Panel</span>}
            </div>
          </Link>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-red-500/5"
            title={collapsed ? 'Sign Out' : undefined}>
            <Icon name="ArrowRightOnRectangleIcon" size={17} style={{ color: '#57534e' }} />
            {!collapsed && <span className="text-sm font-medium" style={{ color: '#78716c' }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile topbar */}
        <div className="flex items-center gap-3 px-4 py-3 lg:hidden"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(8,8,14,0.95)' }}>
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg transition-all hover:bg-white/5">
            <Icon name="Bars3Icon" size={20} style={{ color: '#78716c' }} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Owner</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
              👑
            </span>
          </div>
        </div>

        <main className="flex-1 overflow-auto">
          {!isMainPage && !authChecked ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <p className="text-sm" style={{ color: '#78716c' }}>Verifying access...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
