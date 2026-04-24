'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface EmailStats {
  total_sent: number;
  welcome_sent: number;
  digest_sent: number;
  reengagement_sent: number;
  open_rate: number;
}

export default function OwnerEmailScreen() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<EmailStats>({ total_sent: 0, welcome_sent: 0, digest_sent: 0, reengagement_sent: 0, open_rate: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [sendingCampaign, setSendingCampaign] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [tab, setTab] = useState<'overview' | 'campaigns' | 'users'>('overview');

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/email/stats').then(r => r.json()).catch(() => ({})),
        supabase.from('user_profiles').select('id, username, full_name, email, created_at').order('created_at', { ascending: false }).limit(20),
      ]);

      if (statsRes) {
        setStats({
          total_sent: statsRes.total_sent || 0,
          welcome_sent: statsRes.welcome_sent || 0,
          digest_sent: statsRes.digest_sent || 0,
          reengagement_sent: statsRes.reengagement_sent || 0,
          open_rate: statsRes.open_rate || 0,
        });
      }
      setUsers(usersRes.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const sendCampaign = async (type: string, endpoint: string) => {
    setSendingCampaign(type);
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error('Failed');
      showToast(`${type} campaign sent`, 'success');
    } catch {
      showToast('Campaign send failed', 'error');
    } finally {
      setSendingCampaign(null);
    }
  };

  const campaigns = [
    { name: 'Welcome Email', desc: 'Send to new users', icon: '👋', endpoint: '/api/email/welcome', color: '#34d399', type: 'welcome' },
    { name: 'Weekly Digest', desc: 'Top content summary', icon: '📰', endpoint: '/api/email/weekly-digest', color: '#60a5fa', type: 'digest' },
    { name: 'Re-engagement', desc: 'Inactive users', icon: '🔔', endpoint: '/api/email/reengagement', color: '#fbbf24', type: 'reengagement' },
    { name: 'Trending Alert', desc: 'Viral content alert', icon: '🔥', endpoint: '/api/email/trending-alert', color: '#f87171', type: 'trending' },
    { name: 'Notification Digest', desc: 'Missed notifications', icon: '📬', endpoint: '/api/email/notification-digest', color: '#c084fc', type: 'notif-digest' },
    { name: 'Post Interaction', desc: 'Engagement updates', icon: '💬', endpoint: '/api/email/post-interaction', color: '#fb923c', type: 'post-interaction' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage email marketing and transactional emails</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
          <Icon name="EnvelopeIcon" size={14} style={{ color: '#60a5fa' }} />
          Email Manager
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: stats.total_sent, icon: 'PaperAirplaneIcon', color: '#60a5fa' },
          { label: 'Welcome Emails', value: stats.welcome_sent, icon: 'UserPlusIcon', color: '#34d399' },
          { label: 'Digests Sent', value: stats.digest_sent, icon: 'NewspaperIcon', color: '#c084fc' },
          { label: 'Open Rate', value: `${stats.open_rate}%`, icon: 'EnvelopeOpenIcon', color: '#fbbf24' },
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

      {/* Brevo Status */}
      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: 'rgba(96,165,250,0.05)', border: '1px solid rgba(96,165,250,0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.1)' }}>
          <span className="text-xl">📧</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Brevo (Sendinblue) Integration</p>
          <p className="text-xs mt-0.5" style={{ color: '#78716c' }}>Email service provider — API key configured</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#34d399' }}>
          <span className="w-2 h-2 rounded-full bg-green-400" />
          Connected
        </span>
      </div>

      <div className="flex gap-2">
        {(['overview', 'campaigns', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.04)',
              color: tab === t ? '#60a5fa' : '#78716c',
              border: `1px solid ${tab === t ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>{t}</button>
        ))}
      </div>

      {tab === 'campaigns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(c => (
            <div key={c.type} className="rounded-2xl p-5 space-y-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                  <p className="text-xs" style={{ color: '#78716c' }}>{c.desc}</p>
                </div>
              </div>
              <button
                onClick={() => sendCampaign(c.name, c.endpoint)}
                disabled={sendingCampaign === c.type}
                className="w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
                style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}>
                {sendingCampaign === c.type ? 'Sending...' : 'Send Campaign'}
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['User', 'Email', 'Joined'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#57534e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading...</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white">{u.username || u.full_name || '—'}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>{u.email || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#57534e' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold text-white mb-4">Campaign Performance</h3>
            <div className="space-y-3">
              {[
                { label: 'Welcome', value: stats.welcome_sent, color: '#34d399' },
                { label: 'Digest', value: stats.digest_sent, color: '#60a5fa' },
                { label: 'Re-engagement', value: stats.reengagement_sent, color: '#fbbf24' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs w-24" style={{ color: '#78716c' }}>{item.label}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{
                        width: stats.total_sent > 0 ? `${Math.min(100, (item.value / Math.max(stats.total_sent, 1)) * 100)}%` : '0%',
                        background: item.color,
                      }} />
                  </div>
                  <span className="text-xs font-medium w-8 text-right" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {campaigns.slice(0, 4).map(c => (
                <button key={c.type} onClick={() => sendCampaign(c.name, c.endpoint)}
                  disabled={sendingCampaign === c.type}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-white/[0.03] disabled:opacity-50"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span>{c.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{c.name}</p>
                    <p className="text-xs" style={{ color: '#57534e' }}>{c.desc}</p>
                  </div>
                  <Icon name="PaperAirplaneIcon" size={14} style={{ color: c.color }} />
                </button>
              ))}
            </div>
          </div>
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
