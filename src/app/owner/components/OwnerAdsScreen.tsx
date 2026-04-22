'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface AdCampaign {
  id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  spent: number | null;
  impressions: number;
  clicks: number;
  created_at: string;
  user_id: string | null;
  user_profiles?: { username: string | null; full_name: string | null } | null;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'today';
  if (days === 1) return 'yesterday';
  return `${days}d ago`;
}

export default function OwnerAdsScreen() {
  const supabase = createClient();
  const [ads, setAds] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, totalBudget: 0, totalImpressions: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'ended'>('all');

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAds = useCallback(async (f = filter) => {
    setLoading(true);
    try {
      // Use posts table as proxy for ads (posts with type = 'ad' or use error_logs for ad events)
      // For now, show a management view with site-wide ad settings
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*, user_profiles!posts_user_id_fkey(username, full_name)')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      // Map posts to ad-like structure for display
      const mapped: AdCampaign[] = (posts || []).map(p => ({
        id: p.id,
        title: p.content?.substring(0, 60) || 'Ad Post',
        description: p.content,
        status: p.is_published ? 'active' : 'paused',
        budget: null,
        spent: null,
        impressions: p.views_count || 0,
        clicks: p.likes_count || 0,
        created_at: p.created_at,
        user_id: p.user_id,
        user_profiles: p.user_profiles,
      }));

      const filtered = f === 'all' ? mapped : mapped.filter(a => a.status === f);
      setAds(filtered);
      setStats({
        total: mapped.length,
        active: mapped.filter(a => a.status === 'active').length,
        totalBudget: 0,
        totalImpressions: mapped.reduce((s, a) => s + a.impressions, 0),
      });
    } catch {
      showToast('Failed to load ads', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadAds(filter);
  }, [filter]);

  const toggleAd = async (id: string, currentStatus: string) => {
    setActionLoading(id);
    try {
      const newPublished = currentStatus !== 'active';
      const { error } = await supabase.from('posts').update({ is_published: newPublished }).eq('id', id);
      if (error) throw error;
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: newPublished ? 'active' : 'paused' } : a));
      showToast(`Ad ${newPublished ? 'activated' : 'paused'}`, 'success');
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Delete this ad post?')) return;
    setActionLoading(id);
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id);
      if (error) throw error;
      setAds(prev => prev.filter(a => a.id !== id));
      showToast('Ad deleted', 'success');
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'active') return { bg: 'rgba(52,211,153,0.1)', text: '#34d399' };
    if (s === 'paused') return { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24' };
    return { bg: 'rgba(255,255,255,0.05)', text: '#78716c' };
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ads Manager</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage ad campaigns and promotions</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(232,121,249,0.1)', color: '#e879f9', border: '1px solid rgba(232,121,249,0.2)' }}>
          <Icon name="MegaphoneIcon" size={14} style={{ color: '#e879f9' }} />
          Ads Control
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Ads', value: stats.total, icon: 'MegaphoneIcon', color: '#e879f9' },
          { label: 'Active', value: stats.active, icon: 'PlayCircleIcon', color: '#34d399' },
          { label: 'Total Impressions', value: stats.totalImpressions.toLocaleString(), icon: 'EyeIcon', color: '#60a5fa' },
          { label: 'Ad Revenue', value: '$0', icon: 'BanknotesIcon', color: '#fbbf24' },
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

      {/* AdSense Config Panel */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(232,121,249,0.05)', border: '1px solid rgba(232,121,249,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <Icon name="CurrencyDollarIcon" size={18} style={{ color: '#e879f9' }} />
          <h3 className="text-sm font-semibold text-white">Google AdSense Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#78716c' }}>AdSense Publisher ID</label>
            <div className="px-3 py-2.5 rounded-xl text-sm font-mono" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#a8a29e' }}>
              {process.env.NEXT_PUBLIC_ADSENSE_ID || 'Not configured'}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#78716c' }}>Ad Status</label>
            <div className="px-3 py-2.5 rounded-xl text-sm flex items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: process.env.NEXT_PUBLIC_ADSENSE_ID ? '#34d399' : '#f87171' }} />
              <span style={{ color: '#a8a29e' }}>{process.env.NEXT_PUBLIC_ADSENSE_ID ? 'Configured' : 'Not configured'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'paused'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(232,121,249,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#e879f9' : '#78716c',
              border: `1px solid ${filter === f ? 'rgba(232,121,249,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>{f}</button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Ad Content', 'Creator', 'Impressions', 'Clicks', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#57534e' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading...</td></tr>
              ) : ads.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>No ads found</td></tr>
              ) : ads.map(a => {
                const sc = statusColor(a.status);
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(232,121,249,0.1)' }}>
                          <Icon name="MegaphoneIcon" size={16} style={{ color: '#e879f9' }} />
                        </div>
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">{a.title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>
                      {a.user_profiles?.username || a.user_profiles?.full_name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#60a5fa' }}>{a.impressions.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: '#34d399' }}>{a.clicks.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium capitalize"
                        style={{ background: sc.bg, color: sc.text }}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#57534e' }}>{timeAgo(a.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleAd(a.id, a.status)} disabled={actionLoading === a.id}
                          className="p-1.5 rounded-lg transition-all hover:bg-white/5">
                          <Icon name={a.status === 'active' ? 'PauseCircleIcon' : 'PlayCircleIcon'} size={15}
                            style={{ color: a.status === 'active' ? '#fbbf24' : '#34d399' }} />
                        </button>
                        <button onClick={() => deleteAd(a.id)} disabled={actionLoading === a.id}
                          className="p-1.5 rounded-lg transition-all hover:bg-red-500/10">
                          <Icon name="TrashIcon" size={15} style={{ color: '#f87171' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
