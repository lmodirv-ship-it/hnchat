'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface PageItem {
  id: number;
  name: string;
  category: string;
  followers: string;
  avatar: string;
  gradient: string;
  verified: boolean;
  joined: boolean;
}

interface Group {
  id: number;
  name: string;
  members: string;
  privacy: 'Public' | 'Private';
  avatar: string;
  gradient: string;
  activity: string;
  joined: boolean;
}

const pages: PageItem[] = [
  { id: 1, name: 'hnChat Official', category: 'Technology', followers: '4.2M', avatar: 'HC', gradient: 'from-cyan-500 to-violet-600', verified: true, joined: true },
  { id: 2, name: 'Diamond Design Studio', category: 'Design & Art', followers: '892K', avatar: 'DD', gradient: 'from-pink-500 to-rose-600', verified: true, joined: false },
  { id: 3, name: 'Future Tech News', category: 'Media', followers: '2.1M', avatar: 'FT', gradient: 'from-blue-500 to-indigo-600', verified: true, joined: true },
  { id: 4, name: 'AI Revolution', category: 'Science', followers: '1.5M', avatar: 'AI', gradient: 'from-emerald-500 to-teal-600', verified: false, joined: false },
  { id: 5, name: 'Crystal Gaming', category: 'Gaming', followers: '3.7M', avatar: 'CG', gradient: 'from-orange-500 to-amber-600', verified: true, joined: false },
];

const groups: Group[] = [
  { id: 1, name: '💎 Diamond Developers', members: '124K', privacy: 'Public', avatar: 'DD', gradient: 'from-cyan-500/30 to-violet-500/30', activity: 'Very Active', joined: true },
  { id: 2, name: '🎨 Creative Minds Hub', members: '87K', privacy: 'Public', avatar: 'CM', gradient: 'from-pink-500/30 to-rose-500/30', activity: 'Active', joined: false },
  { id: 3, name: '🚀 Startup Founders Circle', members: '45K', privacy: 'Private', avatar: 'SF', gradient: 'from-emerald-500/30 to-teal-500/30', activity: 'Very Active', joined: true },
  { id: 4, name: '🎮 Pro Gamers Alliance', members: '213K', privacy: 'Public', avatar: 'PG', gradient: 'from-orange-500/30 to-amber-500/30', activity: 'Extremely Active', joined: false },
  { id: 5, name: '🌍 Global Innovators', members: '567K', privacy: 'Public', avatar: 'GI', gradient: 'from-blue-500/30 to-indigo-500/30', activity: 'Active', joined: false },
];

export default function PagesGroupsScreen() {
  const [activeTab, setActiveTab] = useState<'pages' | 'groups'>('pages');
  const [joinedPages, setJoinedPages] = useState<Set<number>>(new Set(pages.filter(p => p.joined).map(p => p.id)));
  const [joinedGroups, setJoinedGroups] = useState<Set<number>>(new Set(groups.filter(g => g.joined).map(g => g.id)));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-800 gradient-text mb-1">📄 Pages & Groups</h1>
        <p className="text-slate-500 text-sm">Discover communities, follow pages, join groups</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {(['pages', 'groups'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="px-6 py-2.5 rounded-2xl text-sm font-600 capitalize transition-all duration-200"
            style={activeTab === tab
              ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
              : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
            {tab === 'pages' ? '📄 Pages' : '👥 Groups'}
          </button>
        ))}
        <button className="ml-auto btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Icon name="PlusCircleIcon" size={16} />
          Create {activeTab === 'pages' ? 'Page' : 'Group'}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input placeholder={`Search ${activeTab}...`}
          className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-slate-200 outline-none placeholder-slate-600"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      {activeTab === 'pages' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {pages.map(page => (
            <div key={page.id} className="glass-card-hover p-5 cursor-pointer">
              {/* Cover */}
              <div className={`h-24 rounded-2xl mb-4 bg-gradient-to-br ${page.gradient} relative overflow-hidden`}>
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)' }} />
              </div>
              {/* Avatar */}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-700 flex-shrink-0 bg-gradient-to-br ${page.gradient}`}
                  style={{ marginTop: '-28px', border: '3px solid #050508', boxShadow: '0 0 12px rgba(0,210,255,0.2)' }}>
                  {page.avatar}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-100 font-700 text-sm truncate">{page.name}</span>
                    {page.verified && (
                      <Icon name="CheckBadgeIcon" size={14} style={{ color: '#00d2ff', flexShrink: 0 }} />
                    )}
                  </div>
                  <p className="text-slate-500 text-xs">{page.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs">👥 {page.followers} followers</span>
                <button onClick={() => setJoinedPages(prev => { const n = new Set(prev); n.has(page.id) ? n.delete(page.id) : n.add(page.id); return n; })}
                  className="px-4 py-1.5 rounded-xl text-xs font-600 transition-all duration-200"
                  style={joinedPages.has(page.id)
                    ? { background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }
                    : { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                  {joinedPages.has(page.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map(group => (
            <div key={group.id} className="glass-card-hover p-5 cursor-pointer">
              <div className={`h-20 rounded-2xl mb-4 bg-gradient-to-br ${group.gradient} flex items-center justify-center text-3xl`}>
                {group.name.split(' ')[0]}
              </div>
              <h3 className="text-slate-100 font-700 text-sm mb-1">{group.name}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-500 text-xs">👥 {group.members} members</span>
                <span className="text-slate-600">·</span>
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={group.privacy === 'Public'
                    ? { background: 'rgba(34,197,94,0.1)', color: '#22c55e' }
                    : { background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  {group.privacy === 'Public' ? '🌍' : '🔒'} {group.privacy}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff' }}>
                  ⚡ {group.activity}
                </span>
                <button onClick={() => setJoinedGroups(prev => { const n = new Set(prev); n.has(group.id) ? n.delete(group.id) : n.add(group.id); return n; })}
                  className="px-4 py-1.5 rounded-xl text-xs font-600 transition-all duration-200"
                  style={joinedGroups.has(group.id)
                    ? { background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }
                    : { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                  {joinedGroups.has(group.id) ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
