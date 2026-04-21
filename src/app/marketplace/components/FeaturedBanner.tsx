'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import type { CartItem } from './MarketplaceScreen';

const featured = [
  {
    id: 'feat-001',
    name: 'Gradient Series Vol.2 — Limited Drop',
    description: 'Exclusive digital art collection by Sara Nova. Only 50 pieces available. Each comes with a unique NFT certificate.',
    price: 79,
    originalPrice: 120,
    image: 'https://picsum.photos/seed/feat1/900/400',
    imageAlt: 'Featured product banner showing vibrant gradient digital art collection with purple and cyan swirls',
    seller: 'Sara Nova',
    tag: 'Limited Edition',
    badge: 'sale' as const,
    rating: 4.9,
    sold: 31,
    total: 50,
  },
  {
    id: 'feat-002',
    name: 'Pro Creator Preset Bundle',
    description: 'Over 200 Lightroom and video color grading presets used by 10,000+ creators on hnChat.',
    price: 49,
    originalPrice: 89,
    image: 'https://picsum.photos/seed/feat2/900/400',
    imageAlt: 'Featured product banner showing professional photo editing preset examples with dramatic color grades',
    seller: 'Dex Volta',
    tag: 'Best Seller',
    badge: 'trending' as const,
    rating: 4.7,
    sold: 4821,
    total: null,
  },
];

interface FeaturedBannerProps {
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
}

export default function FeaturedBanner({ onAddToCart }: FeaturedBannerProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const item = featured[activeSlide];

  const handleAdd = () => {
    onAddToCart({ id: item.id, name: item.name, price: item.price, image: item.image, imageAlt: item.imageAlt, seller: item.seller });
    toast.success(`${item.name} added to cart!`);
  };

  return (
    <div className="mb-8">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ aspectRatio: '16/5', minHeight: 200 }}
      >
        <AppImage
          src={item.image}
          alt={item.imageAlt}
          fill
          priority
          className="object-cover transition-all duration-500"
          sizes="(max-width: 1200px) 100vw, 80vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)' }}
        />

        {/* Content */}
        <div className="absolute inset-0 flex items-center px-8 md:px-12">
          <div className="max-w-lg space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={item.badge}>{item.tag}</Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Icon name="StarIcon" size={12} variant="solid" className="text-yellow-400" />
                {item.rating} rating
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-700 text-white leading-tight">{item.name}</h2>
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">{item.description}</p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-700 gradient-text tabular-nums">${item.price}</span>
              <span className="text-lg text-slate-500 line-through tabular-nums">${item.originalPrice}</span>
              <span
                className="text-sm font-700 px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
              >
                -{Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
              </span>
            </div>
            {item.total && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{item.sold} of {item.total} sold</span>
                  <span className="text-cyan-glow font-600">{item.total - item.sold} left</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)', width: 200 }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(item.sold / item.total) * 100}%`, background: 'linear-gradient(90deg, #6ee7f7, #a78bfa)' }}
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <button onClick={handleAdd} className="btn-primary flex items-center gap-2 text-sm">
                <Icon name="ShoppingCartIcon" size={16} />
                Add to Cart
              </button>
              <button className="btn-glass text-sm">View Details</button>
            </div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-4 right-6 flex items-center gap-2">
          {featured.map((_, i) => (
            <button
              key={`slide-${i}`}
              onClick={() => setActiveSlide(i)}
              className={`rounded-full transition-all duration-200 ${i === activeSlide ? 'w-6 h-2' : 'w-2 h-2'}`}
              style={{
                background: i === activeSlide
                  ? 'linear-gradient(135deg, #6ee7f7, #a78bfa)'
                  : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}