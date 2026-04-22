'use client';
import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { CartItem } from './MarketplaceScreen';

interface FeaturedBannerProps {
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
}

function FeaturedSkeleton() {
  return (
    <div className="mb-8">
      <div
        className="relative rounded-2xl overflow-hidden animate-pulse"
        style={{ aspectRatio: '16/5', minHeight: 200, background: 'rgba(255,255,255,0.04)' }}
      />
    </div>
  );
}

export default function FeaturedBanner({ onAddToCart }: FeaturedBannerProps) {
  const [featured, setFeatured] = useState<any[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('marketplace_products')
      .select(`
        id, name, description, price, original_price, image_url, image_alt,
        badge, rating, sold_count,
        seller:user_profiles!marketplace_products_seller_id_fkey(id, username, full_name)
      `)
      .eq('is_active', true)
      .not('badge', 'is', null)
      .neq('badge', '')
      .order('sold_count', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setFeatured(data || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <FeaturedSkeleton />;
  if (featured.length === 0) return null;

  const item = featured[activeSlide] || featured[0];
  const sellerName = item.seller?.full_name || item.seller?.username || 'Creator';

  const handleAdd = () => {
    onAddToCart({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      image: item.image_url || '',
      imageAlt: item.image_alt || item.name,
      seller: sellerName,
    });
    toast.success(`${item.name} added to cart!`);
  };

  const discount = item.original_price && item.original_price > item.price
    ? Math.round((1 - item.price / item.original_price) * 100)
    : null;

  return (
    <div className="mb-8">
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ aspectRatio: '16/5', minHeight: 200 }}
      >
        <AppImage
          src={item.image_url || 'https://picsum.photos/seed/featured/900/400'}
          alt={item.image_alt || item.name}
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
              {item.badge && (
                <Badge variant={item.badge === 'sale' ? 'error' : item.badge === 'trending' ? 'warning' : 'success'}>
                  {item.badge === 'sale' ? '🔥 Sale' : item.badge === 'trending' ? '📈 Trending' : '✨ New'}
                </Badge>
              )}
              {item.rating > 0 && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Icon name="StarIcon" size={12} variant="solid" className="text-yellow-400" />
                  {Number(item.rating).toFixed(1)} rating
                </span>
              )}
            </div>
            <h2 className="text-2xl md:text-3xl font-700 text-white leading-tight">{item.name}</h2>
            {item.description && (
              <p className="text-sm text-slate-300 leading-relaxed max-w-sm line-clamp-2">{item.description}</p>
            )}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-700 gradient-text tabular-nums">${Number(item.price).toFixed(2)}</span>
              {item.original_price && (
                <span className="text-lg text-slate-500 line-through tabular-nums">${Number(item.original_price).toFixed(2)}</span>
              )}
              {discount && (
                <span
                  className="text-sm font-700 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                >
                  -{discount}% OFF
                </span>
              )}
            </div>
            {item.sold_count > 0 && (
              <p className="text-xs text-slate-500">{item.sold_count.toLocaleString()} sold</p>
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
        {featured.length > 1 && (
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
        )}
      </div>
    </div>
  );
}