'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter: { id: string; username: string; full_name: string } | null;
  reported_user: { id: string; username: string; full_name: string } | null;
  reported_post: { id: string; content: string; post_type: string } | null;
}

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  pending: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  reviewed: { bg: 'rgba(0,210,255,0.12)', color: '#00d2ff', border: 'rgba(0,210,255,0.25)' },
  resolved: { bg: 'rgba(52,211,153,0.12)', color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  dismissed: { bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: 'rgba(100,116,139,0.25)' },
};

export default function AdminReportsPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select(`
          id, reason, description, status, created_at,
          reporter:reporter_id(id, username, full_name),
          reported_user:reported_user_id(id, username, full_name),
          reported_post:reported_post_id(id, content, post_type)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      if (data) setReports(data as Report[]);
    } catch (err) {
      console.error('loadReports error:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadReports(); }, [loadReports]);

  const updateStatus = async (reportId: string, status: 'reviewed' | 'resolved' | 'dismissed') => {
    setActionLoading(reportId + status);
    const { error } = await supabase
      .from('reports')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) {
      showToast('Failed to update report', 'error');
    } else {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
      showToast(`Report marked as ${status}`);
    }
    setActionLoading(null);
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl"
          style={{
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
            color: toast.type === 'success' ? '#34d399' : '#f87171',
            backdropFilter: 'blur(12px)',
          }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{reports.filter(r => r.status === 'pending').length} pending reports</p>
        </div>
        <button onClick={loadReports}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Icon name="ArrowPathIcon" size={15} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
              filter === f ? 'text-white' : 'text-slate-500 hover:text-slate-300'
            }`}
            style={filter === f ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.25)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)' }}>
            <Icon name="FlagIcon" size={24} className="text-cyan-400" />
          </div>
          <p className="text-slate-500 text-sm">No reports found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(report => {
            const sc = statusColors[report.status] || statusColors.pending;
            return (
              <div key={report.id} className="rounded-2xl p-4 lg:p-5 space-y-3 transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Report header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.2)' }}>
                      <Icon name="FlagIcon" size={16} className="text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-slate-200">
                          {report.reason || 'No reason provided'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {new Date(report.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-slate-600 mb-1 uppercase tracking-wider font-semibold" style={{ fontSize: 9 }}>Reporter</p>
                    <p className="text-slate-300 font-medium">
                      {report.reporter ? `@${report.reporter.username}` : 'Anonymous'}
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-slate-600 mb-1 uppercase tracking-wider font-semibold" style={{ fontSize: 9 }}>Reported User</p>
                    <p className="text-slate-300 font-medium">
                      {report.reported_user ? `@${report.reported_user.username}` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-slate-600 mb-1 uppercase tracking-wider font-semibold" style={{ fontSize: 9 }}>Reported Post</p>
                    <p className="text-slate-300 font-medium truncate">
                      {report.reported_post ? report.reported_post.content?.slice(0, 40) + '...' : '—'}
                    </p>
                  </div>
                </div>

                {report.description && (
                  <p className="text-sm text-slate-400 leading-relaxed px-1">{report.description}</p>
                )}

                {/* Actions */}
                {report.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button
                      onClick={() => updateStatus(report.id, 'reviewed')}
                      disabled={actionLoading === report.id + 'reviewed'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40"
                      style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', color: '#00d2ff' }}>
                      {actionLoading === report.id + 'reviewed' ? (
                        <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      ) : <Icon name="EyeIcon" size={13} />}
                      Mark Reviewed
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'resolved')}
                      disabled={actionLoading === report.id + 'resolved'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40"
                      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                      {actionLoading === report.id + 'resolved' ? (
                        <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      ) : <Icon name="CheckCircleIcon" size={13} />}
                      Resolve
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'dismissed')}
                      disabled={actionLoading === report.id + 'dismissed'}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40"
                      style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: '#64748b' }}>
                      {actionLoading === report.id + 'dismissed' ? (
                        <div className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                      ) : <Icon name="XCircleIcon" size={13} />}
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
