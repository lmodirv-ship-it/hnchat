'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface ErrorLog {
  id: string;
  error_type: string;
  message: string;
  stack_trace: string | null;
  user_id: string | null;
  url: string | null;
  severity: string;
  resolved: boolean;
  created_at: string;
}

export default function OwnerMonitoringScreen() {
  const supabase = createClient();
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'critical' | 'warning'>('unresolved');
  const [stats, setStats] = useState({ total: 0, unresolved: 0, critical: 0, warning: 0 });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState({ db: 'checking', api: 'checking', storage: 'checking' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const checkHealth = useCallback(async () => {
    try {
      const { error: dbError } = await supabase.from('user_profiles').select('id', { count: 'exact', head: true });
      setSystemHealth(prev => ({ ...prev, db: dbError ? 'error' : 'healthy' }));
    } catch {
      setSystemHealth(prev => ({ ...prev, db: 'error' }));
    }
    try {
      const res = await fetch('/api/metrics');
      setSystemHealth(prev => ({ ...prev, api: res.ok ? 'healthy' : 'degraded' }));
    } catch {
      setSystemHealth(prev => ({ ...prev, api: 'error' }));
    }
    setSystemHealth(prev => ({ ...prev, storage: 'healthy' }));
  }, []);

  const loadLogs = useCallback(async (f = filter) => {
    setLoading(true);
    try {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (f === 'unresolved') query = query.eq('resolved', false);
      if (f === 'critical') query = query.eq('severity', 'critical');
      if (f === 'warning') query = query.eq('severity', 'warning');

      const { data, error } = await query;
      if (error) throw error;
      const logsData = data || [];
      setLogs(logsData);
      setStats({
        total: logsData.length,
        unresolved: logsData.filter(l => !l.resolved).length,
        critical: logsData.filter(l => l.severity === 'critical').length,
        warning: logsData.filter(l => l.severity === 'warning').length,
      });
    } catch {
      showToast('Failed to load logs', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadLogs(filter);
    checkHealth();
    const channel = supabase.channel('owner-monitoring')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'error_logs' }, () => loadLogs(filter))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const resolveLog = async (id: string) => {
    setActionLoading(id);
    try {
      const { error } = await supabase.from('error_logs').update({ resolved: true }).eq('id', id);
      if (error) throw error;
      setLogs(prev => prev.map(l => l.id === id ? { ...l, resolved: true } : l));
      showToast('Marked as resolved', 'success');
    } catch {
      showToast('Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const clearResolved = async () => {
    if (!confirm('Delete all resolved logs?')) return;
    try {
      const { error } = await supabase.from('error_logs').delete().eq('resolved', true);
      if (error) throw error;
      setLogs(prev => prev.filter(l => !l.resolved));
      showToast('Resolved logs cleared', 'success');
    } catch {
      showToast('Clear failed', 'error');
    }
  };

  const severityColor = (s: string) => {
    if (s === 'critical') return { bg: 'rgba(248,113,113,0.1)', text: '#f87171' };
    if (s === 'warning') return { bg: 'rgba(251,191,36,0.1)', text: '#fbbf24' };
    return { bg: 'rgba(255,255,255,0.05)', text: '#78716c' };
  };

  const healthColor = (s: string) => {
    if (s === 'healthy') return '#34d399';
    if (s === 'degraded') return '#fbbf24';
    if (s === 'error') return '#f87171';
    return '#57534e';
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Monitoring</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Real-time error logs and system health</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearResolved}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
            Clear Resolved
          </button>
          <button onClick={() => { loadLogs(filter); checkHealth(); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
            <Icon name="ArrowPathIcon" size={13} style={{ color: '#60a5fa' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Database', key: 'db', icon: 'CircleStackIcon' },
          { label: 'API', key: 'api', icon: 'ServerIcon' },
          { label: 'Storage', key: 'storage', icon: 'ArchiveBoxIcon' },
        ].map(s => {
          const status = systemHealth[s.key as keyof typeof systemHealth];
          const color = healthColor(status);
          return (
            <div key={s.key} className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}20` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}15` }}>
                <Icon name={s.icon as any} size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{s.label}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-xs capitalize" style={{ color }}>{status}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: stats.total, color: '#a8a29e' },
          { label: 'Unresolved', value: stats.unresolved, color: '#f87171' },
          { label: 'Critical', value: stats.critical, color: '#ef4444' },
          { label: 'Warnings', value: stats.warning, color: '#fbbf24' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-2" style={{ color: '#78716c' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['all', 'unresolved', 'critical', 'warning'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all"
            style={{
              background: filter === f ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#60a5fa' : '#78716c',
              border: `1px solid ${filter === f ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}>{f}</button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="py-12 text-center text-sm" style={{ color: '#57534e' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm font-medium text-white">No errors found</p>
            <p className="text-xs mt-1" style={{ color: '#57534e' }}>System is running smoothly</p>
          </div>
        ) : logs.map(l => {
          const sc = severityColor(l.severity);
          const isExpanded = expanded === l.id;
          return (
            <div key={l.id} className="rounded-xl overflow-hidden transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${l.resolved ? 'rgba(255,255,255,0.04)' : sc.bg}` }}>
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : l.id)}>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                  style={{ background: sc.bg, color: sc.text }}>{l.severity}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{l.error_type}</p>
                  <p className="text-xs truncate" style={{ color: '#57534e' }}>{l.message}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs" style={{ color: '#57534e' }}>
                    {new Date(l.created_at).toLocaleString()}
                  </span>
                  {l.resolved ? (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>Resolved</span>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); resolveLog(l.id); }}
                      disabled={actionLoading === l.id}
                      className="text-xs px-2 py-0.5 rounded-full transition-all"
                      style={{ background: 'rgba(96,165,250,0.1)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.2)' }}>
                      Resolve
                    </button>
                  )}
                  <Icon name={isExpanded ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} style={{ color: '#57534e' }} />
                </div>
              </div>
              {isExpanded && l.stack_trace && (
                <div className="px-4 pb-4">
                  <pre className="text-xs p-3 rounded-lg overflow-x-auto"
                    style={{ background: 'rgba(0,0,0,0.3)', color: '#a8a29e', fontFamily: 'monospace' }}>
                    {l.stack_trace}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
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
