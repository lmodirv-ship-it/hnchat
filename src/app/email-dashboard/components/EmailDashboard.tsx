'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,  } from 'recharts';

interface AggregatedStats {
  requests: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  hardBounces: number;
  softBounces: number;
  spamReports: number;
  unsubscribed: number;
  blocked: number;
  range: string;
}

interface DailyReport {
  date: string;
  requests: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
}

interface ByTypeStats {
  welcome: AggregatedStats | null;
  reengagement: AggregatedStats | null;
  weeklyDigest: AggregatedStats | null;
  trendingAlert: AggregatedStats | null;
}

interface EmailStatsData {
  aggregated: AggregatedStats | null;
  daily: DailyReport[];
  byType: ByTypeStats;
}

interface TestEmailState {
  email: string;
  name: string;
  type: 'welcome' | 'reengagement' | 'weekly-digest';
  sending: boolean;
  result: 'idle' | 'success' | 'error';
}

function StatCard({
  label,
  value,
  sub,
  color,
  target,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  target?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <p className="text-xs font-600 text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-800 tabular-nums" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      {target && <p className="text-xs mt-1" style={{ color: 'rgba(100,210,100,0.8)' }}>🎯 Target: {target}</p>}
    </div>
  );
}

function TypeRow({
  label,
  stats,
  icon,
}: {
  label: string;
  stats: AggregatedStats | null;
  icon: string;
}) {
  if (!stats) {
    return (
      <div
        className="flex items-center justify-between p-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-600 text-slate-400">{label}</span>
        </div>
        <span className="text-xs text-slate-600">No data yet</span>
      </div>
    );
  }

  const deliveryRate = stats.requests > 0 ? ((stats.delivered / stats.requests) * 100).toFixed(1) : '0';
  const openRate = stats.delivered > 0 ? ((stats.uniqueOpens / stats.delivered) * 100).toFixed(1) : '0';
  const clickRate = stats.delivered > 0 ? ((stats.uniqueClicks / stats.delivered) * 100).toFixed(1) : '0';

  const openNum = parseFloat(openRate);
  const clickNum = parseFloat(clickRate);
  const openColor = openNum >= 30 ? '#22c55e' : openNum >= 15 ? '#f59e0b' : '#ef4444';
  const clickColor = clickNum >= 5 ? '#22c55e' : clickNum >= 2 ? '#f59e0b' : '#ef4444';

  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="text-sm font-700 text-slate-200">{label}</span>
        </div>
        <span className="text-xs text-slate-500">{stats.requests} sent</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-lg font-700 text-cyan-400">{deliveryRate}%</p>
          <p className="text-xs text-slate-500">Delivery</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-700" style={{ color: openColor }}>{openRate}%</p>
          <p className="text-xs text-slate-500">Open Rate</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-700" style={{ color: clickColor }}>{clickRate}%</p>
          <p className="text-xs text-slate-500">Click Rate</p>
        </div>
      </div>
    </div>
  );
}

