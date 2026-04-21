'use client';
import React, { useState } from 'react';
import FeaturedBanner from './FeaturedBanner';
import ProductGrid from './ProductGrid';
import CartSidebar from './CartSidebar';
import Icon from '@/components/ui/AppIcon';
import { Toaster } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  imageAlt: string;
  seller: string;
  quantity: number;
}

const categories = [
  { id: 'cat-all', label: 'All', icon: 'Squares2X2Icon' },
  { id: 'cat-digital', label: 'Digital Art', icon: 'SparklesIcon' },
  { id: 'cat-fashion', label: 'Fashion', icon: 'ShoppingBagIcon' },
  { id: 'cat-tech', label: 'Tech', icon: 'CpuChipIcon' },
  { id: 'cat-music', label: 'Music', icon: 'MusicalNoteIcon' },
  { id: 'cat-books', label: 'Books', icon: 'BookOpenIcon' },
  { id: 'cat-food', label: 'Food & Drink', icon: 'CakeIcon' },
  { id: 'cat-gaming', label: 'Gaming', icon: 'PuzzlePieceIcon' },
];

export default function MarketplaceScreen() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('cat-all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('trending');

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((c) => c.id !== id));
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCartItems((prev) => prev.map((c) => c.id === id ? { ...c, quantity: qty } : c));
  };

  const totalCount = cartItems.reduce((sum, c) => sum + c.quantity, 0);

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 py-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-700 text-slate-200">Marketplace</h1>
            <p className="text-sm text-slate-500 mt-0.5">Discover and buy from creators worldwide</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="btn-glass flex items-center gap-2 text-sm">
              <Icon name="PlusIcon" size={16} />
              Sell Item
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-xl transition-all duration-150"
              style={{ background: 'rgba(110,231,247,0.1)', border: '1px solid rgba(110,231,247,0.2)' }}
            >
              <Icon name="ShoppingCartIcon" size={20} className="text-cyan-glow" />
              {totalCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-700 flex items-center justify-center text-ice-black tabular-nums"
                  style={{ background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }}
                >
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, creators, categories..."
              className="input-glass pl-9 text-sm"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-glass text-sm w-full sm:w-48"
          >
            <option value="trending">Trending</option>
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="bestseller">Best Sellers</option>
          </select>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600 transition-all duration-150 flex-shrink-0 ${
                activeCategory === cat.id
                  ? 'text-ice-black' :'text-slate-400 hover:text-slate-200 border border-white/08 hover:bg-white/05'
              }`}
              style={activeCategory === cat.id ? { background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' } : {}}
            >
              <Icon name={cat.icon as any} size={15} />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured banner */}
        <FeaturedBanner onAddToCart={addToCart} />

        {/* Product grid */}
        <ProductGrid
          search={search}
          category={activeCategory}
          sort={sort}
          onAddToCart={addToCart}
        />
      </div>

      {/* Cart sidebar */}
      <CartSidebar
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
      />
    </>
  );
}