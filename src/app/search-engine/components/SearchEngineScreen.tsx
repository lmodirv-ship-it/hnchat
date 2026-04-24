'use client';
import React, { useState, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { createClient } from '@/lib/supabase/client';
import { trackSearch } from '@/lib/analytics';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'video' | 'product';
  title: string;
  subtitle: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  url: string;
  time?: string;
  meta?: string;
}

const trendingSearches = ['hnChat', 'Diamond UI', 'AI assistant', 'Tech trends', 'Crypto', 'Social media'];

const tabs = ['All', 'Posts', 'People', 'Videos', 'Products'];

export default function SearchEngineScreen() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTime, setSearchTime] = useState(0);

  const handleSearch = useCallback(async (q?: string) => {
    const searchQuery = (q || query).trim();
    if (!searchQuery) return;
    setQuery(searchQuery);
    setSearched(true);
    setLoading(true);
    const startTime = Date.now();

    const supabase = createClient();
    const allResults: SearchResult[] = [];

    try {
      // Search posts
      const { data: posts } = await supabase
        .from('posts')
        .select('id, content, created_at, user_profiles(username, full_name, avatar_url)')
        .ilike('content', `%${searchQuery}%`)
        .eq('is_published', true)
        .limit(10);

      (posts || []).forEach((p: any) => {
        allResults.push({
          id: p.id,
          type: 'post',
          title: p.user_profiles?.full_name || p.user_profiles?.username || 'User',
          subtitle: `@${p.user_profiles?.username || 'user'}`,
          description: p.content?.slice(0, 150),
          image: p.user_profiles?.avatar_url || '',
          imageAlt: `${p.user_profiles?.full_name || 'User'} avatar`,
          url: '/home-feed',
          time: formatTime(p.created_at),
        });
      });

      // Search users
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url, bio, is_verified, followers_count')
        .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(8);

      (users || []).forEach((u: any) => {
        allResults.push({
          id: u.id,
          type: 'user',
          title: u.full_name || u.username || 'User',
          subtitle: `@${u.username}${u.is_verified ? ' ✓' : ''}`,
          description: u.bio || '',
          image: u.avatar_url || '',
          imageAlt: `${u.full_name || u.username} profile picture`,
          url: '/profile',
          meta: u.followers_count ? `${formatNum(u.followers_count)} followers` : '',
        });
      });

      // Search videos
      const { data: videos } = await supabase
        .from('videos')
        .select('id, title, caption, thumbnail_url, thumbnail_alt, views_count, created_at, user_profiles(username, full_name)')
        .or(`title.ilike.%${searchQuery}%,caption.ilike.%${searchQuery}%`)
        .eq('is_published', true)
        .limit(8);

      (videos || []).forEach((v: any) => {
        allResults.push({
          id: v.id,
          type: 'video',
          title: v.title || v.caption?.slice(0, 60) || 'Video',
          subtitle: `by ${v.user_profiles?.full_name || v.user_profiles?.username || 'Creator'}`,
          image: v.thumbnail_url || '',
          imageAlt: v.thumbnail_alt || v.title || 'Video thumbnail',
          url: '/short-videos',
          meta: v.views_count ? `${formatNum(v.views_count)} views` : '',
          time: formatTime(v.created_at),
        });
      });

      // Search products
      const { data: products } = await supabase
        .from('marketplace_products')
        .select('id, name, description, price, image_url, image_alt, category, user_profiles(username, full_name)')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('is_active', true)
        .limit(8);

      (products || []).forEach((p: any) => {
        allResults.push({
          id: p.id,
          type: 'product',
          title: p.name,
          subtitle: `${p.category} · $${p.price}`,
          description: p.description?.slice(0, 120),
          image: p.image_url || '',
          imageAlt: p.image_alt || p.name,
          url: '/marketplace',
          meta: `by ${p.user_profiles?.full_name || p.user_profiles?.username || 'Seller'}`,
        });
      });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      setSearchTime(parseFloat(elapsed));
      setTotalCount(allResults.length);
      setResults(allResults);
      trackSearch(searchQuery, allResults.length);
    } catch (err) {
      console.log('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const formatTime = (ts: string) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  function formatNum(n: number) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n?.toString() || '0';
  }

  const filteredResults = results.filter(r => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Posts') return r.type === 'post';
    if (activeTab === 'People') return r.type === 'user';
    if (activeTab === 'Videos') return r.type === 'video';
    if (activeTab === 'Products') return r.type === 'product';
    return true;
  });

  const typeIcon: Record<string, string> = {
    post: 'DocumentTextIcon',
    user: 'UserIcon',
    video: 'FilmIcon',
    product: 'ShoppingBagIcon',
  };

  const typeColor: Record<string, string> = {
    post: '#00d2ff',
    user: '#a78bfa',
    video: '#f59e0b',
    product: '#34d399',
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Search Header */}
      <div className="sticky top-0 z-10 p-4 border-b" style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto">
          {!searched && (
            <div className="text-center mb-6 pt-8">
              <h1 className="text-4xl font-800 gradient-text mb-2">hnSearch</h1>
              <p className="text-slate-500 text-sm">Search posts, people, videos & products</p>
            </div>
          )}
          {/* Search bar */}
          <div className="relative">
            <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search anything..."
              className="w-full pl-12 pr-16 py-3.5 rounded-2xl text-sm text-slate-200 outline-none placeholder-slate-600 transition-all duration-200"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: query ? '0 0 0 2px rgba(0,210,255,0.2)' : 'none' }}
            />
            <button onClick={() => handleSearch()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-600 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
              Search
            </button>
          </div>
          {/* Tabs */}
          {searched && (
            <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-4 py-1.5 rounded-xl text-xs font-600 whitespace-nowrap transition-all duration-200 flex-shrink-0"
                  style={activeTab === tab
                    ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }
                    : { background: 'transparent', color: '#64748b' }}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        {!searched ? (
          /* Trending */
          <div>
            <p className="text-xs font-600 uppercase tracking-widest mb-3" style={{ color: 'rgba(0,210,255,0.6)' }}>🔥 Trending Searches</p>
            <div className="flex flex-wrap gap-2 mb-8">
              {trendingSearches.map(t => (
                <button key={t} onClick={() => handleSearch(t)}
                  className="px-4 py-2 rounded-2xl text-sm font-500 transition-all duration-200 hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  🔍 {t}
                </button>
              ))}
            </div>
            {/* Quick access categories */}
            <p className="text-xs font-600 uppercase tracking-widest mb-3" style={{ color: 'rgba(0,210,255,0.6)' }}>⚡ Quick Access</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '📝', label: 'Posts', color: '#00d2ff' },
                { icon: '👥', label: 'People', color: '#a78bfa' },
                { icon: '🎬', label: 'Videos', color: '#f59e0b' },
                { icon: '🛍️', label: 'Products', color: '#34d399' },
              ].map(cat => (
                <button key={cat.label} onClick={() => handleSearch(cat.label)}
                  className="glass-card-hover p-4 flex flex-col items-center gap-2 cursor-pointer">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs font-600" style={{ color: cat.color }}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Results */
          <div>
            {loading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                ))}
              </div>
            ) : (
              <>
                <p className="text-slate-500 text-xs mb-4">
                  {totalCount} results ({searchTime}s) for &quot;<span style={{ color: '#00d2ff' }}>{query}</span>&quot;
                </p>

                {filteredResults.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)' }}>
                      <Icon name="MagnifyingGlassIcon" size={28} className="text-cyan-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-semibold">No results found</p>
                      <p className="text-slate-500 text-sm mt-1">Try a different search term</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredResults.map(result => (
                      <Link key={`${result.type}-${result.id}`} href={result.url}>
                        <div className="group flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {/* Thumbnail / Avatar */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden"
                            style={{ background: 'rgba(255,255,255,0.06)' }}>
                            {result.image ? (
                              <AppImage
                                src={result.image}
                                alt={result.imageAlt || result.title}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"
                                style={{ background: `${typeColor[result.type]}15` }}>
                                <Icon name={typeIcon[result.type] as any} size={20} style={{ color: typeColor[result.type] }} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-600 px-2 py-0.5 rounded-full"
                                style={{ background: `${typeColor[result.type]}15`, color: typeColor[result.type] }}>
                                {result.type}
                              </span>
                              {result.time && <span className="text-slate-600 text-xs">{result.time}</span>}
                            </div>
                            <h3 className="text-sm font-600 text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                              {result.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">{result.subtitle}</p>
                            {result.description && (
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{result.description}</p>
                            )}
                            {result.meta && (
                              <p className="text-xs text-slate-600 mt-1">{result.meta}</p>
                            )}
                          </div>

                          <Icon name="ChevronRightIcon" size={16} className="text-slate-600 flex-shrink-0 mt-1 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
