'use client';
import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import type { CartItem } from './MarketplaceScreen';

interface ProductGridProps {
  search: string;
  category: string;
  sort: string;
  onAddToCart: (item: Omit<CartItem, 'quantity'>) => void;
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Icon
          key={`star-${s}`}
          name="StarIcon"
          size={11}
          variant={s <= Math.round(rating) ? 'solid' : 'outline'}
          className={s <= Math.round(rating) ? 'text-yellow-400' : 'text-slate-600'}
        />
      ))}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="glass-card overflow-hidden animate-pulse">
      <div className="aspect-square" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="p-4 space-y-3">
        <div className="h-3 rounded-lg w-3/4" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 rounded-lg w-1/2" style={{ background: 'rgba(255,255,255,0.04)' }} />
        <div className="flex justify-between">
          <div className="h-5 rounded-lg w-16" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <div className="h-8 rounded-xl w-24" style={{ background: 'rgba(255,255,255,0.04)' }} />
        </div>
      </div>
    </div>
  );
}

export default function ProductGrid({ search, category, sort, onAddToCart }: ProductGridProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    setLoading(true);

    let query = supabase
      .from('marketplace_products')
      .select(`
        id, name, description, price, original_price, image_url, image_alt,
        category, badge, rating, reviews_count, sold_count,
        seller:user_profiles!marketplace_products_seller_id_fkey(id, username, full_name, avatar_url, is_verified)
      `)
      .eq('is_active', true);

    if (category !== 'cat-all') {
      query = query.eq('category', category);
    }

    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('rating', { ascending: false });
    } else if (sort === 'bestseller') {
      query = query.order('sold_count', { ascending: false });
    } else {
      // trending: by reviews + sold
      query = query.order('reviews_count', { ascending: false });
    }

    query.then(({ data, error }) => {
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    });
  }, [category, sort]);

  const toggleWishlist = (id: string, name: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.success('Removed from wishlist'); }
      else { next.add(id); toast.success(`${name} added to wishlist!`); }
      return next;
    });
  };

  const filtered = products.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const sellerName = p.seller?.full_name || p.seller?.username || '';
    return p.name.toLowerCase().includes(q) || sellerName.toLowerCase().includes(q);
  });

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-32 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={`pskel-${i}`} />)}
        </div>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(110,231,247,0.08)', border: '1px solid rgba(110,231,247,0.15)' }}
        >
          <Icon name="ShoppingBagIcon" size={28} className="text-cyan-glow" />
        </div>
        <h3 className="text-base font-600 text-slate-300 mb-2">No products found</h3>
        <p className="text-sm text-slate-500 max-w-xs">Try a different search term or category filter.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Showing <span className="text-slate-300 font-600">{filtered.length}</span> products
        </p>
        <p className="text-xs text-slate-600">Updated just now</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filtered.map((product) => {
          const sellerName = product.seller?.full_name || product.seller?.username || 'Seller';
          const sellerAvatar = product.seller?.avatar_url || '';
          const isWishlisted = wishlist.has(product.id);

          return (
            <div key={product.id} className="glass-card-hover overflow-hidden group">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <AppImage
                  src={product.image_url || 'https://picsum.photos/seed/default/400/400'}
                  alt={product.image_alt || product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-2 left-2">
                    <Badge variant={product.badge === 'sale' ? 'error' : product.badge === 'trending' ? 'warning' : 'success'}>
                      {product.badge === 'sale' ? '🔥 Sale' : product.badge === 'trending' ? '📈 Trending' : '✨ New'}
                    </Badge>
                  </div>
                )}
                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id, product.name)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100"
                  style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
                >
                  <Icon
                    name="HeartIcon"
                    size={16}
                    variant={isWishlisted ? 'solid' : 'outline'}
                    className={isWishlisted ? 'text-red-400' : 'text-white'}
                  />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                {/* Seller */}
                <div className="flex items-center gap-2 mb-2">
                  {sellerAvatar ? (
                    <AppImage
                      src={sellerAvatar}
                      alt={`${sellerName} avatar`}
                      width={20}
                      height={20}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-700 text-ice-black flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
                    >
                      {sellerName[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs text-slate-500 truncate">{sellerName}</span>
                  {product.seller?.is_verified && (
                    <Icon name="CheckBadgeIcon" size={12} className="text-cyan-glow flex-shrink-0" />
                  )}
                </div>

                <h3 className="text-sm font-600 text-slate-200 mb-2 line-clamp-2 leading-snug">{product.name}</h3>

                {/* Rating */}
                {product.rating > 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    {renderStars(product.rating)}
                    <span className="text-xs text-slate-500 tabular-nums">
                      {product.rating.toFixed(1)} ({product.reviews_count?.toLocaleString() || 0})
                    </span>
                  </div>
                )}

                {/* Price + Cart */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base font-700 gradient-text">${product.price}</span>
                    {product.original_price && (
                      <span className="text-xs text-slate-600 line-through ml-1.5">${product.original_price}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onAddToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image_url || '',
                      imageAlt: product.image_alt || product.name,
                      seller: sellerName,
                    })}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-600 text-ice-black transition-all duration-150 flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }}
                  >
                    <Icon name="ShoppingCartIcon" size={13} />
                    Add
                  </button>
                </div>

                {product.sold_count > 0 && (
                  <p className="text-xs text-slate-600 mt-1.5 tabular-nums">{product.sold_count.toLocaleString()} sold</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}