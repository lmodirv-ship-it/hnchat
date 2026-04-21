'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import type { CartItem } from './MarketplaceScreen';

const products = [
  {
    id: 'prod-001',
    name: 'Neon Cityscape NFT Pack',
    seller: 'Sara Nova',
    sellerAvatar: 'https://i.pravatar.cc/80?img=47',
    price: 120,
    originalPrice: null,
    image: 'https://picsum.photos/seed/prod1/400/400',
    imageAlt: 'Digital art product showing neon-lit futuristic cityscape with purple and blue tones',
    rating: 4.9,
    reviews: 234,
    sold: 12,
    category: 'cat-digital',
    badge: 'new' as const,
    verified: true,
    inWishlist: false,
  },
  {
    id: 'prod-002',
    name: 'Wireless Noise-Cancelling Headphones',
    seller: 'TechVault Store',
    sellerAvatar: 'https://i.pravatar.cc/80?img=20',
    price: 189,
    originalPrice: 249,
    image: 'https://picsum.photos/seed/prod2/400/400',
    imageAlt: 'Product photo of premium wireless headphones in matte black with silver accents',
    rating: 4.7,
    reviews: 1892,
    sold: 4231,
    category: 'cat-tech',
    badge: 'sale' as const,
    verified: true,
    inWishlist: true,
  },
  {
    id: 'prod-003',
    name: 'Indie Album — "Signals" Digital Download',
    seller: 'Zara Moon',
    sellerAvatar: 'https://i.pravatar.cc/80?img=56',
    price: 12,
    originalPrice: null,
    image: 'https://picsum.photos/seed/prod3/400/400',
    imageAlt: 'Album cover art for Signals by Zara Moon featuring abstract sound wave visualization',
    rating: 4.8,
    reviews: 567,
    sold: 3102,
    category: 'cat-music',
    badge: 'trending' as const,
    verified: true,
    inWishlist: false,
  },
  {
    id: 'prod-004',
    name: 'Mechanical Keyboard — RGB Compact 65%',
    seller: 'Dex Volta',
    sellerAvatar: 'https://i.pravatar.cc/80?img=15',
    price: 145,
    originalPrice: 180,
    image: 'https://picsum.photos/seed/prod4/400/400',
    imageAlt: 'Product photo of compact mechanical keyboard with RGB lighting in dark gaming setup',
    rating: 4.6,
    reviews: 3421,
    sold: 8764,
    category: 'cat-tech',
    badge: 'sale' as const,
    verified: false,
    inWishlist: false,
  },
  {
    id: 'prod-005',
    name: 'Abstract Minds Art Bundle',
    seller: 'Sara Nova',
    sellerAvatar: 'https://i.pravatar.cc/80?img=47',
    price: 35,
    originalPrice: null,
    image: 'https://picsum.photos/seed/prod5/400/400',
    imageAlt: 'Digital art bundle product featuring collection of abstract mind visualization artworks',
    rating: 5.0,
    reviews: 89,
    sold: 234,
    category: 'cat-digital',
    badge: 'new' as const,
    verified: true,
    inWishlist: false,
  },
  {
    id: 'prod-006',
    name: 'Gourmet Coffee Subscription Box',
    seller: 'Nora Flux',
    sellerAvatar: 'https://i.pravatar.cc/80?img=44',
    price: 44,
    originalPrice: 55,
    image: 'https://picsum.photos/seed/prod6/400/400',
    imageAlt: 'Product photo of artisan coffee subscription box with premium single-origin coffee bags',
    rating: 4.5,
    reviews: 712,
    sold: 2891,
    category: 'cat-food',
    badge: 'sale' as const,
    verified: true,
    inWishlist: false,
  },
  {
    id: 'prod-007',
    name: '"The Creator\'s Playbook" eBook',
    seller: 'Marco Vega',
    sellerAvatar: 'https://i.pravatar.cc/80?img=8',
    price: 19,
    originalPrice: null,
    image: 'https://picsum.photos/seed/prod7/400/400',
    imageAlt: 'Digital book cover for The Creator Playbook with minimalist design and bold typography',
    rating: 4.8,
    reviews: 2134,
    sold: 11203,
    category: 'cat-books',
    badge: 'trending' as const,
    verified: false,
    inWishlist: true,
  },
  {
    id: 'prod-008',
    name: 'Gaming Controller — Pro Edition',
    seller: 'Dex Volta',
    sellerAvatar: 'https://i.pravatar.cc/80?img=15',
    price: 89,
    originalPrice: 110,
    image: 'https://picsum.photos/seed/prod8/400/400',
    imageAlt: 'Product photo of professional gaming controller in black with textured grip and LED indicators',
    rating: 4.4,
    reviews: 891,
    sold: 5432,
    category: 'cat-gaming',
    badge: 'sale' as const,
    verified: false,
    inWishlist: false,
  },
  {
    id: 'prod-009',
    name: 'Vintage Oversized Hoodie — Midnight',
    seller: 'Lena Kova',
    sellerAvatar: 'https://i.pravatar.cc/80?img=32',
    price: 68,
    originalPrice: null,
    image: 'https://picsum.photos/seed/prod9/400/400',
    imageAlt: 'Fashion product photo of oversized dark hoodie on model against minimalist background',
    rating: 4.6,
    reviews: 445,
    sold: 1876,
    category: 'cat-fashion',
    badge: 'new' as const,
    verified: true,
    inWishlist: false,
  },
  {
    id: 'prod-010',
    name: 'AI Prompt Engineering Course',
    seller: 'James Orbit',
    sellerAvatar: 'https://i.pravatar.cc/80?img=12',
    price: 99,
    originalPrice: 149,
    image: 'https://picsum.photos/seed/prod10/400/400',
    imageAlt: 'Digital course product cover for AI prompt engineering with futuristic neural network visualization',
    rating: 4.9,
    reviews: 3782,
    sold: 14502,
    category: 'cat-digital',
    badge: 'trending' as const,
    verified: false,
    inWishlist: false,
  },
];

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

