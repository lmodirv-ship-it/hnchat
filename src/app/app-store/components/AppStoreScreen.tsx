'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface App {
  id: number;
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

const apps: App[] = [
  { id: 1, name: 'Diamond AI Studio', category: 'Productivity', rating: 4.9, reviews: '124K', price: 'Free', icon: '💎', gradient: 'from-cyan-500 to-violet-600', installed: true, featured: true, size: '48 MB', description: 'Create stunning AI-generated art and content with diamond-grade quality.' },
  { id: 2, name: 'Crystal Music', category: 'Music', rating: 4.8, reviews: '89K', price: 'Free', icon: '🎵', gradient: 'from-pink-500 to-rose-600', installed: false, featured: true, size: '32 MB', description: 'Stream millions of songs with crystal-clear audio quality.' },
  { id: 3, name: 'Nexus Games Hub', category: 'Games', rating: 4.7, reviews: '256K', price: 'Free', icon: '🎮', gradient: 'from-orange-500 to-amber-600', installed: true, featured: false, size: '128 MB', description: 'Play hundreds of premium games without downloads.' },
  { id: 4, name: 'Prism Photo Editor', category: 'Photo & Video', rating: 4.9, reviews: '67K', price: '$2.99', icon: '🎨', gradient: 'from-violet-500 to-purple-600', installed: false, featured: true, size: '56 MB', description: 'Professional photo editing with AI-powered filters and effects.' },
  { id: 5, name: 'Orbit Finance', category: 'Finance', rating: 4.6, reviews: '43K', price: 'Free', icon: '💰', gradient: 'from-emerald-500 to-teal-600', installed: false, featured: false, size: '24 MB', description: 'Track your finances, investments, and crypto portfolio.' },
  { id: 6, name: 'Nova Fitness', category: 'Health', rating: 4.8, reviews: '91K', price: 'Free', icon: '💪', gradient: 'from-red-500 to-orange-600', installed: true, featured: false, size: '38 MB', description: 'AI-powered workout plans and nutrition tracking.' },
  { id: 7, name: 'Stellar Maps', category: 'Navigation', rating: 4.7, reviews: '178K', price: 'Free', icon: '🗺️', gradient: 'from-blue-500 to-indigo-600', installed: false, featured: false, size: '62 MB', description: 'Real-time navigation with AR overlay and diamond routing.' },
  { id: 8, name: 'Quantum VPN', category: 'Utilities', rating: 4.5, reviews: '34K', price: '$4.99/mo', icon: '🔐', gradient: 'from-slate-500 to-slate-700', installed: false, featured: false, size: '12 MB', description: 'Military-grade encryption for your digital privacy.' },
];

const categories = ['All', 'Featured', 'Games', 'Productivity', 'Music', 'Photo & Video', 'Finance', 'Health', 'Utilities'];

export default function AppStoreScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [installed, setInstalled] = useState<Set<number>>(new Set(apps.filter(a => a.installed).map(a => a.id)));
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const filtered = apps.filter(a => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Featured') return a.featured;
    return a.category === activeCategory;
  });

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
            <input placeholder="Search apps, games, tools..."
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
          {/* Featured banner */}
          {activeCategory === 'All' && (
            <div className="glass-card p-5 mb-6 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 text-8xl flex items-center justify-center opacity-20">💎</div>
              <div className="relative z-10">
                <span className="text-xs font-700 px-2 py-0.5 rounded-full mb-2 inline-block"
                  style={{ background: 'rgba(0,210,255,0.2)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }}>
                  ⭐ App of the Week
                </span>
                <h3 className="text-xl font-800 text-slate-100 mb-1">Diamond AI Studio</h3>
                <p className="text-slate-400 text-sm mb-3">Create stunning AI-generated art with diamond-grade quality tools</p>
                <button className="btn-primary text-sm px-6 py-2">Get for Free</button>
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
                    onClick={e => { e.stopPropagation(); setInstalled(prev => { const n = new Set(prev); n.has(app.id) ? n.delete(app.id) : n.add(app.id); return n; }); }}
                    className="px-4 py-1.5 rounded-xl text-xs font-700 transition-all duration-200"
                    style={installed.has(app.id)
                      ? { background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }
                      : { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                    {installed.has(app.id) ? 'Open' : app.price === 'Free' ? 'Get' : app.price}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
              onClick={() => setInstalled(prev => { const n = new Set(prev); n.has(selectedApp.id) ? n.delete(selectedApp.id) : n.add(selectedApp.id); return n; })}
              className="btn-primary w-full text-sm py-3">
              {installed.has(selectedApp.id) ? 'Open App' : selectedApp.price === 'Free' ? 'Install Free' : `Buy ${selectedApp.price}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
