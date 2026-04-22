'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

export default function OwnerCryptoScreen() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, cryptoMentions: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [usersRes, postsRes] = await Promise.all([
          supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('posts').select('id, content, created_at, user_profiles!posts_user_id_fkey(username)')
            .ilike('content', '%crypto%')
            .order('created_at', { ascending: false })
            .limit(10),
        ]);
        setStats({
          totalUsers: usersRes.count ?? 0,
          totalPosts: postsRes.data?.length ?? 0,
          cryptoMentions: postsRes.data?.length ?? 0,
        });
        setRecentActivity(postsRes.data || []);
      } catch {
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cryptoAssets = [
    { symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: '#f59e0b' },
    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: '#60a5fa' },
    { symbol: 'BNB', name: 'BNB', icon: '◈', color: '#fbbf24' },
    { symbol: 'SOL', name: 'Solana', icon: '◎', color: '#a78bfa' },
    { symbol: 'USDT', name: 'Tether', icon: '₮', color: '#34d399' },
    { symbol: 'XRP', name: 'Ripple', icon: '✕', color: '#60a5fa' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Crypto Trading</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Monitor crypto activity and user engagement</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
          <span>₿</span>
          Crypto Monitor
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Platform Users', value: stats.totalUsers, icon: 'UsersIcon', color: '#a78bfa' },
          { label: 'Crypto Posts', value: stats.cryptoMentions, icon: 'DocumentTextIcon', color: '#fbbf24' },
          { label: 'Active Traders', value: Math.floor(stats.totalUsers * 0.15), icon: 'ArrowTrendingUpIcon', color: '#34d399' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon as any} size={16} style={{ color: s.color }} />
              <span className="text-xs" style={{ color: '#78716c' }}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Tracked Assets */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="text-sm font-semibold text-white mb-4">Tracked Assets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cryptoAssets.map(a => (
            <div key={a.symbol} className="rounded-xl p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-2xl font-bold mb-1" style={{ color: a.color }}>{a.icon}</div>
              <p className="text-sm font-bold text-white">{a.symbol}</p>
              <p className="text-xs" style={{ color: '#57534e' }}>{a.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Config */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <Icon name="Cog6ToothIcon" size={18} style={{ color: '#fbbf24' }} />
          <h3 className="text-sm font-semibold text-white">Feature Settings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Enable Crypto Trading Feature', enabled: true },
            { label: 'Show Price Charts', enabled: true },
            { label: 'Allow User Portfolios', enabled: true },
            { label: 'Enable Trading Alerts', enabled: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-sm" style={{ color: '#a8a29e' }}>{item.label}</span>
              <div className="relative w-10 h-5 rounded-full"
                style={{ background: item.enabled ? '#fbbf24' : 'rgba(255,255,255,0.1)' }}>
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: item.enabled ? '22px' : '2px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Crypto Posts */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white">Recent Crypto Mentions</h3>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: '#57534e' }}>Loading...</div>
        ) : recentActivity.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: '#57534e' }}>No crypto mentions found</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {recentActivity.map(a => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(251,191,36,0.1)' }}>
                  <span className="text-sm">₿</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{a.content?.substring(0, 80)}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#57534e' }}>
                    @{a.user_profiles?.username || 'unknown'} · {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
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
