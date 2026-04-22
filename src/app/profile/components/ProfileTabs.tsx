'use client';
import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';


type ProfileTab = 'posts' | 'reels' | 'tagged' | 'shop';

function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n?.toString() || '0';
}

export default function ProfileTabs() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userVideos, setUserVideos] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [loadingShop, setLoadingShop] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [reelCount, setReelCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    // Load posts
    setLoadingPosts(true);
    supabase
      .from('posts')
      .select('id, image_url, image_alt, likes_count, comments_count, content, created_at')
      .eq('user_id', user.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUserPosts(data || []);
        setPostCount(data?.length || 0);
        setLoadingPosts(false);
      });

    // Load videos
    setLoadingVideos(true);
    supabase
      .from('videos')
      .select('id, thumbnail_url, thumbnail_alt, views_count, likes_count, duration, title')
      .eq('user_id', user.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUserVideos(data || []);
        setReelCount(data?.length || 0);
        setLoadingVideos(false);
      });

    // Load shop items
    setLoadingShop(true);
    supabase
      .from('marketplace_products')
      .select('id, name, price, image_url, image_alt, sold_count')
      .eq('seller_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setShopItems(data || []);
        setLoadingShop(false);
      });
  }, [user]);

  const tabs: { id: ProfileTab; label: string; icon: string; count?: string }[] = [
    { id: 'posts', label: 'Posts', icon: 'Squares2X2Icon', count: postCount > 0 ? formatNum(postCount) : undefined },
    { id: 'reels', label: 'Reels', icon: 'FilmIcon', count: reelCount > 0 ? formatNum(reelCount) : undefined },
    { id: 'tagged', label: 'Tagged', icon: 'TagIcon' },
    { id: 'shop', label: 'Shop', icon: 'ShoppingBagIcon', count: shopItems.length > 0 ? String(shopItems.length) : undefined },
  ];

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-white/08 mb-6">
        {tabs.map((t) => (
          <button
            key={`ptab-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-600 transition-all duration-150 border-b-2 -mb-px ${
              activeTab === t.id ? 'tab-active' : 'tab-inactive'
            }`}
          >
            <Icon name={t.icon as any} size={16} />
            {t.label}
            {t.count && (
              <span className="text-xs text-slate-600 tabular-nums">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {activeTab === 'posts' && (
        loadingPosts ? (
          <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={`pskel-${i}`} className="aspect-square rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : userPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.15)' }}>
              <Icon name="Squares2X2Icon" size={28} className="text-cyan-glow" />
            </div>
            <h3 className="text-base font-600 text-slate-300 mb-2">No posts yet</h3>
            <p className="text-sm text-slate-500">Share your first post from the home feed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
            {userPosts.map((post) => (
              <div key={post.id} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer" style={{ background: 'rgba(255,255,255,0.04)' }}>
                {post.image_url ? (
                  <AppImage
                    src={post.image_url}
                    alt={post.image_alt || 'Post image'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-3">
                    <p className="text-xs text-slate-400 text-center line-clamp-4">{post.content}</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center gap-4 text-white text-sm font-600">
                    <span className="flex items-center gap-1">
                      <Icon name="HeartIcon" size={16} variant="solid" />
                      {formatNum(post.likes_count || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="ChatBubbleOvalLeftIcon" size={16} variant="solid" />
                      {formatNum(post.comments_count || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Reels grid */}
      {activeTab === 'reels' && (
        loadingVideos ? (
          <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`rskel-${i}`} className="rounded-xl animate-pulse" style={{ aspectRatio: '9/16', background: 'rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : userVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.15)' }}>
              <Icon name="FilmIcon" size={28} className="text-cyan-glow" />
            </div>
            <h3 className="text-base font-600 text-slate-300 mb-2">No reels yet</h3>
            <p className="text-sm text-slate-500">Upload your first video from the short videos section.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
            {userVideos.map((video) => (
              <div key={video.id} className="group relative rounded-xl overflow-hidden cursor-pointer" style={{ aspectRatio: '9/16' }}>
                {video.thumbnail_url ? (
                  <AppImage
                    src={video.thumbnail_url}
                    alt={video.thumbnail_alt || video.title || 'Video thumbnail'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 33vw, 20vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Icon name="PlayIcon" size={32} className="text-slate-600" />
                  </div>
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
                {video.duration > 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="text-xs font-600 px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(0,0,0,0.6)', color: '#e2e8f0' }}>
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white font-600">
                  <Icon name="PlayIcon" size={12} variant="solid" />
                  {formatNum(video.views_count || 0)}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Tagged */}
      {activeTab === 'tagged' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.15)' }}>
            <Icon name="TagIcon" size={28} className="text-cyan-glow" />
          </div>
          <h3 className="text-base font-600 text-slate-300 mb-2">No tagged posts</h3>
          <p className="text-sm text-slate-500">Posts you are tagged in will appear here.</p>
        </div>
      )}

      {/* Shop */}
      {activeTab === 'shop' && (
        loadingShop ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={`sskel-${i}`} className="glass-card animate-pulse overflow-hidden">
                <div className="aspect-square" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded-lg w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
                  <div className="h-4 rounded-lg w-1/3" style={{ background: 'rgba(255,255,255,0.04)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : shopItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.15)' }}>
              <Icon name="ShoppingBagIcon" size={28} className="text-cyan-glow" />
            </div>
            <h3 className="text-base font-600 text-slate-300 mb-2">No shop items yet</h3>
            <p className="text-sm text-slate-500">List your first product in the marketplace.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {shopItems.map((item) => (
              <Link key={item.id} href="/marketplace">
                <div className="glass-card-hover overflow-hidden cursor-pointer">
                  <div className="aspect-square overflow-hidden">
                    <AppImage
                      src={item.image_url || 'https://picsum.photos/seed/shop/300/300'}
                      alt={item.image_alt || item.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-600 text-slate-200 mb-1">{item.name}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-700 gradient-text">${item.price}</span>
                      <span className="text-xs text-slate-500">{item.sold_count || 0} sold</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}