'use client';
import React from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';

const trending = [
  { id: 'trend-001', tag: '#AIArt2026', posts: '48.2K posts', hot: true },
  { id: 'trend-002', tag: '#hnChatLive', posts: '31.7K posts', hot: true },
  { id: 'trend-003', tag: '#NightMarket', posts: '22.1K posts', hot: false },
  { id: 'trend-004', tag: '#TechTalks', posts: '18.4K posts', hot: false },
  { id: 'trend-005', tag: '#SolarEclipse2026', posts: '14.9K posts', hot: false },
  { id: 'trend-006', tag: '#DigitalNomads', posts: '11.2K posts', hot: false },
];

const suggestedUsers = [
  { id: 'user-001', name: 'Zara Moon', username: 'zaramoon', avatar: 'https://i.pravatar.cc/80?img=56', followers: '1.2M', verified: true },
  { id: 'user-002', name: 'Kai Renn', username: 'kairenn', avatar: 'https://i.pravatar.cc/80?img=25', followers: '847K', verified: false },
  { id: 'user-003', name: 'Nora Flux', username: 'noraflux', avatar: 'https://i.pravatar.cc/80?img=44', followers: '623K', verified: true },
  { id: 'user-004', name: 'Dex Volta', username: 'dexvolta', avatar: 'https://i.pravatar.cc/80?img=15', followers: '412K', verified: false },
];

const liveNow = [
  { id: 'live-001', user: 'Sara Nova', topic: 'Digital Art Workshop', viewers: '4.2K', avatar: 'https://i.pravatar.cc/80?img=47' },
  { id: 'live-002', user: 'Marco Vega', topic: 'Code Review Live', viewers: '1.8K', avatar: 'https://i.pravatar.cc/80?img=8' },
];

export default function TrendingSidebar() {
  return (
    <div className="space-y-4 sticky top-6">

      {/* Live Now */}
      <div
        className="glass-card p-4 space-y-3"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(255,255,255,0.03) 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <Badge variant="live">● LIVE</Badge>
          <span className="text-sm font-700 text-slate-100">Happening Now</span>
        </div>
        {liveNow?.map((live) => (
          <Link
            key={live?.id}
            href="/video-live-feed"
            className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/05 transition-all duration-200 group"
            style={{ border: '1px solid transparent' }}
          >
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 rounded-xl overflow-hidden"
                style={{ border: '2px solid rgba(239,68,68,0.4)', boxShadow: '0 0 10px rgba(239,68,68,0.2)' }}
              >
                <AppImage
                  src={live?.avatar}
                  alt={`${live?.user} is streaming live`}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full live-badge border-2 border-ice-black" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-600 text-slate-200 truncate group-hover:text-cyan-glow transition-colors duration-150">{live?.user}</p>
              <p className="text-xs text-slate-600 truncate">{live?.topic}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-700 text-red-400 tabular-nums">{live?.viewers}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Trending */}
      <div className="glass-card p-4 space-y-0.5">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
          >
            <Icon name="FireIcon" size={11} className="text-white" />
          </div>
          <h3 className="text-sm font-700 text-slate-100">Trending Now</h3>
        </div>
        {trending?.map((t, i) => (
          <button
            key={t?.id}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-white/05 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-700 w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 tabular-nums"
                style={{
                  background: i < 3 ? 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.15))' : 'rgba(255,255,255,0.04)',
                  color: i < 3 ? '#00d2ff' : 'rgba(148,163,184,0.5)',
                  border: i < 3 ? '1px solid rgba(0,210,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {i + 1}
              </span>
              <div className="text-left">
                <p className="text-sm font-600 text-slate-200 group-hover:text-cyan-glow transition-colors duration-150 flex items-center gap-1.5">
                  {t?.tag}
                  {t?.hot && <Icon name="FireIcon" size={12} className="text-orange-400" />}
                </p>
                <p className="text-xs text-slate-600">{t?.posts}</p>
              </div>
            </div>
            <Icon name="ChevronRightIcon" size={13} className="text-slate-700 group-hover:text-slate-400 transition-colors" />
          </button>
        ))}
      </div>

      {/* Suggested Users */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-5 h-5 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
          >
            <Icon name="SparklesIcon" size={11} className="text-white" />
          </div>
          <h3 className="text-sm font-700 text-slate-100">Suggested for You</h3>
        </div>
        {suggestedUsers?.map((u) => (
          <div key={u?.id} className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
              style={{ border: '1.5px solid rgba(0,210,255,0.15)' }}
            >
              <AppImage
                src={u?.avatar}
                alt={`${u?.name} suggested user profile picture`}
                width={36}
                height={36}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-600 text-slate-200 truncate">{u?.name}</span>
                {u?.verified && (
                  <div
                    className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
                  >
                    <Icon name="CheckIcon" size={8} className="text-white" />
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-600">{u?.followers} followers</p>
            </div>
            <button
              className="text-xs font-700 px-3 py-1.5 rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, rgba(0,210,255,0.12), rgba(155,89,255,0.12))',
                color: '#00d2ff',
                border: '1px solid rgba(0,210,255,0.2)',
              }}
            >
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <p className="text-xs text-slate-700 px-1">
        © 2026 hnChat · Privacy · Terms · Advertise
      </p>
    </div>
  );
}