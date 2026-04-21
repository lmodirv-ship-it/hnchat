'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const navItems = [
  { label: 'Home Feed', icon: 'HomeIcon', path: '/home-feed', badge: null },
  { label: 'Messages', icon: 'ChatBubbleLeftRightIcon', path: '/chats-messaging', badge: '12' },
  { label: 'Videos & Live', icon: 'PlayCircleIcon', path: '/video-live-feed', badge: '3' },
  { label: 'Live Stream', icon: 'SignalIcon', path: '/live-stream', badge: 'LIVE' },
  { label: 'Short Videos', icon: 'FilmIcon', path: '/short-videos', badge: null },
  { label: 'Stories', icon: 'CameraIcon', path: '/stories-editor', badge: null },
  { label: 'Voice Rooms', icon: 'MicrophoneIcon', path: '/voice-rooms', badge: '2' },
  { label: 'Pages & Groups', icon: 'UserGroupIcon', path: '/pages-groups', badge: null },
  { label: 'hnShop', icon: 'ShoppingBagIcon', path: '/ecommerce', badge: 'NEW' },
  { label: 'Marketplace', icon: 'TagIcon', path: '/marketplace', badge: null },
  { label: 'Invite & Earn', icon: 'GiftIcon', path: '/invite', badge: '🎁' },
  { label: 'hnTrade Crypto', icon: 'CurrencyDollarIcon', path: '/crypto-trading', badge: '📈' },
  { label: 'GeoContent', icon: 'MapPinIcon', path: '/geo-content', badge: null },
  { label: 'hn AI Hub', icon: 'CpuChipIcon', path: '/hn-ai', badge: 'AI' },
  { label: 'AI Assistant', icon: 'SparklesIcon', path: '/ai-assistant', badge: null },
  { label: 'Ads Manager', icon: 'MegaphoneIcon', path: '/ads-manager', badge: null },
  { label: 'Ads & Promo', icon: 'BoltIcon', path: '/ads-promo', badge: null },
  { label: 'Search', icon: 'MagnifyingGlassIcon', path: '/search-engine', badge: null },
  { label: 'App Store', icon: 'Square2StackIcon', path: '/app-store', badge: null },
  { label: 'Games Hub', icon: 'TrophyIcon', path: '/games-hub', badge: null },
  { label: 'Growth Analytics', icon: 'ChartBarIcon', path: '/growth-analytics', badge: '📈' },
  { label: 'Push Strategy', icon: 'BellAlertIcon', path: '/push-strategy', badge: '🔔' },
  { label: 'Email Dashboard', icon: 'EnvelopeIcon', path: '/email-dashboard', badge: '📧' },
  { label: 'Monitoring Pro', icon: 'ShieldCheckIcon', path: '/monitoring', badge: '🛡️' },
  { label: 'Preferences', icon: 'AdjustmentsHorizontalIcon', path: '/preferences', badge: null },
  { label: 'Profile', icon: 'UserCircleIcon', path: '/profile', badge: null },
  { label: 'Admin', icon: 'ShieldCheckIcon', path: '/admin', badge: '⚡' },
];

const secondaryItems = [
  { label: 'Notifications', icon: 'BellIcon', path: '/home-feed', badge: '5' },
  { label: 'Bookmarks', icon: 'BookmarkIcon', path: '/home-feed' },
  { label: 'Settings', icon: 'Cog6ToothIcon', path: '/home-feed' },
  { label: 'Privacy Policy', icon: 'ShieldCheckIcon', path: '/privacy-policy' },
  { label: 'Terms of Service', icon: 'DocumentTextIcon', path: '/terms-of-service' },
];

interface SidebarProps {
  activePath?: string;
}

