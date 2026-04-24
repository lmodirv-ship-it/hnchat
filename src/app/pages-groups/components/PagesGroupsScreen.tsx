'use client';
import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PageItem {
  id: string;
  name: string;
  category: string;
  followers: string;
  avatar: string;
  gradient: string;
  verified: boolean;
}

interface Group {
  id: string;
  name: string;
  members: string;
  privacy: 'Public' | 'Private';
  avatar: string;
  gradient: string;
  activity: string;
}

export default function PagesGroupsScreen() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [joinedPages, setJoinedPages] = useState<Set<string>>(new Set());
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'pages' | 'groups'>('pages');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchPages();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserFollows();
      fetchUserMemberships();
    }
  }, [user]);

  const fetchPages = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('community_pages')
        .select('*')
        .order('follower_count', { ascending: false });

      if (error) { console.log('Pages fetch error:', error.message); return; }

      setPages((data || []).map(p => ({
        id: p.id, name: p.name, category: p.category, avatar: p.avatar,
        gradient: p.gradient, verified: p.is_verified,
        followers: formatCount(p.follower_count),
      })));
    } catch (e) {
      console.log('Pages fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .order('member_count', { ascending: false });

      if (error) { console.log('Groups fetch error:', error.message); return; }

      setGroups((data || []).map(g => ({
        id: g.id, name: g.name, avatar: g.avatar, gradient: g.gradient,
        members: formatCount(g.member_count),
        privacy: g.privacy as 'Public' | 'Private',
        activity: g.activity_level,
      })));
    } catch (e) {
      console.log('Groups fetch failed');
    }
  };

  const fetchUserFollows = async () => {
    if (!user) return;
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('page_follows')
        .select('page_id')
        .eq('user_id', user.id);

      if (!error) setJoinedPages(new Set((data || []).map((r: any) => r.page_id)));
    } catch (e) {
      console.log('User follows fetch failed');
    }
  };

  const fetchUserMemberships = async () => {
    if (!user) return;
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select('group_id')
        .eq('user_id', user.id);

      if (!error) setJoinedGroups(new Set((data || []).map((r: any) => r.group_id)));
    } catch (e) {
      console.log('User memberships fetch failed');
    }
  };

  const handleFollowPage = async (pageId: string) => {
    if (!user) return;
    const supabase = createClient();
    const isFollowing = joinedPages.has(pageId);
    try {
      if (isFollowing) {
        await supabase.from('page_follows').delete().eq('user_id', user.id).eq('page_id', pageId);
        setJoinedPages(prev => { const n = new Set(prev); n.delete(pageId); return n; });
        // Decrement follower count
        const page = pages.find(p => p.id === pageId);
        if (page) {
          await supabase.from('community_pages').update({ follower_count: parseCount(page.followers) - 1 }).eq('id', pageId);
        }
      } else {
        await supabase.from('page_follows').insert({ user_id: user.id, page_id: pageId });
        setJoinedPages(prev => new Set([...prev, pageId]));
        const page = pages.find(p => p.id === pageId);
        if (page) {
          await supabase.from('community_pages').update({ follower_count: parseCount(page.followers) + 1 }).eq('id', pageId);
        }
      }
    } catch (e) {
      console.log('Follow page failed');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) return;
    const supabase = createClient();
    const isJoined = joinedGroups.has(groupId);
    try {
      if (isJoined) {
        await supabase.from('group_memberships').delete().eq('user_id', user.id).eq('group_id', groupId);
        setJoinedGroups(prev => { const n = new Set(prev); n.delete(groupId); return n; });
      } else {
        await supabase.from('group_memberships').insert({ user_id: user.id, group_id: groupId });
        setJoinedGroups(prev => new Set([...prev, groupId]));
      }
    } catch (e) {
      console.log('Join group failed');
    }
  };

  const handleCreate = async () => {
    if (!user) return;
    const supabase = createClient();
    if (activeTab === 'pages') {
      const { data, error } = await supabase.from('community_pages').insert({
        name: 'My New Page', category: 'General', avatar: 'NP',
        gradient: 'from-cyan-500 to-violet-600', follower_count: 0,
        is_verified: false, created_by: user.id,
      }).select().single();
      if (!error && data) {
        setPages(prev => [{ id: data.id, name: data.name, category: data.category, avatar: data.avatar, gradient: data.gradient, verified: false, followers: '0' }, ...prev]);
      }
    } else {
      const { data, error } = await supabase.from('community_groups').insert({
        name: 'My New Group', avatar: 'NG',
        gradient: 'from-cyan-500/30 to-violet-500/30', member_count: 1,
        privacy: 'Public', activity_level: 'New', created_by: user.id,
      }).select().single();
      if (!error && data) {
        setGroups(prev => [{ id: data.id, name: data.name, avatar: data.avatar, gradient: data.gradient, members: '1', privacy: 'Public', activity: 'New' }, ...prev]);
      }
    }
  };

  const formatCount = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return String(n);
  };

  const parseCount = (s: string) => {
    if (s.endsWith('M')) return Math.round(parseFloat(s) * 1000000);
    if (s.endsWith('K')) return Math.round(parseFloat(s) * 1000);
    return parseInt(s) || 0;
  };

  const filteredPages = pages.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredGroups = groups.filter(g => !searchQuery || g.name.toLowerCase().includes(searchQuery.toLowerCase()));

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
        <button onClick={handleCreate} className="ml-auto btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Icon name="PlusCircleIcon" size={16} />
          Create {activeTab === 'pages' ? 'Page' : 'Group'}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-slate-200 outline-none placeholder-slate-600"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      ) : activeTab === 'pages' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPages.map(page => (
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
                <button onClick={() => handleFollowPage(page.id)}
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
          {filteredGroups.map(group => (
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
                <button onClick={() => handleJoinGroup(group.id)}
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
