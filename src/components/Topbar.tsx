'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import NotificationsPanel from '@/components/NotificationsPanel';

export default function Topbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const UNREAD_COUNT = 3;

  const mobileNavItems = [
    { label: 'Home', icon: 'HomeIcon', path: '/home-feed' },
    { label: 'Videos', icon: 'FilmIcon', path: '/short-videos' },
    { label: 'Messages', icon: 'ChatBubbleLeftRightIcon', path: '/chats-messaging' },
    { label: 'Market', icon: 'ShoppingBagIcon', path: '/marketplace' },
    { label: 'Profile', icon: 'UserCircleIcon', path: '/profile' },
  ];

  return (
    <>
      {/* Desktop Topbar */}
      <header
        className="hidden lg:flex items-center gap-4 px-6 py-3 flex-shrink-0 relative"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.85) 100%)',
          backdropFilter: 'blur(32px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Bottom shimmer line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.2), rgba(180,100,255,0.2), transparent)' }}
        />

        {/* Search */}
        <div className={`flex-1 max-w-xl relative transition-all duration-300 ease-spring ${searchFocused ? 'max-w-2xl' : ''}`}>
          <Icon
            name="MagnifyingGlassIcon"
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search hnChat — people, posts, videos, products..."
            className="input-glass pl-10 pr-4 py-2.5 text-sm"
            style={{
              borderRadius: 14,
              background: searchFocused ? 'rgba(0,210,255,0.04)' : 'rgba(255,255,255,0.04)',
              boxShadow: searchFocused ? '0 0 0 1px rgba(0,210,255,0.2), 0 0 20px rgba(0,210,255,0.06)' : 'none',
            }}
          />
          {searchVal && (
            <button
              onClick={() => setSearchVal('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Icon name="XMarkIcon" size={14} className="text-slate-500 hover:text-slate-300" />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-white/05 group"
              style={{ border: '1px solid transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,210,255,0.15)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
            >
              <Icon name="BellIcon" size={19} className="text-slate-400 group-hover:text-slate-200 transition-colors" />
              {UNREAD_COUNT > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 6px rgba(0,210,255,0.6)' }}
                />
              )}
            </button>
            <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>
          <button
            className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-white/05 group"
            style={{ border: '1px solid transparent' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(0,210,255,0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          >
            <Icon name="ChatBubbleOvalLeftEllipsisIcon" size={19} className="text-slate-400 group-hover:text-slate-200 transition-colors" />
          </button>
          <Link href="/invite">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-600 transition-all duration-150 ml-1"
              style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)', color: '#6ee7f7' }}
            >
              <Icon name="UserPlusIcon" size={14} />
              Invite
            </button>
          </Link>
          <Link href="/sign-up-login">
            <button className="btn-glass text-sm px-4 py-2 ml-1">Sign Out</button>
          </Link>
        </div>
      </header>

      {/* Mobile Topbar */}
      <header
        className="lg:hidden flex items-center justify-between px-4 py-3 flex-shrink-0 relative"
        style={{
          background: 'rgba(5,5,8,0.95)',
          backdropFilter: 'blur(32px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 12px rgba(0,210,255,0.4)' }}
          >
            <AppLogo size={20} />
          </div>
          <span className="font-bold text-base gradient-text">hnChat</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-xl hover:bg-white/05">
            <Icon name="MagnifyingGlassIcon" size={19} className="text-slate-400" />
          </button>
          <button className="p-2 rounded-xl hover:bg-white/05" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Icon name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={19} className="text-slate-400" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-1.5 safe-area-bottom"
        style={{
          background: 'linear-gradient(180deg, rgba(5,5,8,0.92) 0%, rgba(5,5,8,0.98) 100%)',
          backdropFilter: 'blur(32px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Top shimmer */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.25), rgba(180,100,255,0.25), transparent)' }}
        />
        {mobileNavItems.map((item) => (
          <Link
            key={`mobile-nav-${item.path}`}
            href={item.path}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 text-slate-500 hover:text-cyan-glow active:scale-95 min-w-[48px]"
          >
            <Icon name={item.icon as any} size={22} />
            <span className="text-xs font-500">{item.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}