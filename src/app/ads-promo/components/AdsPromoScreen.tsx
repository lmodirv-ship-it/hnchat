'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

const adFormats = [
  { id: 'feed', name: 'Feed Ad', icon: '📰', desc: 'Appears in user feeds', cpm: '$2.40', reach: '2.4M' },
  { id: 'story', name: 'Story Ad', icon: '📸', desc: 'Full-screen story format', cpm: '$3.80', reach: '1.8M' },
  { id: 'video', name: 'Video Ad', icon: '🎬', desc: 'Short video promotion', cpm: '$5.20', reach: '3.1M' },
  { id: 'banner', name: 'Banner Ad', icon: '🖼️', desc: 'Top/bottom banner display', cpm: '$1.20', reach: '5.7M' },
  { id: 'search', name: 'Search Ad', icon: '🔍', desc: 'Appears in search results', cpm: '$4.60', reach: '1.2M' },
  { id: 'sponsored', name: 'Sponsored Post', icon: '⭐', desc: 'Boosted organic content', cpm: '$3.10', reach: '2.9M' },
];

const campaigns = [
  { id: 1, name: 'Diamond Launch Campaign', status: 'Active', budget: '$5,000', spent: '$2,847', reach: '1.2M', clicks: '48.2K', ctr: '4.02%', gradient: 'from-cyan-500/20 to-violet-500/20' },
  { id: 2, name: 'Summer Sale Promo', status: 'Paused', budget: '$2,000', spent: '$1,234', reach: '567K', clicks: '18.9K', ctr: '3.33%', gradient: 'from-orange-500/20 to-amber-500/20' },
  { id: 3, name: 'App Install Drive', status: 'Active', budget: '$8,000', spent: '$4,521', reach: '2.8M', clicks: '92.4K', ctr: '3.30%', gradient: 'from-emerald-500/20 to-teal-500/20' },
];

const stats = [
  { label: 'Total Reach', value: '4.6M', icon: '👁️', color: '#00d2ff' },
  { label: 'Total Clicks', value: '159K', icon: '🖱️', color: '#9b59ff' },
  { label: 'Avg CTR', value: '3.45%', icon: '📊', color: '#e879f9' },
  { label: 'Total Spent', value: '$8,602', icon: '💰', color: '#f59e0b' },
];

export default function AdsPromoScreen() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'campaigns'>('dashboard');
  const [selectedFormat, setSelectedFormat] = useState('feed');
  const [budget, setBudget] = useState('500');
  const [adTitle, setAdTitle] = useState('');
  const [adDesc, setAdDesc] = useState('');

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-800 gradient-text mb-1">📢 Ads & Promotions</h1>
          <p className="text-slate-500 text-sm">Reach millions · Diamond-grade targeting</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm">
          <Icon name="PlusCircleIcon" size={16} />
          New Campaign
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {(['dashboard', 'create', 'campaigns'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-2xl text-sm font-600 capitalize transition-all duration-200"
            style={activeTab === tab
              ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
              : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
            {tab === 'dashboard' ? '📊 Dashboard' : tab === 'create' ? '✨ Create Ad' : '📋 Campaigns'}
          </button>
        ))}
      </div>

      {activeTab === 'dashboard' && (
        <div>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map(stat => (
              <div key={stat.label} className="glass-card p-4">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-xl font-800" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-slate-500 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
          {/* Performance chart placeholder */}
          <div className="glass-card p-5 mb-6">
            <h3 className="font-700 text-slate-200 text-sm mb-4">📈 Performance Overview</h3>
            <div className="flex items-end gap-2 h-32">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div key={i} className="flex-1 rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{ height: `${h}%`, background: `linear-gradient(to top, #00d2ff, #9b59ff)`, opacity: 0.7 + (i / 20) }} />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                <span key={m} className="text-slate-600 text-xs">{m}</span>
              ))}
            </div>
          </div>
          {/* Active campaigns */}
          <h3 className="font-700 text-slate-200 text-sm mb-3">🚀 Active Campaigns</h3>
          <div className="space-y-3">
            {campaigns.filter(c => c.status === 'Active').map(c => (
              <div key={c.id} className={`glass-card-hover p-4 bg-gradient-to-r ${c.gradient}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-600 text-slate-200 text-sm">{c.name}</h4>
                  <span className="px-2 py-0.5 rounded-full text-xs font-600"
                    style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                    ● {c.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[['Budget', c.budget], ['Spent', c.spent], ['Reach', c.reach], ['CTR', c.ctr]].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-slate-500 text-xs">{k}</div>
                      <div className="text-slate-200 text-sm font-600">{v}</div>
                    </div>
                  ))}
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: '57%', background: 'linear-gradient(90deg, #00d2ff, #9b59ff)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div className="max-w-2xl">
          <h3 className="font-700 text-slate-200 text-base mb-4">Choose Ad Format</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {adFormats.map(fmt => (
              <button key={fmt.id} onClick={() => setSelectedFormat(fmt.id)}
                className={`p-4 rounded-2xl text-left transition-all duration-200 ${selectedFormat === fmt.id ? 'glass-card' : 'hover:bg-white/04'}`}
                style={{ border: selectedFormat === fmt.id ? '1px solid rgba(0,210,255,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-2xl mb-2">{fmt.icon}</div>
                <div className="text-slate-200 text-sm font-600">{fmt.name}</div>
                <div className="text-slate-500 text-xs mt-0.5">{fmt.desc}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs" style={{ color: '#00d2ff' }}>CPM: {fmt.cpm}</span>
                  <span className="text-xs text-slate-500">Reach: {fmt.reach}</span>
                </div>
              </button>
            ))}
          </div>
          {/* Ad content */}
          <div className="glass-card p-5 space-y-4">
            <h3 className="font-700 text-slate-200 text-sm">Ad Content</h3>
            <div>
              <label className="text-xs font-600 text-slate-400 mb-1.5 block">Ad Title</label>
              <input value={adTitle} onChange={e => setAdTitle(e.target.value)}
                placeholder="Enter compelling ad title..."
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 outline-none placeholder-slate-600"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div>
              <label className="text-xs font-600 text-slate-400 mb-1.5 block">Description</label>
              <textarea value={adDesc} onChange={e => setAdDesc(e.target.value)}
                placeholder="Describe your offer..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-slate-200 outline-none placeholder-slate-600 resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div>
              <label className="text-xs font-600 text-slate-400 mb-1.5 block">Daily Budget (USD)</label>
              <div className="flex items-center gap-3">
                <input type="range" min="10" max="10000" value={budget} onChange={e => setBudget(e.target.value)}
                  className="flex-1" style={{ accentColor: '#00d2ff' }} />
                <span className="text-slate-200 font-700 text-sm w-20 text-right">${Number(budget).toLocaleString()}</span>
              </div>
            </div>
            <button className="btn-primary w-full flex items-center justify-center gap-2">
              <Icon name="RocketLaunchIcon" size={16} />
              Launch Campaign
            </button>
          </div>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          {campaigns.map(c => (
            <div key={c.id} className={`glass-card-hover p-5 bg-gradient-to-r ${c.gradient}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-700 text-slate-100 text-base">{c.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-600"
                    style={c.status === 'Active'
                      ? { background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                      : { background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
                    ● {c.status}
                  </span>
                  <button className="px-3 py-1 rounded-xl text-xs font-600 transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                    Edit
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {[['Budget', c.budget], ['Spent', c.spent], ['Reach', c.reach], ['Clicks', c.clicks], ['CTR', c.ctr]].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-slate-500 text-xs mb-0.5">{k}</div>
                    <div className="text-slate-200 font-700 text-sm">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