export default function EmailDashboard() {
  const [data, setData] = useState<EmailStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [testEmail, setTestEmail] = useState<TestEmailState>({
    email: '',
    name: '',
    type: 'welcome',
    sending: false,
    result: 'idle',
  });

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email/stats?days=${days}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSendTest = async () => {
    if (!testEmail.email) return;
    setTestEmail((p) => ({ ...p, sending: true, result: 'idle' }));
    try {
      const res = await fetch(`/api/email/${testEmail.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail.email, name: testEmail.name || 'Test User' }),
      });
      const json = await res.json();
      setTestEmail((p) => ({ ...p, sending: false, result: json.success ? 'success' : 'error' }));
    } catch {
      setTestEmail((p) => ({ ...p, sending: false, result: 'error' }));
    }
  };

  const agg = data?.aggregated;
  const deliveryRate = agg && agg.requests > 0 ? ((agg.delivered / agg.requests) * 100).toFixed(1) : '—';
  const openRate = agg && agg.delivered > 0 ? ((agg.uniqueOpens / agg.delivered) * 100).toFixed(1) : '—';
  const clickRate = agg && agg.delivered > 0 ? ((agg.uniqueClicks / agg.delivered) * 100).toFixed(1) : '—';
  const bounceRate = agg && agg.requests > 0 ? (((agg.hardBounces + agg.softBounces) / agg.requests) * 100).toFixed(1) : '—';

  const chartData = (data?.daily || []).map((r) => ({
    date: r.date.slice(5),
    Delivered: r.delivered,
    Opens: r.uniqueOpens,
    Clicks: r.uniqueClicks,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-800 text-white">📧 Email Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Brevo transactional email metrics & delivery tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="text-sm rounded-xl px-3 py-2 text-slate-300 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="text-sm font-600 px-4 py-2 rounded-xl transition-opacity"
            style={{ background: 'rgba(0,210,255,0.15)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.25)' }}
          >
            {loading ? '⟳' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Delivery Rate" value={deliveryRate === '—' ? '—' : `${deliveryRate}%`} sub={agg ? `${agg.delivered}/${agg.requests} emails` : undefined} color="#00d2ff" target="95%+" />
        <StatCard label="Open Rate" value={openRate === '—' ? '—' : `${openRate}%`} sub={agg ? `${agg.uniqueOpens} unique opens` : undefined} color="#9b59ff" target=">30%" />
        <StatCard label="Click Rate" value={clickRate === '—' ? '—' : `${clickRate}%`} sub={agg ? `${agg.uniqueClicks} unique clicks` : undefined} color="#22c55e" target=">5%" />
        <StatCard label="Bounce Rate" value={bounceRate === '—' ? '—' : `${bounceRate}%`} sub={agg ? `${(agg.hardBounces + agg.softBounces)} bounces` : undefined} color="#f59e0b" target="<2%" />
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-base font-700 text-white mb-4">📈 Daily Activity</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d2ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOpens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9b59ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#9b59ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Area type="monotone" dataKey="Delivered" stroke="#00d2ff" fill="url(#colorDelivered)" strokeWidth={2} />
              <Area type="monotone" dataKey="Opens" stroke="#9b59ff" fill="url(#colorOpens)" strokeWidth={2} />
              <Area type="monotone" dataKey="Clicks" stroke="#22c55e" fill="url(#colorClicks)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* By Email Type */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-base font-700 text-white mb-4">📊 Performance by Email Type</h2>
        <div className="space-y-3">
          <TypeRow label="Welcome Email" stats={data?.byType.welcome ?? null} icon="🚀" />
          <TypeRow label="Re-engagement (24h)" stats={data?.byType.reengagement ?? null} icon="🔥" />
          <TypeRow label="Weekly Digest" stats={data?.byType.weeklyDigest ?? null} icon="📊" />
          <TypeRow label="Trending Alert" stats={data?.byType.trendingAlert ?? null} icon="⚡" />
        </div>
      </div>

      {/* Test Email Sender */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-base font-700 text-white mb-1">🧪 Send Test Email</h2>
        <p className="text-xs text-slate-500 mb-4">Test your email templates before going live</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input
            type="email"
            placeholder="recipient@email.com"
            value={testEmail.email}
            onChange={(e) => setTestEmail((p) => ({ ...p, email: e.target.value, result: 'idle' }))}
            className="rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <input
            type="text"
            placeholder="Recipient name (optional)"
            value={testEmail.name}
            onChange={(e) => setTestEmail((p) => ({ ...p, name: e.target.value }))}
            className="rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <select
            value={testEmail.type}
            onChange={(e) => setTestEmail((p) => ({ ...p, type: e.target.value as any, result: 'idle' }))}
            className="rounded-xl px-4 py-2.5 text-sm text-slate-300 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <option value="welcome">🚀 Welcome Email</option>
            <option value="reengagement">🔥 Re-engagement</option>
            <option value="weekly-digest">📊 Weekly Digest</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSendTest}
            disabled={testEmail.sending || !testEmail.email}
            className="px-5 py-2.5 rounded-xl text-sm font-700 transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#00d2ff,#9b59ff)', color: '#050508' }}
          >
            {testEmail.sending ? 'Sending…' : '📤 Send Test'}
          </button>
          {testEmail.result === 'success' && (
            <span className="text-sm font-600 text-green-400">✅ Email sent successfully!</span>
          )}
          {testEmail.result === 'error' && (
            <span className="text-sm font-600 text-red-400">❌ Failed to send. Check API key.</span>
          )}
        </div>
      </div>

      {/* Rules */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-base font-700 text-white mb-4">⚡ Email Automation Rules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '🚀', title: 'Welcome Email', trigger: 'Immediately after signup', status: 'Active', color: '#00d2ff' },
            { icon: '🔥', title: 'Re-engagement', trigger: 'After 24h of inactivity', status: 'Active', color: '#9b59ff' },
            { icon: '📊', title: 'Weekly Digest', trigger: 'Every Monday at 9AM', status: 'Active', color: '#22c55e' },
            { icon: '⚡', title: 'Trending Alert', trigger: 'When video hits 50+ likes', status: 'Active', color: '#f59e0b' },
          ].map((rule) => (
            <div
              key={rule.title}
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-2xl">{rule.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-700 text-slate-200">{rule.title}</p>
                  <span
                    className="text-xs font-600 px-2 py-0.5 rounded-full"
                    style={{ background: `${rule.color}20`, color: rule.color }}
                  >
                    {rule.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{rule.trigger}</p>
              </div>
            </div>
          ))}
        </div>
        <div
          className="mt-4 p-4 rounded-xl"
          style={{ background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.1)' }}
        >
          <p className="text-xs text-cyan-400 font-600">💡 Smart Rules</p>
          <p className="text-xs text-slate-400 mt-1">Max 2–3 emails/week per user · Respects unsubscribe preferences · Linked to Push Strategy algorithm</p>
        </div>
      </div>
    </div>
  );
}
