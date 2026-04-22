'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface AIUsageLog {
  id: string;
  user_id: string | null;
  action: string;
  model: string | null;
  tokens_used: number | null;
  created_at: string;
  user_profiles?: { username: string | null; full_name: string | null } | null;
}

interface AIConfig {
  openai_enabled: boolean;
  gemini_enabled: boolean;
  anthropic_enabled: boolean;
  perplexity_enabled: boolean;
  default_model: string;
  max_tokens_per_request: number;
}

export default function OwnerAIHubScreen() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AIUsageLog[]>([]);
  const [stats, setStats] = useState({ totalRequests: 0, totalTokens: 0, uniqueUsers: 0 });
  const [config, setConfig] = useState<AIConfig>({
    openai_enabled: true,
    gemini_enabled: true,
    anthropic_enabled: true,
    perplexity_enabled: true,
    default_model: 'gpt-4o-mini',
    max_tokens_per_request: 2000,
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load error logs as proxy for AI usage logs
      const { data: errorLogs } = await supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const mapped: AIUsageLog[] = (errorLogs || []).map(l => ({
        id: l.id,
        user_id: l.user_id,
        action: l.error_type || 'ai_request',
        model: l.context?.model || null,
        tokens_used: l.context?.tokens || null,
        created_at: l.created_at,
      }));
      setLogs(mapped);
      setStats({
        totalRequests: mapped.length,
        totalTokens: mapped.reduce((s, l) => s + (l.tokens_used || 0), 0),
        uniqueUsers: new Set(mapped.map(l => l.user_id).filter(Boolean)).size,
      });

      // Load AI config from owner_site_settings
      const { data: settings } = await supabase
        .from('owner_site_settings')
        .select('ai_config')
        .single();
      if (settings?.ai_config) {
        setConfig(prev => ({ ...prev, ...settings.ai_config }));
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('owner_site_settings')
        .update({ ai_config: config })
        .eq('id', (await supabase.from('owner_site_settings').select('id').single()).data?.id);
      if (error) throw error;
      showToast('AI config saved', 'success');
    } catch {
      showToast('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const aiProviders = [
    { key: 'openai_enabled' as keyof AIConfig, label: 'OpenAI', icon: '🤖', model: 'GPT-4o', color: '#34d399', hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { key: 'gemini_enabled' as keyof AIConfig, label: 'Google Gemini', icon: '✨', model: 'Gemini Pro', color: '#60a5fa', hasKey: false },
    { key: 'anthropic_enabled' as keyof AIConfig, label: 'Anthropic Claude', icon: '🧠', model: 'Claude 3', color: '#c084fc', hasKey: false },
    { key: 'perplexity_enabled' as keyof AIConfig, label: 'Perplexity', icon: '🔍', model: 'Sonar', color: '#fbbf24', hasKey: false },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Hub</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage AI providers and usage</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
          <span>🤖</span>
          AI Control Center
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total AI Requests', value: stats.totalRequests, icon: 'CpuChipIcon', color: '#a78bfa' },
          { label: 'Tokens Used', value: stats.totalTokens.toLocaleString(), icon: 'BoltIcon', color: '#fbbf24' },
          { label: 'Active Users', value: stats.uniqueUsers, icon: 'UsersIcon', color: '#34d399' },
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

      {/* AI Providers */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white">AI Providers</h3>
          <button onClick={saveConfig} disabled={saving}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
            {saving ? 'Saving...' : 'Save Config'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiProviders.map(p => (
            <div key={p.key} className="flex items-center justify-between p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <p className="text-sm font-medium text-white">{p.label}</p>
                  <p className="text-xs" style={{ color: '#57534e' }}>{p.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#78716c' }}>
                  {p.hasKey ? '🔑 Key set' : '⚠️ No key'}
                </span>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                  className="relative w-10 h-5 rounded-full transition-all"
                  style={{ background: config[p.key] ? p.color : 'rgba(255,255,255,0.1)' }}>
                  <span className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white shadow"
                    style={{ left: config[p.key] ? '22px' : '2px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Config */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="text-sm font-semibold text-white mb-4">Model Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#78716c' }}>Default Model</label>
            <select
              value={config.default_model}
              onChange={e => setConfig(prev => ({ ...prev, default_model: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gemini-pro">Gemini Pro</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: '#78716c' }}>Max Tokens per Request</label>
            <input
              type="number"
              value={config.max_tokens_per_request}
              onChange={e => setConfig(prev => ({ ...prev, max_tokens_per_request: Number(e.target.value) }))}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
          </div>
        </div>
      </div>

      {/* Recent AI Logs */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white">Recent AI Activity</h3>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: '#57534e' }}>Loading...</div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm" style={{ color: '#57534e' }}>No AI activity logged yet</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {logs.map(l => (
              <div key={l.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(167,139,250,0.1)' }}>
                  <Icon name="CpuChipIcon" size={14} style={{ color: '#a78bfa' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{l.action}</p>
                  <p className="text-xs" style={{ color: '#57534e' }}>
                    {l.model || 'Unknown model'} · {l.tokens_used ? `${l.tokens_used} tokens` : 'N/A'}
                  </p>
                </div>
                <span className="text-xs" style={{ color: '#57534e' }}>
                  {new Date(l.created_at).toLocaleDateString()}
                </span>
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
