'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface Plan {
  id: string;
  name: string;
  price_mad: number;
  price_usd: number;
  duration_days: number;
  features: string[] | null;
  is_active: boolean;
  created_at: string;
}

interface Subscription {
  id: string;
  status: string;
  plan_name: string;
  amount_mad: number;
  amount_usd: number;
  payment_method: string;
  created_at: string;
  expires_at: string | null;
  user_profiles?: { username: string | null; full_name: string | null; email: string | null } | null;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function OwnerSubscriptionsScreen() {
  const supabase = createClient();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'subscriptions' | 'plans'>('subscriptions');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'cancelled'>('all');
  const [stats, setStats] = useState({ total: 0, active: 0, revenue_mad: 0, revenue_usd: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes] = await Promise.all([
        supabase.from('subscription_plans').select('*').order('price_mad', { ascending: true }),
        supabase.from('subscriptions')
          .select('*, user_profiles!subscriptions_user_id_fkey(username, full_name, email)')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      setPlans(plansRes.data || []);
      const subs = subsRes.data || [];
      const filtered = filter === 'all' ? subs : subs.filter(s => s.status === filter);
      setSubscriptions(filtered);
      setStats({
        total: subs.length,
        active: subs.filter(s => s.status === 'active').length,
        revenue_mad: subs.filter(s => s.status === 'active').reduce((t, s) => t + (s.amount_mad || 0), 0),
        revenue_usd: subs.filter(s => s.status === 'active').reduce((t, s) => t + (s.amount_usd || 0), 0),
      });
    } catch {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
    const channel = supabase.channel('owner-subscriptions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, loadData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const cancelSubscription = async (id: string) => {
    if (!confirm('Cancel this subscription?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('subscriptions').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' } : s));
      showToast('Subscription cancelled', 'success');
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const togglePlan = async (id: string, current: boolean) => {
    setActionLoading(id);
    try {
      const { error } = await supabase.from('subscription_plans').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      setPlans(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
      showToast(`Plan ${!current ? 'activated' : 'deactivated'}`, 'success');
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'active') return { bg: 'rgba(52,211,153,0.1)', text: '#34d399' };
    if (s === 'expired') return { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24' };
    if (s === 'cancelled') return { bg: 'rgba(248,113,113,0.1)', text: '#f87171' };
    return { bg: 'rgba(255,255,255,0.05)', text: '#78716c' };
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage plans and subscriber accounts</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Icon name="CreditCardIcon" size={14} style={{ color: '#fbbf24' }} />
          Subscription Manager
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Subscribers', value: stats.total, icon: 'UsersIcon', color: '#a78bfa' },
          { label: 'Active', value: stats.active, icon: 'CheckCircleIcon', color: '#34d399' },
          { label: 'Revenue (MAD)', value: `${stats.revenue_mad.toLocaleString()} MAD`, icon: 'BanknotesIcon', color: '#fbbf24' },
          { label: 'Revenue (USD)', value: `$${stats.revenue_usd.toLocaleString()}`, icon: 'CurrencyDollarIcon', color: '#60a5fa' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon as any} size={16} style={{ color: s.color }} />
              <span className="text-xs" style={{ color: '#78716c' }}>{s.label}</span>
            </div>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['subscriptions', 'plans'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
              color: tab === t ? '#fbbf24' : '#78716c',
              border: `1px solid ${tab === t ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>{t}</button>
        ))}
      </div>

      {tab === 'subscriptions' && (
        <>
          <div className="flex gap-2">
            {(['all', 'active', 'expired', 'cancelled'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                style={{
                  background: filter === f ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                  color: filter === f ? '#fbbf24' : '#78716c',
                  border: `1px solid ${filter === f ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}>{f}</button>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['User', 'Plan', 'Amount', 'Method', 'Status', 'Expires', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#57534e' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading...</td></tr>
                  ) : subscriptions.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>No subscriptions found</td></tr>
                  ) : subscriptions.map(s => {
                    const sc = statusColor(s.status);
                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-sm font-medium text-white">{s.user_profiles?.username || s.user_profiles?.full_name || '—'}</p>
                            <p className="text-xs" style={{ color: '#57534e' }}>{s.user_profiles?.email || ''}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>{s.plan_name}</td>
                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: '#fbbf24' }}>
                          {s.amount_mad ? `${s.amount_mad} MAD` : `$${s.amount_usd}`}
                        </td>
                        <td className="px-4 py-3 text-xs capitalize" style={{ color: '#a8a29e' }}>{s.payment_method}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                            style={{ background: sc.bg, color: sc.text }}>{s.status}</span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: '#57534e' }}>
                          {s.expires_at ? new Date(s.expires_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3">
                          {s.status === 'active' && (
                            <button onClick={() => cancelSubscription(s.id)} disabled={actionLoading === s.id}
                              className="px-2 py-1 rounded-lg text-xs font-medium transition-all"
                              style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map(p => (
            <div key={p.id} className="rounded-2xl p-5 space-y-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${p.is_active ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{p.name}</h3>
                  <p className="text-xs mt-1" style={{ color: '#78716c' }}>{p.duration_days} days</p>
                </div>
                <button onClick={() => togglePlan(p.id, p.is_active)} disabled={actionLoading === p.id}
                  className="relative w-10 h-5 rounded-full transition-all"
                  style={{ background: p.is_active ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}>
                  <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white shadow"
                    style={{ left: p.is_active ? '22px' : '2px' }} />
                </button>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold" style={{ color: '#fbbf24' }}>{p.price_mad} MAD</span>
                <span className="text-sm mb-0.5" style={{ color: '#57534e' }}>${p.price_usd}</span>
              </div>
              {p.features && p.features.length > 0 && (
                <ul className="space-y-1.5">
                  {p.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs" style={{ color: '#a8a29e' }}>
                      <span style={{ color: '#34d399' }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              )}
              <span className="text-xs px-2 py-1 rounded-full font-medium inline-block"
                style={{
                  background: p.is_active ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                  color: p.is_active ? '#34d399' : '#f87171',
                }}>
                {p.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}

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
