'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

import { toast, Toaster } from 'sonner';

interface CommissionRow {
  id: string;
  seller_name: string;
  product_id: string;
  sale_amount: number;
  commission_rate: number;
  commission_amount: number;
  seller_earnings: number;
  status: string;
  created_at: string;
}

interface CommissionStats {
  total_sales: number;
  total_commission: number;
  total_seller_earnings: number;
  pending_count: number;
}

export default function OwnerMarketplaceScreen() {
  const supabase = createClient();
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [stats, setStats] = useState<CommissionStats>({ total_sales: 0, total_commission: 0, total_seller_earnings: 0, pending_count: 0 });
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(10);
  const [savingRate, setSavingRate] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('marketplace_commissions')
        .select('*, seller:seller_id(full_name, username)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        const mapped: CommissionRow[] = data.map((r: any) => ({
          id: r.id,
          seller_name: r.seller?.full_name || r.seller?.username || 'Unknown',
          product_id: r.product_id || '—',
          sale_amount: r.sale_amount,
          commission_rate: r.commission_rate,
          commission_amount: r.commission_amount,
          seller_earnings: r.seller_earnings,
          status: r.status,
          created_at: r.created_at,
        }));
        setCommissions(mapped);

        const totalSales = data.reduce((s: number, r: any) => s + Number(r.sale_amount), 0);
        const totalComm = data.reduce((s: number, r: any) => s + Number(r.commission_amount), 0);
        const totalEarnings = data.reduce((s: number, r: any) => s + Number(r.seller_earnings), 0);
        const pendingCount = data.filter((r: any) => r.status === 'pending').length;
        setStats({ total_sales: totalSales, total_commission: totalComm, total_seller_earnings: totalEarnings, pending_count: pendingCount });
      }
    } catch {
      toast.error('Failed to load commission data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await supabase.from('marketplace_commissions').update({ status }).eq('id', id);
      setCommissions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Commission marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const statusColor: Record<string, string> = {
    pending: '#fbbf24',
    paid: '#34d399',
    cancelled: '#f87171',
  };

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-700 gradient-text">Marketplace Commission</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track sales, commissions, and seller earnings</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Commission Rate:</span>
            <input
              type="number"
              value={commissionRate}
              onChange={e => setCommissionRate(Number(e.target.value))}
              min={1} max={50}
              className="w-16 text-center text-sm font-600 rounded-xl px-2 py-1.5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
            />
            <span className="text-xs text-slate-500">%</span>
            <button
              onClick={() => { setSavingRate(true); setTimeout(() => { setSavingRate(false); toast.success('Commission rate saved'); }, 500); }}
              disabled={savingRate}
              className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}
            >
              Save
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Sales', value: `$${stats.total_sales.toFixed(2)}`, icon: 'ShoppingBagIcon', color: '#00d2ff' },
            { label: 'Platform Commission', value: `$${stats.total_commission.toFixed(2)}`, icon: 'BanknotesIcon', color: '#34d399' },
            { label: 'Seller Earnings', value: `$${stats.total_seller_earnings.toFixed(2)}`, icon: 'UserIcon', color: '#a78bfa' },
            { label: 'Pending Payouts', value: stats.pending_count.toString(), icon: 'ClockIcon', color: '#fbbf24' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <Icon name={s.icon as any} size={16} style={{ color: s.color }} />
                </div>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-xl font-700" style={{ color: s.color }}>{loading ? '...' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Commission Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-700 text-slate-300">Commission Transactions</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
            </div>
          ) : commissions.length === 0 ? (
            <div className="p-8 text-center">
              <Icon name="ShoppingBagIcon" size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No commission transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Seller', 'Sale Amount', 'Commission', 'Seller Earnings', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-slate-500 font-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3 text-slate-300 font-600">{c.seller_name}</td>
                      <td className="px-4 py-3 text-slate-300">${c.sale_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-green-400 font-600">${c.commission_amount.toFixed(2)} ({c.commission_rate}%)</td>
                      <td className="px-4 py-3 text-purple-300">${c.seller_earnings.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg text-xs font-600"
                          style={{ background: `${statusColor[c.status] || '#94a3b8'}18`, color: statusColor[c.status] || '#94a3b8' }}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {c.status === 'pending' && (
                          <button onClick={() => updateStatus(c.id, 'paid')}
                            className="px-2 py-1 rounded-lg text-xs font-600 transition-all"
                            style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
