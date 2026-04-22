'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface ReportRow {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_id: string | null;
  reported_user_id: string | null;
  reported_post_id: string | null;
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  resolved: { bg: 'rgba(52,211,153,0.15)', color: '#34d399' },
  dismissed: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' },
};

export default function OwnerReportsScreen() {
  const supabase = createClient();
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const ownerFetch = useCallback(async (url: string, opts: RequestInit = {}) => {
    const token = await getToken();
    return fetch(url, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        'x-owner-access': 'granted',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(opts.headers as Record<string, string> || {}),
      },
    });
  }, []);

  const loadReports = useCallback(async (status: string) => {
    setLoading(true);
    try {
      const res = await ownerFetch(`/api/owner-actions?type=reports&status=${status}`);
      const json = await res.json();
      setReports(json.data || []);
    } catch {
      showToast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [ownerFetch]);

  useEffect(() => { loadReports(statusFilter); }, [statusFilter]);

  // Real-time subscription for reports changes
  useEffect(() => {
    const channel = supabase
      .channel('owner-reports-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          loadReports(statusFilter);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, statusFilter, loadReports]);

  const doAction = async (action: string, reportId: string) => {
    setActionLoading(`${action}_${reportId}`);
    try {
      const res = await ownerFetch('/api/owner-actions', {
        method: 'POST',
        body: JSON.stringify({ action, reportId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');
      showToast(json.message || 'Done', 'success');
      await loadReports(statusFilter);
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
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

      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-sm mt-1" style={{ color: '#78716c' }}>Review flagged content and user reports</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['pending', 'resolved', 'dismissed'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: statusFilter === s ? (statusColors[s]?.bg || 'rgba(251,191,36,0.15)') : 'rgba(255,255,255,0.04)',
              border: `1px solid ${statusFilter === s ? (statusColors[s]?.color + '50' || 'rgba(251,191,36,0.3)') : 'rgba(255,255,255,0.07)'}`,
              color: statusFilter === s ? (statusColors[s]?.color || '#fbbf24') : '#78716c',
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Reports list */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-sm font-bold text-white">Reports</h3>
          <span className="text-xs" style={{ color: '#78716c' }}>{reports.length} shown</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <Icon name="CheckCircleIcon" size={22} style={{ color: '#34d399' }} />
            </div>
            <p className="text-sm font-medium text-white">No {statusFilter} reports</p>
            <p className="text-xs" style={{ color: '#57534e' }}>All clear!</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {reports.map(report => (
              <div key={report.id} className="px-5 py-4 hover:bg-white/[0.015] transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                    <Icon name="FlagIcon" size={16} style={{ color: '#f87171' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white capitalize">{report.reason.replace(/_/g, ' ')}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-md capitalize"
                        style={{ background: statusColors[report.status]?.bg || 'rgba(148,163,184,0.15)', color: statusColors[report.status]?.color || '#94a3b8' }}>
                        {report.status}
                      </span>
                      <span className="text-xs" style={{ color: '#57534e' }}>{timeAgo(report.created_at)}</span>
                    </div>
                    {report.description && (
                      <p className="text-sm leading-relaxed mb-2" style={{ color: '#a8a29e' }}>{report.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs" style={{ color: '#57534e' }}>
                      {report.reported_user_id && <span>User: {report.reported_user_id.slice(0, 8)}...</span>}
                      {report.reported_post_id && <span>Post: {report.reported_post_id.slice(0, 8)}...</span>}
                    </div>
                  </div>
                  {statusFilter === 'pending' && (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button disabled={!!actionLoading}
                        onClick={() => doAction('resolve_report', report.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                        Resolve
                      </button>
                      <button disabled={!!actionLoading}
                        onClick={() => doAction('dismiss_report', report.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: 'rgba(148,163,184,0.1)', border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8' }}>
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
