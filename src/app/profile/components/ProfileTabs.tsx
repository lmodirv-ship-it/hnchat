'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

import Link from 'next/link';

type ProfileTab = 'posts' | 'reels' | 'tagged' | 'shop';

const postImages = [
  { id: 'pgrid-001', src: 'https://picsum.photos/seed/pg1/400/400', alt: 'Post showing abstract digital painting with blue and purple gradient waves', likes: '12.4K', comments: '342' },
  { id: 'pgrid-002', src: 'https://picsum.photos/seed/pg2/400/400', alt: 'Post photo of mountain hiking trail with golden hour lighting and misty peaks', likes: '8.7K', comments: '198' },
  { id: 'pgrid-003', src: 'https://picsum.photos/seed/pg3/400/400', alt: 'Post showing laptop with code editor and coffee cup on minimalist desk setup', likes: '5.1K', comments: '87' },
  { id: 'pgrid-004', src: 'https://picsum.photos/seed/pg4/400/400', alt: 'Post of vibrant street food market at night with colorful lanterns and crowds', likes: '19.2K', comments: '521' },
  { id: 'pgrid-005', src: 'https://picsum.photos/seed/pg5/400/400', alt: 'Post featuring close-up of futuristic robot hand touching human hand', likes: '31.8K', comments: '1.2K' },
  { id: 'pgrid-006', src: 'https://picsum.photos/seed/pg6/400/400', alt: 'Post of aerial view of tropical island with turquoise water and white sand', likes: '24.6K', comments: '678' },
  { id: 'pgrid-007', src: 'https://picsum.photos/seed/pg7/400/400', alt: 'Post showing neon-lit cyberpunk alley with rain reflections on wet pavement', likes: '16.3K', comments: '445' },
  { id: 'pgrid-008', src: 'https://picsum.photos/seed/pg8/400/400', alt: 'Post of minimalist home office setup with plants and natural lighting', likes: '9.8K', comments: '234' },
  { id: 'pgrid-009', src: 'https://picsum.photos/seed/pg9/400/400', alt: 'Post featuring colorful abstract 3D render of interconnected geometric shapes', likes: '14.7K', comments: '367' },
];

const reelThumbs = [
  { id: 'rgrid-001', src: 'https://picsum.photos/seed/rg1/300/500', alt: 'Reel thumbnail of time-lapse digital art creation process', views: '2.4M', duration: '0:47' },
  { id: 'rgrid-002', src: 'https://picsum.photos/seed/rg2/300/500', alt: 'Reel thumbnail showing behind the scenes of photography shoot', views: '1.1M', duration: '1:12' },
  { id: 'rgrid-003', src: 'https://picsum.photos/seed/rg3/300/500', alt: 'Reel thumbnail of coding tutorial with fast-forward animation', views: '3.6M', duration: '2:34' },
  { id: 'rgrid-004', src: 'https://picsum.photos/seed/rg4/300/500', alt: 'Reel thumbnail of travel montage with aerial drone footage', views: '5.2M', duration: '0:58' },
  { id: 'rgrid-005', src: 'https://picsum.photos/seed/rg5/300/500', alt: 'Reel thumbnail of product unboxing and review video', views: '876K', duration: '1:33' },
  { id: 'rgrid-006', src: 'https://picsum.photos/seed/rg6/300/500', alt: 'Reel thumbnail showing AI art generation from text prompt', views: '4.1M', duration: '1:08' },
];

const shopItems = [
  { id: 'shop-001', name: 'Gradient Series Vol.1', price: '$49', image: 'https://picsum.photos/seed/shop1/300/300', imageAlt: 'Digital artwork product showing gradient color series with abstract waves', sold: 47 },
  { id: 'shop-002', name: 'Neon Cityscape NFT', price: '$120', image: 'https://picsum.photos/seed/shop2/300/300', imageAlt: 'NFT digital art product of neon-lit futuristic cityscape at night', sold: 12 },
  { id: 'shop-003', name: 'Abstract Minds Pack', price: '$35', image: 'https://picsum.photos/seed/shop3/300/300', imageAlt: 'Digital art pack product featuring abstract mind visualization artworks', sold: 89 },
  { id: 'shop-004', name: 'Preset Collection', price: '$29', image: 'https://picsum.photos/seed/shop4/300/300', imageAlt: 'Photo editing preset collection product with before and after examples', sold: 234 },
];

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

  const tabs: { id: ProfileTab; label: string; icon: string; count?: string }[] = [
    { id: 'posts', label: 'Posts', icon: 'Squares2X2Icon', count: '1.2K' },
    { id: 'reels', label: 'Reels', icon: 'FilmIcon', count: '84' },
    { id: 'tagged', label: 'Tagged', icon: 'TagIcon', count: '312' },
    { id: 'shop', label: 'Shop', icon: 'ShoppingBagIcon', count: '4' },
  ];

  return (
    <div>
      {/* Tab bar */}
      <div className="flex border-b border-white/08 mb-6">
        {tabs.map((t) => (
          <button
            key={`ptab-${t.id}`}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3.5 text-sm font-600 transition-all duration-150 border-b-2 -mb-px ${
              activeTab === t.id
                ? 'tab-active' :'tab-inactive'
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
        <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
          {postImages.map((img) => (
            <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
              <AppImage
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-4 text-white text-sm font-600">
                  <span className="flex items-center gap-1">
                    <Icon name="HeartIcon" size={16} variant="solid" />
                    {img.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="ChatBubbleOvalLeftIcon" size={16} variant="solid" />
                    {img.comments}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reels grid */}
      {activeTab === 'reels' && (
        <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
          {reelThumbs.map((r) => (
            <div key={r.id} className="group relative rounded-xl overflow-hidden cursor-pointer" style={{ aspectRatio: '9/16' }}>
              <AppImage
                src={r.src}
                alt={r.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 33vw, 20vw"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }}
              />
              <div className="absolute top-2 right-2">
                <span
                  className="text-xs font-600 px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(0,0,0,0.6)', color: '#e2e8f0' }}
                >
                  {r.duration}
                </span>
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white font-600">
                <Icon name="PlayIcon" size={12} variant="solid" />
                {r.views}
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(110,231,247,0.2)', backdropFilter: 'blur(8px)' }}
                >
                  <Icon name="PlayIcon" size={18} className="text-cyan-glow" variant="solid" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tagged */}
      {activeTab === 'tagged' && (
        <div className="grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-1.5">
          {postImages.slice(0, 6).map((img, i) => (
            <div key={`tagged-${img.id}`} className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer">
              <AppImage
                src={`https://picsum.photos/seed/tag${i + 1}/400/400`}
                alt={`Tagged post ${i + 1} featuring content where Alex Mercer was mentioned`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 33vw, 20vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Icon name="TagIcon" size={24} className="text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shop */}
      {activeTab === 'shop' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {shopItems.map((item) => (
            <Link key={item.id} href="/marketplace">
              <div className="glass-card-hover overflow-hidden cursor-pointer">
                <div className="aspect-square overflow-hidden">
                  <AppImage
                    src={item.image}
                    alt={item.imageAlt}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm font-600 text-slate-200 mb-1">{item.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-700 gradient-text">{item.price}</span>
                    <span className="text-xs text-slate-500">{item.sold} sold</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}