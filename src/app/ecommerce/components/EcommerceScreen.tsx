'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  seller: string;
  sellerCountry: string;
  image: string;
  imageAlt: string;
  badge?: string;
  category: string;
  shipping: string;
  sold: number;
}

interface Store {
  id: string;
  name: string;
  logo: string;
  country: string;
  rating: number;
  products: number;
  followers: number;
  verified: boolean;
}

const products: Product[] = [
{ id: 'p1', name: 'Diamond Crystal Wireless Earbuds Pro', price: 49.99, originalPrice: 89.99, rating: 4.8, reviews: 12840, seller: 'TechVault Store', sellerCountry: '🇨🇳', image: "https://images.unsplash.com/photo-1612622837671-5a94ceef08f2", imageAlt: 'Crystal wireless earbuds in charging case', badge: 'Best Seller', category: 'Electronics', shipping: 'Free Shipping', sold: 45200 },
{ id: 'p2', name: 'Luxury Smart Watch Ultra Series 5', price: 129.99, originalPrice: 249.99, rating: 4.9, reviews: 8320, seller: 'LuxTime Official', sellerCountry: '🇯🇵', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b56e604c-1772503077245.png", imageAlt: 'Luxury smart watch with metal band', badge: 'Flash Sale', category: 'Wearables', shipping: 'Free Express', sold: 23100 },
{ id: 'p3', name: 'Holographic Gaming Keyboard RGB', price: 79.99, originalPrice: 119.99, rating: 4.7, reviews: 5640, seller: 'GameGear Pro', sellerCountry: '🇰🇷', image: "https://images.unsplash.com/photo-1642956715169-4ae69a070846", imageAlt: 'RGB gaming keyboard with holographic keys', badge: 'New Arrival', category: 'Gaming', shipping: 'Free Shipping', sold: 18900 },
{ id: 'p4', name: 'AI-Powered Noise Cancelling Headphones', price: 199.99, originalPrice: 349.99, rating: 4.9, reviews: 23100, seller: 'SoundMaster', sellerCountry: '🇩🇪', image: "https://img.rocket.new/generatedImages/rocket_gen_img_12a4d5808-1764677183408.png", imageAlt: 'Premium noise cancelling headphones in black', badge: 'Top Rated', category: 'Audio', shipping: 'Free Express', sold: 67800 },
{ id: 'p5', name: 'Carbon Fiber Laptop Stand Adjustable', price: 34.99, originalPrice: 59.99, rating: 4.6, reviews: 3210, seller: 'DeskPro Solutions', sellerCountry: '🇺🇸', image: "https://img.rocket.new/generatedImages/rocket_gen_img_124f08103-1766608242767.png", imageAlt: 'Carbon fiber adjustable laptop stand', category: 'Accessories', shipping: 'Free Shipping', sold: 12400 },
{ id: 'p6', name: 'Quantum Portable Charger 30000mAh', price: 44.99, originalPrice: 79.99, rating: 4.8, reviews: 9870, seller: 'PowerTech Global', sellerCountry: '🇨🇳', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1cd6aafeb-1766525524720.png", imageAlt: 'Large capacity portable charger in silver', badge: 'Hot Deal', category: 'Electronics', shipping: 'Free Shipping', sold: 34500 },
{ id: 'p7', name: 'Smart Home Hub Controller Pro', price: 89.99, originalPrice: 149.99, rating: 4.7, reviews: 4560, seller: 'SmartHome Inc', sellerCountry: '🇺🇸', image: "https://img.rocket.new/generatedImages/rocket_gen_img_129d5fe0b-1774177076157.png", imageAlt: 'Smart home hub controller device', category: 'Smart Home', shipping: 'Free Express', sold: 8900 },
{ id: 'p8', name: 'Professional Drone 4K Camera', price: 299.99, originalPrice: 499.99, rating: 4.8, reviews: 6780, seller: 'SkyTech Drones', sellerCountry: '🇨🇳', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1a09f3e7f-1770261427509.png", imageAlt: 'Professional drone with 4K camera', badge: 'Limited', category: 'Photography', shipping: 'Free Express', sold: 5600 }];


const stores: Store[] = [
{ id: 's1', name: 'TechVault Store', logo: 'TV', country: '🇨🇳 China', rating: 4.9, products: 1240, followers: 234000, verified: true },
{ id: 's2', name: 'LuxTime Official', logo: 'LT', country: '🇯🇵 Japan', rating: 4.8, products: 340, followers: 89000, verified: true },
{ id: 's3', name: 'GameGear Pro', logo: 'GG', country: '🇰🇷 Korea', rating: 4.7, products: 560, followers: 145000, verified: true },
{ id: 's4', name: 'SoundMaster', logo: 'SM', country: '🇩🇪 Germany', rating: 4.9, products: 280, followers: 312000, verified: true }];


const categories = ['All', 'Electronics', 'Wearables', 'Gaming', 'Audio', 'Accessories', 'Smart Home', 'Photography', 'Fashion', 'Beauty'];
const regions = ['Global', 'Middle East', 'Asia', 'Europe', 'Americas', 'Africa'];

export default function EcommerceScreen() {
  const [activeTab, setActiveTab] = useState<'products' | 'stores' | 'deals' | 'orders'>('products');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('Global');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (id: string) => setCart((prev) => prev.includes(id) ? prev : [...prev, id]);
  const toggleWishlist = (id: string) => setWishlist((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const discount = (p: Product) => Math.round((1 - p.price / p.originalPrice) * 100);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-700 gradient-text">hnShop</h1>
          <p className="text-sm text-slate-500 mt-0.5">Global marketplace — Amazon & Alibaba style</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}
          className="input-glass text-xs w-36">
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn-glass flex items-center gap-2 text-xs">
            <Icon name="PlusIcon" size={14} />
            Open Store
          </button>
          <button className="relative p-2.5 rounded-xl transition-all duration-150"
          style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)' }}>
            <Icon name="ShoppingCartIcon" size={18} className="text-cyan-glow" />
            {cart.length > 0 &&
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs font-700 flex items-center justify-center text-ice-black tabular-nums"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                {cart.length}
              </span>
            }
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden mb-6 h-44"
      style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.15) 0%, rgba(155,89,255,0.15) 50%, rgba(0,210,255,0.08) 100%)', border: '1px solid rgba(0,210,255,0.2)' }}>
        <div className="absolute inset-0 flex items-center px-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-700 animate-pulse"
              style={{ background: 'rgba(239,68,68,0.8)', color: 'white' }}>
                🔥 FLASH SALE
              </span>
              <span className="text-xs text-slate-400">Ends in 02:14:33</span>
            </div>
            <h2 className="text-3xl font-800 text-white mb-1">Up to <span className="gradient-text">70% OFF</span></h2>
            <p className="text-slate-400 text-sm">On thousands of products from verified global sellers</p>
            <button className="mt-3 btn-primary text-sm px-6 py-2">Shop Now →</button>
          </div>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-8xl opacity-20">🛍️</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['products', 'stores', 'deals', 'orders'] as const).map((t) =>
        <button key={t} onClick={() => setActiveTab(t)}
        className="px-5 py-2 rounded-lg text-sm font-600 capitalize transition-all duration-200"
        style={activeTab === t ?
        { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' } :
        { color: '#64748b' }}>
            {t}
          </button>
        )}
      </div>

      {activeTab === 'products' &&
      <>
          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, brands, stores..."
            className="input-glass pl-9 text-sm" />
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-glass text-sm w-44">
              <option value="trending">Trending</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
              <option value="bestseller">Best Sellers</option>
            </select>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['grid', 'list'] as const).map((v) =>
            <button key={v} onClick={() => setViewMode(v)}
            className="p-2 rounded-lg transition-all duration-150"
            style={viewMode === v ? { background: 'rgba(0,210,255,0.2)', color: '#00d2ff' } : { color: '#64748b' }}>
                  <Icon name={v === 'grid' ? 'Squares2X2Icon' : 'ListBulletIcon'} size={16} />
                </button>
            )}
            </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-5" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) =>
          <button key={cat} onClick={() => setSelectedCategory(cat)}
          className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-600 transition-all duration-150"
          style={selectedCategory === cat ?
          { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' } :
          { background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
                {cat}
              </button>
          )}
          </div>

          {/* Products Grid */}
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'}`}>
            {filtered.map((product) =>
          <div key={product.id} className="glass-card-hover overflow-hidden group">
                <div className="relative overflow-hidden" style={{ height: viewMode === 'grid' ? 180 : 120 }}>
                  <img src={product.image} alt={product.imageAlt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {product.badge &&
              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-700"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                      {product.badge}
                    </span>
              }
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-lg text-xs font-700"
              style={{ background: 'rgba(239,68,68,0.9)', color: 'white' }}>
                    -{discount(product)}%
                  </span>
                  <button onClick={() => toggleWishlist(product.id)}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                    <Icon name="HeartIcon" size={15}
                className={wishlist.includes(product.id) ? 'text-red-400' : 'text-slate-400'} />
                  </button>
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-400 mb-1 line-clamp-2 leading-relaxed">{product.name}</p>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-yellow-400 text-xs">★</span>
                    <span className="text-xs font-600 text-slate-300">{product.rating}</span>
                    <span className="text-xs text-slate-600">({product.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-700 text-base gradient-text-static">${product.price}</span>
                    <span className="text-xs text-slate-600 line-through">${product.originalPrice}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <span className="text-xs text-slate-500">{product.sellerCountry} {product.seller}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    <Icon name="TruckIcon" size={12} className="text-green-400" />
                    <span className="text-xs text-green-400">{product.shipping}</span>
                  </div>
                  <button onClick={() => addToCart(product.id)}
              className="w-full py-2 rounded-xl text-xs font-700 transition-all duration-150"
              style={cart.includes(product.id) ?
              { background: 'rgba(0,210,255,0.15)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' } :
              { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                    {cart.includes(product.id) ? '✓ Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              </div>
          )}
          </div>
        </>
      }

      {activeTab === 'stores' &&
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stores.map((store) =>
        <div key={store.id} className="glass-card p-5 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-800 mx-auto mb-3"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                {store.logo}
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <h3 className="font-700 text-slate-200 text-sm">{store.name}</h3>
                {store.verified && <Icon name="CheckBadgeIcon" size={14} className="text-cyan-glow" />}
              </div>
              <p className="text-xs text-slate-500 mb-3">{store.country}</p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
            { label: 'Rating', value: store.rating },
            { label: 'Products', value: store.products.toLocaleString() },
            { label: 'Followers', value: (store.followers / 1000).toFixed(0) + 'K' }].
            map((stat) =>
            <div key={stat.label} className="text-center">
                    <p className="font-700 text-sm gradient-text-static">{stat.value}</p>
                    <p className="text-xs text-slate-600">{stat.label}</p>
                  </div>
            )}
              </div>
              <button className="w-full py-2 rounded-xl text-xs font-700"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                Visit Store
              </button>
            </div>
        )}
          {/* Open Your Store CTA */}
          <div className="glass-card p-5 text-center flex flex-col items-center justify-center"
        style={{ border: '2px dashed rgba(0,210,255,0.2)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3"
          style={{ background: 'rgba(0,210,255,0.1)', border: '2px dashed rgba(0,210,255,0.3)' }}>
              <Icon name="PlusIcon" size={28} className="text-cyan-glow" />
            </div>
            <h3 className="font-700 text-slate-300 text-sm mb-1">Open Your Store</h3>
            <p className="text-xs text-slate-500 mb-4">Sell to millions worldwide</p>
            <button className="btn-primary text-xs px-6 py-2">Get Started</button>
          </div>
        </div>
      }

      {activeTab === 'deals' &&
      <div className="space-y-4">
          {['Flash Deals', 'Daily Deals', 'Clearance'].map((dealType) =>
        <div key={dealType}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-700 text-slate-200 flex items-center gap-2">
                  <span className="text-lg">{dealType === 'Flash Deals' ? '⚡' : dealType === 'Daily Deals' ? '🌟' : '🏷️'}</span>
                  {dealType}
                </h3>
                <button className="text-xs text-cyan-glow hover:underline">View All →</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {products.slice(0, 4).map((p) =>
            <div key={`${dealType}-${p.id}`} className="glass-card-hover overflow-hidden">
                    <img src={p.image} alt={p.imageAlt} className="w-full h-28 object-cover" />
                    <div className="p-2.5">
                      <p className="text-xs text-slate-400 line-clamp-1 mb-1">{p.name}</p>
                      <div className="flex items-center gap-1">
                        <span className="font-700 text-sm gradient-text-static">${p.price}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-md font-700"
                  style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>
                          -{discount(p)}%
                        </span>
                      </div>
                    </div>
                  </div>
            )}
              </div>
            </div>
        )}
        </div>
      }

      {activeTab === 'orders' &&
      <div className="max-w-2xl space-y-3">
          {[
        { id: '#HN-2024-001', product: 'Diamond Crystal Wireless Earbuds Pro', status: 'Delivered', date: 'Apr 15, 2026', price: 49.99, icon: '✅' },
        { id: '#HN-2024-002', product: 'Luxury Smart Watch Ultra Series 5', status: 'In Transit', date: 'Apr 18, 2026', price: 129.99, icon: '🚚' },
        { id: '#HN-2024-003', product: 'AI-Powered Noise Cancelling Headphones', status: 'Processing', date: 'Apr 20, 2026', price: 199.99, icon: '⏳' }].
        map((order) =>
        <div key={order.id} className="glass-card p-4 flex items-center gap-4">
              <span className="text-2xl">{order.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-700 text-slate-400">{order.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-600"
              style={{
                background: order.status === 'Delivered' ? 'rgba(52,211,153,0.15)' : order.status === 'In Transit' ? 'rgba(0,210,255,0.15)' : 'rgba(251,191,36,0.15)',
                color: order.status === 'Delivered' ? '#34d399' : order.status === 'In Transit' ? '#00d2ff' : '#fbbf24'
              }}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-500">{order.product}</p>
                <p className="text-xs text-slate-500 mt-0.5">{order.date}</p>
              </div>
              <span className="font-700 gradient-text-static">${order.price}</span>
            </div>
        )}
        </div>
      }
    </div>);

}