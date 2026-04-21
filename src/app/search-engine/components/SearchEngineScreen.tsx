'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface SearchResult {
  id: number;
  title: string;
  url: string;
  description: string;
  type: 'web' | 'image' | 'video' | 'news' | 'people';
  time?: string;
  thumbnail?: string;
}

const trendingSearches = ['hnChat super app', 'Diamond UI design', 'AI assistant 2026', 'Future tech trends', 'Crypto diamond NFT', 'Space exploration 2026'];

const mockResults: Record<string, SearchResult[]> = {
  web: [
    { id: 1, title: 'hnChat — The Diamond Super App of the Future', url: 'hnchat.io', description: 'Experience the most advanced super app ever built. Combining social media, AI, gaming, marketplace, and more in one diamond-grade platform.', type: 'web' },
    { id: 2, title: 'What is a Super App? The Complete Guide 2026', url: 'techfuture.io/super-apps', description: 'Super apps combine multiple services into one platform. Learn how hnChat is revolutionizing the concept with AI-powered features and diamond design.', type: 'web' },
    { id: 3, title: 'Diamond UI Design Principles — Crystal Aesthetics', url: 'designlab.io/diamond-ui', description: 'Explore the cutting-edge diamond UI design system featuring glassmorphism, crystal gradients, and futuristic micro-interactions.', type: 'web' },
    { id: 4, title: 'AI Integration in Social Platforms — 2026 Report', url: 'airesearch.org/social-2026', description: 'Comprehensive analysis of how artificial intelligence is transforming social media platforms and user engagement metrics.', type: 'web' },
  ],
  news: [
    { id: 5, title: 'hnChat Reaches 100M Users in Record Time', url: 'technews.io', description: 'The diamond super app platform has achieved unprecedented growth, becoming the fastest-growing app in history.', type: 'news', time: '2 hours ago' },
    { id: 6, title: 'Future of Social Media: Super Apps Dominate 2026', url: 'wired.com', description: 'Industry analysts predict super apps will replace traditional social platforms by 2027, with hnChat leading the charge.', type: 'news', time: '5 hours ago' },
    { id: 7, title: 'Diamond Design Trend Takes Over Tech Industry', url: 'designweekly.com', description: 'Crystal and diamond aesthetics are becoming the dominant visual language for next-generation applications.', type: 'news', time: '1 day ago' },
  ],
  people: [
    { id: 8, title: 'Nova Stellar', url: '@novastellar · hnChat', description: 'Tech visionary & diamond design enthusiast. 4.2M followers. Creator of Crystal UI framework.', type: 'people' },
    { id: 9, title: 'Zara Flux', url: '@zaraflux · hnChat', description: 'AI researcher & super app architect. 2.8M followers. Building the future one pixel at a time.', type: 'people' },
    { id: 10, title: 'Kai Nexus', url: '@kainexus · hnChat', description: 'Gaming & tech content creator. 6.1M followers. Diamond League champion 2025.', type: 'people' },
  ],
};

const tabs = ['All', 'Web', 'News', 'Images', 'Videos', 'People', 'Maps'];

export default function SearchEngineScreen() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setSearched(true);
    setResults([...mockResults.web, ...mockResults.news.slice(0, 2), ...mockResults.people.slice(0, 1)]);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Search Header */}
      <div className="sticky top-0 z-10 p-4 border-b" style={{ background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(20px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto">
          {!searched && (
            <div className="text-center mb-6 pt-8">
              <h1 className="text-4xl font-800 gradient-text mb-2">hnSearch</h1>
              <p className="text-slate-500 text-sm">Search the diamond web · AI-powered results</p>
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
                { icon: '🌐', label: 'Web Search', color: '#00d2ff' },
                { icon: '📰', label: 'Latest News', color: '#9b59ff' },
                { icon: '🖼️', label: 'Images', color: '#e879f9' },
                { icon: '🎬', label: 'Videos', color: '#f59e0b' },
                { icon: '👥', label: 'People', color: '#22c55e' },
                { icon: '🗺️', label: 'Maps', color: '#ef4444' },
                { icon: '🛍️', label: 'Shopping', color: '#06b6d4' },
                { icon: '🤖', label: 'AI Search', color: '#8b5cf6' },
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
            <p className="text-slate-500 text-xs mb-4">About 2,847,000 results (0.42 seconds) for &quot;<span style={{ color: '#00d2ff' }}>{query}</span>&quot;</p>

            {/* AI Summary */}
            <div className="glass-card p-4 mb-5" style={{ borderColor: 'rgba(0,210,255,0.2)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                  <Icon name="SparklesIcon" size={12} className="text-ice-black" />
                </div>
                <span className="text-xs font-700" style={{ color: '#00d2ff' }}>AI Summary</span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed">
                Based on your search for &quot;<strong>{query}</strong>&quot;, here&apos;s what I found: hnChat is a revolutionary super app combining social media, AI, gaming, marketplace, and communication tools in a single diamond-grade platform. It represents the next evolution of digital interaction.
              </p>
            </div>

            {/* Results list */}
            <div className="space-y-4">
              {results.map(result => (
                <div key={result.id} className="group cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'rgba(0,210,255,0.1)' }}>
                      <Icon name="GlobeAltIcon" size={10} style={{ color: '#00d2ff' }} />
                    </div>
                    <span className="text-slate-500 text-xs">{result.url}</span>
                    {result.time && <span className="text-slate-600 text-xs">· {result.time}</span>}
                  </div>
                  <h3 className="text-base font-600 mb-1 transition-colors duration-200 group-hover:underline"
                    style={{ color: '#7dd3fc' }}>{result.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{result.description}</p>
                </div>
              ))}
            </div>

            {/* Load more */}
            <div className="flex justify-center mt-8">
              <button className="btn-glass px-8 py-2.5 text-sm font-600">
                Load More Results
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
