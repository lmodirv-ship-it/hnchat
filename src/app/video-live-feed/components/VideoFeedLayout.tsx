'use client';
import React, { useState } from 'react';
import ReelsSection from './ReelsSection';
import LiveSection from './LiveSection';
import Icon from '@/components/ui/AppIcon';

type Tab = 'reels' | 'live' | 'trending';

export default function VideoFeedLayout() {
  const [activeTab, setActiveTab] = useState<Tab>('reels');

  const tabs: { id: Tab; label: string; icon: string; badge?: string }[] = [
    { id: 'reels', label: 'Reels', icon: 'FilmIcon' },
    { id: 'live', label: 'Live Now', icon: 'SignalIcon', badge: '12' },
    { id: 'trending', label: 'Trending', icon: 'FireIcon' },
  ];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-700 text-slate-200">Videos & Live</h1>
          <p className="text-sm text-slate-500 mt-0.5">Discover creators, watch reels, join live streams</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Icon name="PlusIcon" size={16} />
          Create Reel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {tabs.map((t) => (
          <button
            key={`vtab-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-600 transition-all duration-200 ${
              activeTab === t.id
                ? 'text-ice-black' :'text-slate-400 hover:text-slate-200'
            }`}
            style={activeTab === t.id ? { background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' } : {}}
          >
            <Icon name={t.icon as any} size={16} />
            {t.label}
            {t.badge && (
              <span
                className="text-xs font-700 px-1.5 py-0.5 rounded-full tabular-nums"
                style={
                  activeTab === t.id
                    ? { background: 'rgba(10,10,15,0.3)', color: '#0a0a0f' }
                    : { background: 'rgba(239,68,68,0.2)', color: '#f87171' }
                }
              >
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'reels' && <ReelsSection />}
      {activeTab === 'live' && <LiveSection />}
      {activeTab === 'trending' && <ReelsSection trending />}
    </div>
  );
}