'use client';
import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface App {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: string;
  price: string;
  icon: string;
  gradient: string;
  installed: boolean;
  featured?: boolean;
  size: string;
  description: string;
}

const categories = ['All', 'Featured', 'Games', 'Productivity', 'Music', 'Photo & Video', 'Finance', 'Health', 'Utilities'];

export default function AppStoreScreen() {
  const [apps, setApps] = useState<App[]>([]);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (user) fetchInstalledApps();
  }, [user]);

  const fetchApps = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('store_apps')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) { console.log('Apps fetch error:', error.message); return; }

      setApps((data || []).map(a => ({
        id: a.id, name: a.name, category: a.category, description: a.description,
        icon: a.icon, gradient: a.gradient, rating: a.rating, reviews: a.review_count,
        price: a.price, size: a.app_size, featured: a.is_featured, installed: false,
      })));
    } catch (e) {
      console.log('Apps fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstalledApps = async () => {
    if (!user) return;
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('user_installed_apps')
        .select('app_id')
        .eq('user_id', user.id);

      if (error) { console.log('Installed apps fetch error:', error.message); return; }
      setInstalledIds(new Set((data || []).map((r: any) => r.app_id)));
    } catch (e) {
      console.log('Installed apps fetch failed');
    }
  };

  const handleInstallToggle = async (appId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) return;
    const supabase = createClient();
    const isInstalled = installedIds.has(appId);

    try {
      if (isInstalled) {
        await supabase.from('user_installed_apps').delete().eq('user_id', user.id).eq('app_id', appId);
        setInstalledIds(prev => { const n = new Set(prev); n.delete(appId); return n; });
      } else {
        await supabase.from('user_installed_apps').insert({ user_id: user.id, app_id: appId });
        setInstalledIds(prev => new Set([...prev, appId]));
      }
    } catch (e) {
      console.log('Install toggle failed');
    }
  };

  const filtered = apps.filter(a => {
    const matchesCategory = activeCategory === 'All' ? true
      : activeCategory === 'Featured' ? a.featured
      : a.category === activeCategory;
    const matchesSearch = searchQuery === '' || a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredApp = apps.find(a => a.featured);

  return (
    <div className="flex h-full bg-ice-black">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h1 className="text-2xl font-800 gradient-text mb-1">🏪 hn App Store</h1>
          <p className="text-slate-500 text-sm">Discover · Install · Create · Publish</p>
          {/* Search */}
          <div className="relative mt-4">
            <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search apps, games, tools..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm text-slate-200 outline-none placeholder-slate-600"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-6 py-3 overflow-x-auto border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-xl text-xs font-600 whitespace-nowrap transition-all duration-200 flex-shrink-0"
              style={activeCategory === cat
                ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {cat}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : (
            <>
              {/* Featured banner */}
              {activeCategory === 'All' && featuredApp && !searchQuery && (
                <div className="glass-card p-5 mb-6 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 text-8xl flex items-center justify-center opacity-20">{featuredApp.icon}</div>
                  <div className="relative z-10">
                    <span className="text-xs font-700 px-2 py-0.5 rounded-full mb-2 inline-block"
                      style={{ background: 'rgba(0,210,255,0.2)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }}>
                      ⭐ App of the Week
                    </span>
                    <h3 className="text-xl font-800 text-slate-100 mb-1">{featuredApp.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{featuredApp.description}</p>
                    <button onClick={() => handleInstallToggle(featuredApp.id)} className="btn-primary text-sm px-6 py-2">
                      {installedIds.has(featuredApp.id) ? 'Open' : 'Get for Free'}
                    </button>
                  </div>
                </div>
              )}

              {/* App grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(app => (
                  <div key={app.id} className="glass-card-hover p-4 cursor-pointer" onClick={() => setSelectedApp(app)}>
                    <div className="flex items-start gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-gradient-to-br ${app.gradient}`}
                        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-slate-100 font-700 text-sm">{app.name}</h3>
                            <p className="text-slate-500 text-xs">{app.category}</p>
                          </div>
                          {app.featured && (
                            <span className="text-xs px-1.5 py-0.5 rounded-lg flex-shrink-0"
                              style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff' }}>⭐</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-400 text-xs">★</span>
                          <span className="text-slate-300 text-xs font-600">{app.rating}</span>
                          <span className="text-slate-600 text-xs">({app.reviews})</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mt-3 line-clamp-2">{app.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-slate-400 text-xs">{app.size}</span>
                      <button
                        onClick={e => handleInstallToggle(app.id, e)}
                        className="px-4 py-1.5 rounded-xl text-xs font-700 transition-all duration-200"
                        style={installedIds.has(app.id)
                          ? { background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }
                          : { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                        {installedIds.has(app.id) ? 'Open' : app.price === 'Free' ? 'Get' : app.price}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* App Detail Panel */}
      {selectedApp && (
        <div className="w-80 flex-shrink-0 border-l flex flex-col overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.98)' }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h3 className="font-600 text-slate-200 text-sm">App Details</h3>
            <button onClick={() => setSelectedApp(null)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <Icon name="XMarkIcon" size={18} />
            </button>
          </div>
          <div className="p-5">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 bg-gradient-to-br ${selectedApp.gradient}`}
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              {selectedApp.icon}
            </div>
            <h2 className="text-center font-800 text-slate-100 text-lg mb-1">{selectedApp.name}</h2>
            <p className="text-center text-slate-500 text-xs mb-4">{selectedApp.category}</p>
            <div className="flex justify-center gap-6 mb-5">
              <div className="text-center">
                <div className="text-slate-200 font-700 text-sm">★ {selectedApp.rating}</div>
                <div className="text-slate-600 text-xs">{selectedApp.reviews} reviews</div>
              </div>
              <div className="text-center">
                <div className="text-slate-200 font-700 text-sm">{selectedApp.size}</div>
                <div className="text-slate-600 text-xs">Size</div>
              </div>
              <div className="text-center">
                <div className="text-slate-200 font-700 text-sm">{selectedApp.price}</div>
                <div className="text-slate-600 text-xs">Price</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">{selectedApp.description}</p>
            <button
              onClick={() => handleInstallToggle(selectedApp.id)}
              className="btn-primary w-full text-sm py-3">
              {installedIds.has(selectedApp.id) ? 'Open App' : selectedApp.price === 'Free' ? 'Install Free' : `Buy ${selectedApp.price}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
