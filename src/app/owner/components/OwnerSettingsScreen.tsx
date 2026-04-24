'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface SiteSettings {
  id?: string;
  site_name: string;
  site_description: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  max_post_length: number;
  max_bio_length: number;
  allow_guest_view: boolean;
  require_email_verification: boolean;
  default_user_role: string;
  contact_email: string;
  support_url: string;
  updated_at?: string;
}

const defaultSettings: SiteSettings = {
  site_name: 'hnChat',
  site_description: 'The next-generation social platform',
  maintenance_mode: false,
  registration_enabled: true,
  max_post_length: 2000,
  max_bio_length: 300,
  allow_guest_view: true,
  require_email_verification: false,
  default_user_role: 'user',
  contact_email: 'lmodirv@gmail.com',
  support_url: 'https://hnchat.net',
};

export default function OwnerSettingsScreen() {
  const supabase = createClient();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [activeSection, setActiveSection] = useState<'general' | 'users' | 'content' | 'security'>('general');

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('owner_site_settings')
        .select('*')
        .limit(1)
        .single();
      if (!error && data) {
        setSettings(data as SiteSettings);
      }
    } catch {
      // Use defaults if table doesn't exist yet
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { loadSettings(); }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const payload = { ...settings, updated_at: new Date().toISOString() };
      if (settings.id) {
        const { error } = await supabase.from('owner_site_settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('owner_site_settings').insert(payload).select().single();
        if (error) throw error;
        if (data) setSettings(data as SiteSettings);
      }
      showToast('Settings saved successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof SiteSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const sections = [
    { id: 'general', label: 'General', icon: 'Cog6ToothIcon' },
    { id: 'users', label: 'Users', icon: 'UsersIcon' },
    { id: 'content', label: 'Content', icon: 'DocumentTextIcon' },
    { id: 'security', label: 'Security', icon: 'ShieldCheckIcon' },
  ] as const;

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

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Settings</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Configure global platform settings</p>
        </div>
        <button onClick={saveSettings} disabled={saving || loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 20px rgba(251,191,36,0.2)' }}>
          {saving && <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeSection === s.id ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeSection === s.id ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: activeSection === s.id ? '#fbbf24' : '#78716c',
            }}>
            <Icon name={s.icon as any} size={15} />
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl p-6 space-y-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>

          {/* General */}
          {activeSection === 'general' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white">General Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Site Name</label>
                  <input type="text" value={settings.site_name} onChange={e => update('site_name', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Contact Email</label>
                  <input type="email" value={settings.contact_email} onChange={e => update('contact_email', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Site Description</label>
                  <textarea value={settings.site_description} onChange={e => update('site_description', e.target.value)}
                    rows={2} className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Support URL</label>
                  <input type="url" value={settings.support_url} onChange={e => update('support_url', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              </div>

              {/* Maintenance mode toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: settings.maintenance_mode ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${settings.maintenance_mode ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                <div>
                  <p className="text-sm font-semibold text-white">Maintenance Mode</p>
                  <p className="text-xs mt-0.5" style={{ color: '#78716c' }}>Show maintenance page to all non-owner visitors</p>
                </div>
                <button onClick={() => update('maintenance_mode', !settings.maintenance_mode)}
                  className="relative w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0"
                  style={{ background: settings.maintenance_mode ? '#ef4444' : 'rgba(255,255,255,0.1)' }}>
                  <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                    style={{ left: settings.maintenance_mode ? '26px' : '4px' }} />
                </button>
              </div>
            </div>
          )}

          {/* Users */}
          {activeSection === 'users' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white">User Settings</h3>
              <div className="space-y-3">
                {[
                  { key: 'registration_enabled' as const, label: 'Registration Enabled', desc: 'Allow new users to register' },
                  { key: 'allow_guest_view' as const, label: 'Guest View', desc: 'Allow non-logged-in users to browse content' },
                  { key: 'require_email_verification' as const, label: 'Email Verification Required', desc: 'Users must verify email before accessing the platform' },
                ].map(toggle => (
                  <div key={toggle.key} className="flex items-center justify-between p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div>
                      <p className="text-sm font-semibold text-white">{toggle.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#78716c' }}>{toggle.desc}</p>
                    </div>
                    <button onClick={() => update(toggle.key, !settings[toggle.key])}
                      className="relative w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0"
                      style={{ background: settings[toggle.key] ? '#22c55e' : 'rgba(255,255,255,0.1)' }}>
                      <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                        style={{ left: settings[toggle.key] ? '26px' : '4px' }} />
                    </button>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Default User Role</label>
                  <select value={settings.default_user_role} onChange={e => update('default_user_role', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {activeSection === 'content' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white">Content Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Max Post Length (characters)</label>
                  <input type="number" min={100} max={10000} value={settings.max_post_length}
                    onChange={e => update('max_post_length', parseInt(e.target.value) || 2000)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#78716c' }}>Max Bio Length (characters)</label>
                  <input type="number" min={50} max={1000} value={settings.max_bio_length}
                    onChange={e => update('max_bio_length', parseInt(e.target.value) || 300)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-amber-500"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          {activeSection === 'security' && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-white">Security Settings</h3>
              <div className="p-4 rounded-xl space-y-3"
                style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: '#fbbf24' }}>Owner Protection Active</p>
                    <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>
                      Database-level triggers prevent deletion or demotion of the owner account. This cannot be disabled.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl space-y-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-semibold text-white">RLS Policies</p>
                <p className="text-xs leading-relaxed" style={{ color: '#78716c' }}>
                  Row Level Security is enabled on all tables. Owner actions bypass RLS via service role key.
                  All user data is protected by Supabase authentication.
                </p>
              </div>
              <div className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-sm font-semibold text-white mb-2">Owner Email</p>
                <p className="text-sm font-mono" style={{ color: '#fbbf24' }}>lmodirv@gmail.com</p>
                <p className="text-xs mt-1" style={{ color: '#57534e' }}>This is hardcoded in the system and cannot be changed from this panel.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