export default function ProductGrid({ search, category, sort, onAddToCart }: ProductGridProps) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set(products.filter((p) => p.inWishlist).map((p) => p.id)));

  const toggleWishlist = (id: string, name: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast.success('Removed from wishlist'); }
      else { next.add(id); toast.success(`${name} added to wishlist!`); }
      return next;
    });
  };

  let filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.seller.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'cat-all' || p.category === category;
    return matchSearch && matchCat;
  });

  if (sort === 'price-low') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sort === 'price-high') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sort === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sort === 'bestseller') filtered = [...filtered].sort((a, b) => b.sold - a.sold);

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
        {filtered.map((product) => (
          <div key={product.id} className="glass-card-hover overflow-hidden group">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <AppImage
                src={product.image}
                alt={product.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Badges */}
              <div className="absolute top-2 left-2">
                <Badge variant={product.badge}>
                  {product.badge === 'new' ? '✦ New' : product.badge === 'trending' ? '🔥 Trending' : '% Sale'}
                </Badge>
              </div>
              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className="absolute top-2 right-2 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 opacity-0 group-hover:opacity-100"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
              >
                <Icon
                  name="HeartIcon"
                  size={16}
                  variant={wishlist.has(product.id) ? 'solid' : 'outline'}
                  className={wishlist.has(product.id) ? 'text-red-400' : 'text-white'}
                />
              </button>
              {/* Quick add overlay */}
              <div className="absolute inset-x-0 bottom-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <button
                  onClick={() => {
                    onAddToCart({ id: product.id, name: product.name, price: product.price, image: product.image, imageAlt: product.imageAlt, seller: product.seller });
                    toast.success(`${product.name} added to cart!`);
                  }}
                  className="w-full py-2 rounded-xl text-sm font-600 text-ice-black flex items-center justify-center gap-2 transition-all duration-150"
                  style={{ background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }}
                >
                  <Icon name="ShoppingCartIcon" size={14} />
                  Quick Add
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 space-y-2">
              {/* Seller */}
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                  <AppImage
                    src={product.sellerAvatar}
                    alt={`${product.seller} marketplace seller avatar`}
                    width={20}
                    height={20}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-xs text-slate-500 truncate">{product.seller}</span>
                {product.verified && <Icon name="CheckBadgeIcon" size={12} className="text-cyan-glow flex-shrink-0" />}
              </div>

              <p className="text-sm font-600 text-slate-200 line-clamp-2 leading-snug">{product.name}</p>

              {/* Rating */}
              <div className="flex items-center gap-1.5">
                {renderStars(product.rating)}
                <span className="text-xs text-slate-500 tabular-nums">({product.reviews.toLocaleString()})</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-700 gradient-text tabular-nums">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-slate-500 line-through tabular-nums">${product.originalPrice}</span>
                  )}
                </div>
                <span className="text-xs text-slate-600 tabular-nums">{product.sold.toLocaleString()} sold</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}