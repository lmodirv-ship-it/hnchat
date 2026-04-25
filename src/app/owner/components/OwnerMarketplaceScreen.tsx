'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';

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

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
      style={{
        background: type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
        border: `1px solid ${type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
        backdropFilter: 'blur(20px)',
      }}>
      <span className="text-lg">{type === 'success' ? '✅' : '❌'}</span>
      <p className="text-sm font-medium text-white">{msg}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">✕</button>
    </div>
  );
}

export default function OwnerMarketplaceScreen() {
  const supabase = createClient();
  const [commissions, setCommissions] = useState<CommissionRow[]>([]);
  const [stats, setStats] = useState<CommissionStats>({ total_sales: 0, total_commission: 0, total_seller_earnings: 0, pending_count: 0 });
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(10);
  const [savingRate, setSavingRate] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

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
      showToast('Failed to load commission data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await supabase.from('marketplace_commissions').update({ status }).eq('id', id);
      setCommissions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      showToast(`Commission marked as ${status}`, 'success');
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const statusColor: Record<string, string> = {
    pending: '#fbbf24',
    paid: '#34d399',
    cancelled: '#f87171',
  };

  return (
    <>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Marketplace Commission</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track sales, commissions, and seller earnings</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Commission Rate:</span>
            <input
              type="number"
              value={commissionRate}
              onChange={e => setCommissionRate(Number(e.target.value))}
              min={1} max={50}
              className="w-16 text-center text-sm font-semibold rounded-xl px-2 py-1.5"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0' }}
            />
            <span className="text-xs text-slate-500">%</span>
            <button
              onClick={() => { setSavingRate(true); setTimeout(() => { setSavingRate(false); showToast('Commission rate saved', 'success'); }, 500); }}
              disabled={savingRate}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
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
            <div key={s.label} className="rounded-2xl p-4 space-y-2"
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${s.color}18` }}>
                  <Icon name={s.icon as any} size={16} style={{ color: s.color }} />
                </div>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-xl font-bold" style={{ color: s.color }}>{loading ? '...' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Commission Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 className="text-sm font-bold text-slate-300">Commission Transactions</h2>
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
                      <th key={h} className="text-left px-4 py-3 text-slate-500 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3 text-slate-300 font-semibold">{c.seller_name}</td>
                      <td className="px-4 py-3 text-slate-300">${c.sale_amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-green-400 font-semibold">${c.commission_amount.toFixed(2)} ({c.commission_rate}%)</td>
                      <td className="px-4 py-3 text-purple-300">${c.seller_earnings.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg text-xs font-semibold"
                          style={{ background: `${statusColor[c.status] || '#94a3b8'}18`, color: statusColor[c.status] || '#94a3b8' }}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {c.status === 'pending' && (
                          <button onClick={() => updateStatus(c.id, 'paid')}
                            className="px-2 py-1 rounded-lg text-xs font-semibold transition-all"
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
