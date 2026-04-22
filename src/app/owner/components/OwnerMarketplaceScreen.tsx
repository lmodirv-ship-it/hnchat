'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  is_active: boolean;
  stock_quantity: number | null;
  image_url: string | null;
  created_at: string;
  seller_id: string | null;
  user_profiles?: { username: string | null; full_name: string | null } | null;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function OwnerMarketplaceScreen() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, totalValue: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadProducts = useCallback(async (p = 0, q = '', f = filter) => {
    setLoading(true);
    try {
      let query = supabase
        .from('marketplace_products')
        .select('*, user_profiles!marketplace_products_seller_id_fkey(username, full_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1);

      if (q) query = query.ilike('name', `%${q}%`);
      if (f === 'active') query = query.eq('is_active', true);
      if (f === 'inactive') query = query.eq('is_active', false);

      const { data, error } = await query;
      if (error) throw error;
      setProducts(data || []);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const loadStats = useCallback(async () => {
    const { data } = await supabase.from('marketplace_products').select('is_active, price');
    if (data) {
      const active = data.filter(p => p.is_active).length;
      setStats({
        total: data.length,
        active,
        inactive: data.length - active,
        totalValue: data.reduce((s, p) => s + (p.price || 0), 0),
      });
    }
  }, []);

  useEffect(() => {
    loadProducts(0, search, filter);
    loadStats();
    const channel = supabase.channel('owner-marketplace')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'marketplace_products' }, () => {
        loadProducts(page, search, filter);
        loadStats();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const toggleProduct = async (id: string, current: boolean) => {
    setActionLoading(id);
    try {
      const { error } = await supabase.from('marketplace_products').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
      showToast(`Product ${!current ? 'activated' : 'deactivated'}`, 'success');
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('marketplace_products').delete().eq('id', id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== id));
      showToast('Product deleted', 'success');
      loadStats();
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadProducts(0, search, filter);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Marketplace</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage all product listings</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(110,231,183,0.1)', color: '#6ee7b7', border: '1px solid rgba(110,231,183,0.2)' }}>
          <Icon name="ShoppingBagIcon" size={14} style={{ color: '#6ee7b7' }} />
          Marketplace Manager
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.total, icon: 'ShoppingBagIcon', color: '#6ee7b7' },
          { label: 'Active', value: stats.active, icon: 'CheckCircleIcon', color: '#34d399' },
          { label: 'Inactive', value: stats.inactive, icon: 'XCircleIcon', color: '#f87171' },
          { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: 'BanknotesIcon', color: '#fbbf24' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon as any} size={16} style={{ color: s.color }} />
              <span className="text-xs" style={{ color: '#78716c' }}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-stone-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: 'rgba(110,231,183,0.15)', border: '1px solid rgba(110,231,183,0.3)' }}>
            Search
          </button>
        </form>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(0); }}
              className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
              style={{
                background: filter === f ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.04)',
                color: filter === f ? '#6ee7b7' : '#78716c',
                border: `1px solid ${filter === f ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Product', 'Seller', 'Price', 'Stock', 'Status', 'Added', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#57534e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(110,231,183,0.1)' }}>
                        <Icon name="ShoppingBagIcon" size={16} style={{ color: '#6ee7b7' }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[160px]">{p.name}</p>
                        <p className="text-xs truncate max-w-[160px]" style={{ color: '#57534e' }}>{p.category || 'Uncategorized'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>
                    {p.user_profiles?.username || p.user_profiles?.full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#fbbf24' }}>${p.price}</td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>{p.stock_quantity ?? '∞'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{
                        background: p.is_active ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                        color: p.is_active ? '#34d399' : '#f87171',
                      }}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#57534e' }}>{timeAgo(p.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleProduct(p.id, p.is_active)}
                        disabled={actionLoading === p.id}
                        className="p-1.5 rounded-lg transition-all hover:bg-white/5"
                        title={p.is_active ? 'Deactivate' : 'Activate'}>
                        <Icon name={p.is_active ? 'EyeSlashIcon' : 'EyeIcon'} size={15}
                          style={{ color: p.is_active ? '#f87171' : '#34d399' }} />
                      </button>
                      <button onClick={() => deleteProduct(p.id)}
                        disabled={actionLoading === p.id}
                        className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                        title="Delete">
                        <Icon name="TrashIcon" size={15} style={{ color: '#f87171' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-xs" style={{ color: '#57534e' }}>Page {page + 1}</span>
          <div className="flex gap-2">
            <button onClick={() => { const p = Math.max(0, page - 1); setPage(p); loadProducts(p, search, filter); }}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#a8a29e' }}>
              Prev
            </button>
            <button onClick={() => { const p = page + 1; setPage(p); loadProducts(p, search, filter); }}
              disabled={products.length < PAGE_SIZE}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#a8a29e' }}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
          style={{
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
            backdropFilter: 'blur(20px)',
          }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <p className="text-sm font-medium text-white">{toast.msg}</p>
        </div>
      )}
    </div>
  );
}
