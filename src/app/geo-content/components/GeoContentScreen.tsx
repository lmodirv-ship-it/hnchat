'use client';
import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

interface Region {
  id: string;
  name: string;
  flag: string;
  language: string;
  timezone: string;
  weather: { temp: number; condition: string; icon: string };
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string;
  image: string;
  imageAlt: string;
}

interface Service {
  id: string;
  name: string;
  category: string;
  icon: string;
  rating: number;
  available: boolean;
}

interface TrendingTag {
  id: string;
  tag: string;
  postCount: number;
}

export default function GeoContentScreen() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [trending, setTrending] = useState<TrendingTag[]>([]);
  const [activeTab, setActiveTab] = useState<'news' | 'services' | 'trending' | 'weather'>('news');
  const [contentLang, setContentLang] = useState<'local' | 'english'>('local');
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      fetchRegionContent(selectedRegion.id);
    }
  }, [selectedRegion, activeTab]);

  const fetchRegions = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('geo_regions')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) { console.log('Regions fetch error:', error.message); return; }

      const mapped: Region[] = (data || []).map(r => ({
        id: r.id,
        name: r.name,
        flag: r.flag,
        language: r.language,
        timezone: r.timezone,
        weather: { temp: r.weather_temp, condition: r.weather_condition, icon: r.weather_icon },
      }));
      setRegions(mapped);
      if (mapped.length > 0) setSelectedRegion(mapped[0]);
    } catch (e) {
      console.log('Regions fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionContent = async (regionId: string) => {
    setTabLoading(true);
    const supabase = createClient();
    try {
      if (activeTab === 'news') {
        const { data, error } = await supabase
          .from('geo_news')
          .select('*')
          .eq('region_id', regionId)
          .order('published_at', { ascending: false });

        if (!error) {
          setNews((data || []).map(n => ({
            id: n.id,
            title: n.title,
            source: n.source,
            time: formatTime(n.published_at),
            category: n.category,
            image: n.image_url || '',
            imageAlt: n.image_alt || n.title,
          })));
        }
      } else if (activeTab === 'services') {
        const { data, error } = await supabase
          .from('geo_services')
          .select('*')
          .eq('region_id', regionId);

        if (!error) {
          setServices((data || []).map(s => ({
            id: s.id, name: s.name, category: s.category,
            icon: s.icon, rating: s.rating, available: s.is_available,
          })));
        }
      } else if (activeTab === 'trending') {
        const { data, error } = await supabase
          .from('geo_trending')
          .select('*')
          .eq('region_id', regionId)
          .order('sort_order', { ascending: true });

        if (!error) {
          setTrending((data || []).map(t => ({
            id: t.id, tag: t.tag, postCount: t.post_count,
          })));
        }
      }
    } catch (e) {
      console.log('Region content fetch failed');
    } finally {
      setTabLoading(false);
    }
  };

  const formatTime = (ts: string) => {
    if (!ts) return '';
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-700 gradient-text">GeoContent</h1>
          <p className="text-sm text-slate-500 mt-0.5">Smart regional content — news, services & trends by location</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-600"
            style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', color: '#00d2ff' }}>
            <Icon name="MapPinIcon" size={13} />
            Auto-detecting location
          </div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['local', 'english'] as const).map((lang) => (
              <button key={lang} onClick={() => setContentLang(lang)}
                className="px-3 py-1.5 rounded-lg text-xs font-600 capitalize transition-all duration-200"
                style={contentLang === lang
                  ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                  : { color: '#64748b' }}>
                {lang === 'local' ? '🌐 Local' : '🇬🇧 English'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Region Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {regions.map((region) => (
          <button key={region.id} onClick={() => setSelectedRegion(region)}
            className="p-4 rounded-2xl text-left transition-all duration-200"
            style={{
              background: selectedRegion?.id === region.id
                ? 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.1))'
                : 'rgba(255,255,255,0.03)',
              border: selectedRegion?.id === region.id
                ? '1px solid rgba(0,210,255,0.3)'
                : '1px solid rgba(255,255,255,0.06)'
            }}>
            <div className="text-3xl mb-2">{region.flag}</div>
            <p className="font-700 text-sm text-slate-200">{region.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{region.timezone}</p>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs">{region.weather.icon}</span>
              <span className="text-xs text-slate-400">{region.weather.temp}°C</span>
            </div>
          </button>
        ))}
      </div>

      {selectedRegion && (
        <>
          {/* Region Header */}
          <div className="glass-card p-5 mb-5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.08), rgba(155,89,255,0.06))' }}>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{selectedRegion.flag}</span>
              <div>
                <h2 className="text-xl font-800 text-slate-200">{selectedRegion.name}</h2>
                <p className="text-sm text-slate-400">{selectedRegion.language} · {selectedRegion.timezone}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl mb-1">{selectedRegion.weather.icon}</div>
              <p className="font-700 text-2xl gradient-text-static">{selectedRegion.weather.temp}°C</p>
              <p className="text-xs text-slate-400">{selectedRegion.weather.condition}</p>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['news', 'services', 'trending', 'weather'] as const).map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className="px-5 py-2 rounded-lg text-sm font-600 capitalize transition-all duration-200"
                style={activeTab === t
                  ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                  : { color: '#64748b' }}>
                {t}
              </button>
            ))}
          </div>

          {tabLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'news' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {news.map((item) => (
                    <div key={item.id} className="glass-card-hover overflow-hidden group cursor-pointer">
                      <div className="relative h-40 overflow-hidden">
                        {item.image && (
                          <img src={item.image} alt={item.imageAlt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,8,0.8) 0%, transparent 60%)' }} />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-700"
                          style={{ background: 'rgba(0,210,255,0.8)', color: '#050508' }}>
                          {item.category}
                        </span>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-300 font-500 leading-relaxed mb-2">{item.title}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{item.source}</span>
                          <span className="text-xs text-slate-600">{item.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'services' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="glass-card p-5 text-center">
                      <div className="text-4xl mb-3">{service.icon}</div>
                      <h3 className="font-700 text-slate-200 text-sm mb-1">{service.name}</h3>
                      <p className="text-xs text-slate-500 mb-2">{service.category}</p>
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-xs font-600 text-slate-300">{service.rating}</span>
                      </div>
                      <button className="w-full py-2 rounded-xl text-xs font-700"
                        style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                        Open App
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'trending' && (
                <div className="max-w-lg space-y-3">
                  {trending.map((tag, i) => (
                    <div key={tag.id} className="glass-card-hover p-4 flex items-center gap-4 cursor-pointer">
                      <span className="text-2xl font-800 gradient-text-static tabular-nums w-8">#{i + 1}</span>
                      <div className="flex-1">
                        <p className="font-700 text-slate-200">{tag.tag}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{(tag.postCount / 1000).toFixed(0)}K posts today</p>
                      </div>
                      <Icon name="FireIcon" size={18} className="text-orange-400" />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'weather' && (
                <div className="max-w-sm">
                  <div className="glass-card p-8 text-center"
                    style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.08), rgba(155,89,255,0.06))' }}>
                    <div className="text-7xl mb-4">{selectedRegion.weather.icon}</div>
                    <p className="text-5xl font-800 gradient-text mb-2">{selectedRegion.weather.temp}°C</p>
                    <p className="text-slate-300 text-lg font-600 mb-1">{selectedRegion.weather.condition}</p>
                    <p className="text-slate-500 text-sm">{selectedRegion.name} · {selectedRegion.timezone}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}