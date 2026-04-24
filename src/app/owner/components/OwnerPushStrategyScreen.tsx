'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface PushRule {
  id: string;
  rule_name: string;
  trigger_event: string;
  is_active: boolean;
  priority: number;
  created_at: string;
}

interface PushLog {
  id: string;
  user_id: string | null;
  notification_type: string;
  sent_at: string;
  opened: boolean;
  clicked: boolean;
}

export default function OwnerPushStrategyScreen() {
  const supabase = createClient();
  const [rules, setRules] = useState<PushRule[]>([]);
  const [logs, setLogs] = useState<PushLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'rules' | 'logs' | 'ab-tests'>('rules');
  const [stats, setStats] = useState({ totalRules: 0, activeRules: 0, totalSent: 0, openRate: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [abTests, setAbTests] = useState<any[]>([]);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, logsRes, abRes] = await Promise.all([
        supabase.from('push_strategy_rules').select('*').order('priority', { ascending: true }),
        supabase.from('push_notification_log').select('*').order('sent_at', { ascending: false }).limit(30),
        supabase.from('push_ab_tests').select('*').order('created_at', { ascending: false }),
      ]);

      const rulesData = rulesRes.data || [];
      const logsData = logsRes.data || [];
      setRules(rulesData);
      setLogs(logsData);
      setAbTests(abRes.data || []);
      setStats({
        totalRules: rulesData.length,
        activeRules: rulesData.filter(r => r.is_active).length,
        totalSent: logsData.length,
        openRate: logsData.length > 0 ? Math.round((logsData.filter(l => l.opened).length / logsData.length) * 100) : 0,
      });
    } catch {
      showToast('Failed to load push data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const toggleRule = async (id: string, current: boolean) => {
    setActionLoading(id);
    try {
      const { error } = await supabase.from('push_strategy_rules').update({ is_active: !current }).eq('id', id);
      if (error) throw error;
      setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: !current } : r));
      showToast(`Rule ${!current ? 'enabled' : 'disabled'}`, 'success');
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Push Strategy</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage notification rules and campaigns</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.2)' }}>
          <Icon name="BellIcon" size={14} style={{ color: '#fbbf24' }} />
          Push Control
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Rules', value: stats.totalRules, icon: 'AdjustmentsHorizontalIcon', color: '#fbbf24' },
          { label: 'Active Rules', value: stats.activeRules, icon: 'CheckCircleIcon', color: '#34d399' },
          { label: 'Notifications Sent', value: stats.totalSent, icon: 'BellIcon', color: '#60a5fa' },
          { label: 'Open Rate', value: `${stats.openRate}%`, icon: 'CursorArrowRaysIcon', color: '#c084fc' },
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

      <div className="flex gap-2">
        {(['rules', 'logs', 'ab-tests'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: tab === t ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
              color: tab === t ? '#fbbf24' : '#78716c',
              border: `1px solid ${tab === t ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>{t.replace('-', ' ')}</button>
        ))}
      </div>

      {tab === 'rules' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Rule Name', 'Trigger', 'Priority', 'Status', 'Toggle'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#57534e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading...</td></tr>
                ) : rules.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>No rules configured</td></tr>
                ) : rules.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-white">{r.rule_name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: '#a8a29e' }}>{r.trigger_event}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-bold"
                        style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>P{r.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{
                          background: r.is_active ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
                          color: r.is_active ? '#34d399' : '#f87171',
                        }}>
                        {r.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleRule(r.id, r.is_active)} disabled={actionLoading === r.id}
                        className="relative w-10 h-5 rounded-full transition-all"
                        style={{ background: r.is_active ? '#34d399' : 'rgba(255,255,255,0.1)' }}>
                        <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white shadow"
                          style={{ left: r.is_active ? '22px' : '2px' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Type', 'Sent At', 'Opened', 'Clicked'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#57534e' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-sm" style={{ color: '#57534e' }}>No logs yet</td></tr>
                ) : logs.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-sm text-white">{l.notification_type}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#a8a29e' }}>{new Date(l.sent_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span style={{ color: l.opened ? '#34d399' : '#57534e' }}>{l.opened ? '✓' : '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span style={{ color: l.clicked ? '#60a5fa' : '#57534e' }}>{l.clicked ? '✓' : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'ab-tests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {abTests.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-sm" style={{ color: '#57534e' }}>No A/B tests configured</div>
          ) : abTests.map(t => (
            <div key={t.id} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{t.test_name || 'A/B Test'}</h3>
                <span className="text-xs px-2 py-1 rounded-full"
                  style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>
                  {t.status || 'running'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-xs font-medium" style={{ color: '#78716c' }}>Variant A</p>
                  <p className="text-lg font-bold text-white mt-1">{t.variant_a_sends || 0}</p>
                  <p className="text-xs" style={{ color: '#57534e' }}>sends</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-xs font-medium" style={{ color: '#78716c' }}>Variant B</p>
                  <p className="text-lg font-bold text-white mt-1">{t.variant_b_sends || 0}</p>
                  <p className="text-xs" style={{ color: '#57534e' }}>sends</p>
                </div>
              </div>
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
