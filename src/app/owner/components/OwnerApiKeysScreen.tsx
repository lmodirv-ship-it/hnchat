'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ApiKey {
  id: string;
  name: string;
  envKey: string;
  description: string;
  category: 'ai' | 'payment' | 'ads' | 'notifications' | 'other';
  placeholder: string;
  docsUrl?: string;
}

const API_KEYS: ApiKey[] = [
  // AI
  { id: 'openai', name: 'OpenAI', envKey: 'OPENAI_API_KEY', description: 'Powers AI Assistant and HN AI chat features', category: 'ai', placeholder: 'sk-...', docsUrl: 'https://platform.openai.com/api-keys' },
  { id: 'gemini', name: 'Google Gemini', envKey: 'GEMINI_API_KEY', description: 'Google Gemini AI model integration', category: 'ai', placeholder: 'AIza...', docsUrl: 'https://aistudio.google.com/app/apikey' },
  { id: 'anthropic', name: 'Anthropic Claude', envKey: 'ANTHROPIC_API_KEY', description: 'Claude AI model for advanced reasoning', category: 'ai', placeholder: 'sk-ant-...', docsUrl: 'https://console.anthropic.com/settings/keys' },
  { id: 'perplexity', name: 'Perplexity', envKey: 'PERPLEXITY_API_KEY', description: 'Perplexity AI for search-augmented responses', category: 'ai', placeholder: 'pplx-...', docsUrl: 'https://www.perplexity.ai/settings/api' },
  // Payment
  { id: 'stripe_pub', name: 'Stripe Publishable Key', envKey: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', description: 'Stripe public key for frontend payment forms', category: 'payment', placeholder: 'pk_live_...', docsUrl: 'https://dashboard.stripe.com/apikeys' },
  // Ads
  { id: 'adsense', name: 'Google AdSense ID', envKey: 'NEXT_PUBLIC_ADSENSE_ID', description: 'AdSense publisher ID for displaying ads', category: 'ads', placeholder: 'ca-pub-...', docsUrl: 'https://www.google.com/adsense' },
];

const CATEGORY_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  ai: { label: 'AI Services', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', icon: 'CpuChipIcon' },
  payment: { label: 'Payments', color: '#34d399', bg: 'rgba(52,211,153,0.12)', icon: 'CreditCardIcon' },
  ads: { label: 'Advertising', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', icon: 'MegaphoneIcon' },
  notifications: { label: 'Notifications', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: 'BellIcon' },
  other: { label: 'Other', color: '#78716c', bg: 'rgba(120,113,108,0.12)', icon: 'KeyIcon' },
};

export default function OwnerApiKeysScreen() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (key: ApiKey) => {
    const val = values[key.id];
    if (!val?.trim()) {
      showToast('Please enter a value before saving', 'error');
      return;
    }
    setSaving(prev => ({ ...prev, [key.id]: true }));
    try {
      const res = await fetch('/api/owner-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_env_key', key: key.envKey, value: val.trim() }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(prev => ({ ...prev, [key.id]: true }));
      showToast(`${key.name} key saved successfully`, 'success');
      setTimeout(() => setSaved(prev => ({ ...prev, [key.id]: false })), 3000);
    } catch {
      showToast(`Failed to save ${key.name} key`, 'error');
    } finally {
      setSaving(prev => ({ ...prev, [key.id]: false }));
    }
  };

  const categories = ['all', ...Array.from(new Set(API_KEYS.map(k => k.category)))];
  const filtered = activeCategory === 'all' ? API_KEYS : API_KEYS.filter(k => k.category === activeCategory);

  const grouped = filtered.reduce<Record<string, ApiKey[]>>((acc, key) => {
    if (!acc[key.category]) acc[key.category] = [];
    acc[key.category].push(key);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
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

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage third-party service API keys for the platform</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
          <Icon name="ShieldCheckIcon" size={14} />
          Keys are stored securely as environment variables
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(96,165,250,0.06)', border: '1px solid rgba(96,165,250,0.15)' }}>
        <Icon name="InformationCircleIcon" size={18} style={{ color: '#60a5fa', flexShrink: 0, marginTop: 1 }} />
        <div>
          <p className="text-sm font-semibold" style={{ color: '#93c5fd' }}>How it works</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#78716c' }}>
            Enter your API keys below and click Save. Keys are stored as environment variables and take effect after the next deployment. 
            Never share your secret keys publicly.
          </p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => {
          const meta = cat === 'all' ? null : CATEGORY_META[cat];
          const isActive = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all capitalize"
              style={{
                background: isActive ? (meta?.bg ?? 'rgba(251,191,36,0.15)') : 'rgba(255,255,255,0.04)',
                border: `1px solid ${isActive ? (meta?.color ?? '#fbbf24') + '50' : 'rgba(255,255,255,0.07)'}`,
                color: isActive ? (meta?.color ?? '#fbbf24') : '#78716c',
              }}>
              {meta && <Icon name={meta.icon as any} size={12} />}
              {cat === 'all' ? 'All Keys' : meta?.label ?? cat}
            </button>
          );
        })}
      </div>

      {/* Keys grouped by category */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([category, keys]) => {
          const meta = CATEGORY_META[category] ?? CATEGORY_META.other;
          return (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: meta.bg }}>
                  <Icon name={meta.icon as any} size={14} style={{ color: meta.color }} />
                </div>
                <h2 className="text-sm font-bold" style={{ color: meta.color }}>{meta.label}</h2>
                <div className="flex-1 h-px" style={{ background: meta.color + '20' }} />
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: meta.bg, color: meta.color }}>
                  {keys.length} {keys.length === 1 ? 'key' : 'keys'}
                </span>
              </div>

              <div className="space-y-3">
                {keys.map(key => {
                  const isVisible = visible[key.id];
                  const isSaving = saving[key.id];
                  const isSaved = saved[key.id];
                  const val = values[key.id] ?? '';

                  return (
                    <div key={key.id} className="rounded-2xl p-5 space-y-4"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-white">{key.name}</h3>
                            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                              style={{ background: 'rgba(255,255,255,0.05)', color: '#57534e', border: '1px solid rgba(255,255,255,0.06)' }}>
                              {key.envKey}
                            </span>
                          </div>
                          <p className="text-xs mt-1" style={{ color: '#78716c' }}>{key.description}</p>
                        </div>
                        {key.docsUrl && (
                          <a href={key.docsUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 flex-shrink-0"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#78716c' }}>
                            <Icon name="ArrowTopRightOnSquareIcon" size={12} />
                            Get Key
                          </a>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <input
                            type={isVisible ? 'text' : 'password'}
                            value={val}
                            onChange={e => setValues(prev => ({ ...prev, [key.id]: e.target.value }))}
                            placeholder={key.placeholder}
                            className="w-full px-3 py-2.5 pr-10 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                          />
                          <button
                            type="button"
                            onClick={() => setVisible(prev => ({ ...prev, [key.id]: !isVisible }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80">
                            <Icon name={isVisible ? 'EyeSlashIcon' : 'EyeIcon'} size={15} style={{ color: '#57534e' }} />
                          </button>
                        </div>
                        <button
                          onClick={() => handleSave(key)}
                          disabled={isSaving || !val.trim()}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
                          style={{
                            background: isSaved
                              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                              : 'linear-gradient(135deg, #f59e0b, #d97706)',
                            boxShadow: isSaved ? '0 0 16px rgba(34,197,94,0.2)' : '0 0 16px rgba(251,191,36,0.2)',
                            minWidth: 90,
                          }}>
                          {isSaving ? (
                            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          ) : isSaved ? (
                            <Icon name="CheckIcon" size={15} />
                          ) : (
                            <Icon name="CloudArrowUpIcon" size={15} />
                          )}
                          {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="flex items-start gap-3 p-4 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Icon name="ExclamationTriangleIcon" size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }} />
        <p className="text-xs leading-relaxed" style={{ color: '#57534e' }}>
          <span className="text-amber-400 font-semibold">Important:</span> After saving keys, redeploy the application for changes to take effect. 
          Keep your secret keys confidential and rotate them regularly for security.
        </p>
      </div>
    </div>
  );
}