export default function Sidebar({ activePath }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="hidden lg:flex flex-col h-full transition-all duration-300 ease-spring flex-shrink-0 relative z-20"
      style={{
        width: collapsed ? 68 : 248,
        background: 'linear-gradient(180deg, rgba(5,5,8,0.98) 0%, rgba(10,10,18,0.96) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(32px)',
      }}
    >
      {/* Top shimmer line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.3), rgba(180,100,255,0.3), transparent)' }}
      />

      {/* Logo */}
      <div className={`flex items-center px-3 py-5 ${collapsed ? 'justify-center' : 'gap-3 px-5'}`}>
        <div className="relative">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
              boxShadow: '0 0 16px rgba(0,210,255,0.4), 0 0 32px rgba(155,89,255,0.2)',
            }}
          >
            <AppLogo size={22} />
          </div>
          <div
            className="absolute inset-0 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />
        </div>
        {!collapsed && (
          <div>
            <span className="font-display font-800 text-lg gradient-text tracking-tight">
              hnChat
            </span>
            <div className="text-xs text-slate-600 font-500 tracking-widest uppercase" style={{ fontSize: 9 }}>
              Super App
            </div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-auto mb-2 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 hover:bg-white/08"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon
          name={collapsed ? 'ChevronRightIcon' : 'ChevronLeftIcon'}
          size={14}
          className="text-slate-500"
        />
      </button>

      {/* Primary nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-xs font-600 uppercase tracking-widest px-3 mb-2" style={{ color: 'rgba(0,210,255,0.4)', fontSize: 9 }}>
            Navigation
          </p>
        )}
        {navItems.map((item) => {
          const isActive = activePath === item.path;
          return (
            <Link
              key={`nav-${item.path}-${item.label}`}
              href={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-200 group relative ${
                isActive ? 'nav-active' : 'text-slate-400 hover:text-slate-200 border border-transparent hover:border-white/06 hover:bg-white/04'
              }`}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #00d2ff, #9b59ff)' }}
                />
              )}
              <Icon
                name={item.icon as any}
                size={18}
                className={isActive ? 'text-cyan-glow' : 'text-slate-500 group-hover:text-slate-300'}
                style={isActive ? { filter: 'drop-shadow(0 0 6px rgba(0,210,255,0.6))' } : {}}
              />
              {!collapsed && (
                <span className="text-xs font-500 flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span
                  className="text-xs font-700 px-1.5 py-0.5 rounded-full tabular-nums"
                  style={item.badge === 'AI'
                    ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.3), rgba(155,89,255,0.3))', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }
                    : { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.2)' }
                  }
                >
                  {item.badge}
                </span>
              )}
              {collapsed && item.badge && (
                <span
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs flex items-center justify-center font-700 tabular-nums"
                  style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}
                >
                  {item.badge === 'AI' ? '✦' : item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <p className="text-xs font-600 uppercase tracking-widest px-3 mt-4 mb-2" style={{ color: 'rgba(0,210,255,0.3)', fontSize: 9 }}>
            More
          </p>
        )}
        {collapsed && <div className="my-3 mx-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }} />}
        {secondaryItems.map((item) => (
          <Link
            key={`nav-sec-${item.label}`}
            href={item.path}
            title={collapsed ? item.label : undefined}
            className="flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-200 text-slate-500 hover:text-slate-300 border border-transparent hover:border-white/05 hover:bg-white/03 relative group"
          >
            <Icon name={item.icon as any} size={17} className="text-slate-600 group-hover:text-slate-400" />
            {!collapsed && <span className="text-xs font-400 flex-1">{item.label}</span>}
            {!collapsed && item.badge && (
              <span
                className="text-xs font-600 px-1.5 py-0.5 rounded-full tabular-nums"
                style={{ background: 'rgba(192,132,252,0.15)', color: '#c084fc', border: '1px solid rgba(192,132,252,0.2)' }}
              >
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-3 mb-2" style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      {/* User profile bottom */}
      <div className={`p-3 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="relative flex-shrink-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-700 text-ice-black"
            style={{
              background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
              boxShadow: '0 0 12px rgba(0,210,255,0.3)',
            }}
          >
            A
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-online border-2 border-ice-black" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-600 text-slate-200 truncate">Alex Mercer</p>
            <p className="text-xs text-slate-600 truncate">@alexm · Online</p>
          </div>
        )}
        {!collapsed && (
          <Link href="/sign-up-login">
            <Icon name="ArrowRightOnRectangleIcon" size={15} className="text-slate-600 hover:text-slate-300 transition-colors" />
          </Link>
        )}
      </div>
    </aside>
  );
}