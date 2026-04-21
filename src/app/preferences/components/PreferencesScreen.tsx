'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type TabId = 'notifications' | 'content' | 'privacy';

interface Prefs {
  notif_likes: boolean;
  notif_comments: boolean;
  notif_follows: boolean;
  notif_messages: boolean;
  notif_trending: boolean;
  notif_fomo: boolean;
  notif_frequency: string;
  notif_quiet_hours_start: number;
  notif_quiet_hours_end: number;
  filter_nsfw: boolean;
  filter_violence: boolean;
  filter_spam: boolean;
  content_language: string;
  show_trending: boolean;
  show_suggested_users: boolean;
  profile_visibility: string;
  show_online_status: boolean;
  show_read_receipts: boolean;
  allow_messages_from: string;
  allow_tags_from: string;
  data_analytics: boolean;
  personalized_ads: boolean;
}

const DEFAULT_PREFS: Prefs = {
  notif_likes: true,
  notif_comments: true,
  notif_follows: true,
  notif_messages: true,
  notif_trending: true,
  notif_fomo: false,
  notif_frequency: 'realtime',
  notif_quiet_hours_start: 23,
  notif_quiet_hours_end: 8,
  filter_nsfw: true,
  filter_violence: true,
  filter_spam: true,
  content_language: 'all',
  show_trending: true,
  show_suggested_users: true,
  profile_visibility: 'public',
  show_online_status: true,
  show_read_receipts: true,
  allow_messages_from: 'everyone',
  allow_tags_from: 'everyone',
  data_analytics: true,
  personalized_ads: true,
};

function Toggle({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-500 text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-300 focus:outline-none"
        style={{
          background: checked
            ? 'linear-gradient(135deg, #00d2ff, #9b59ff)'
            : 'rgba(255,255,255,0.08)',
          boxShadow: checked ? '0 0 12px rgba(0,210,255,0.3)' : 'none',
        }}
        role="switch"
        aria-checked={checked}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 shadow-md"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function SelectField({ label, value, onChange, options, description }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}) {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p className="text-sm font-500 text-slate-200">{label}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm rounded-xl px-3 py-2 text-slate-200 focus:outline-none transition-all"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: '#0a0a12' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))' }}
        >
          <Icon name={icon as any} size={14} className="text-cyan-400" />
        </div>
        <h3 className="text-sm font-600 text-slate-200">{title}</h3>
      </div>
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {children}
      </div>
    </div>
  );
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'notifications', label: 'الإشعارات', icon: 'BellIcon' },
  { id: 'content', label: 'المحتوى', icon: 'AdjustmentsHorizontalIcon' },
  { id: 'privacy', label: 'الخصوصية', icon: 'ShieldCheckIcon' },
];

export default function PreferencesScreen() {
  const { user } = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabId>('notifications');
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPrefs = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    try {
      const { data, error: fetchError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      if (data) {
        setPrefs({
          notif_likes: data.notif_likes ?? true,
          notif_comments: data.notif_comments ?? true,
          notif_follows: data.notif_follows ?? true,
          notif_messages: data.notif_messages ?? true,
          notif_trending: data.notif_trending ?? true,
          notif_fomo: data.notif_fomo ?? false,
          notif_frequency: data.notif_frequency ?? 'realtime',
          notif_quiet_hours_start: data.notif_quiet_hours_start ?? 23,
          notif_quiet_hours_end: data.notif_quiet_hours_end ?? 8,
          filter_nsfw: data.filter_nsfw ?? true,
          filter_violence: data.filter_violence ?? true,
          filter_spam: data.filter_spam ?? true,
          content_language: data.content_language ?? 'all',
          show_trending: data.show_trending ?? true,
          show_suggested_users: data.show_suggested_users ?? true,
          profile_visibility: data.profile_visibility ?? 'public',
          show_online_status: data.show_online_status ?? true,
          show_read_receipts: data.show_read_receipts ?? true,
          allow_messages_from: data.allow_messages_from ?? 'everyone',
          allow_tags_from: data.allow_tags_from ?? 'everyone',
          data_analytics: data.data_analytics ?? true,
          personalized_ads: data.personalized_ads ?? true,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const update = (key: keyof Prefs, value: any) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  };

  const savePrefs = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { error: upsertError } = await supabase
        .from('user_preferences')
        .upsert({ ...prefs, user_id: user.id }, { onConflict: 'user_id' });
      if (upsertError) throw upsertError;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => ({
    value: String(i),
    label: `${String(i).padStart(2, '0')}:00`,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.3)' }}
          >
            <Icon name="Cog6ToothIcon" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-700 text-slate-100">التفضيلات</h1>
            <p className="text-xs text-slate-500">تحكم في تجربتك على hnChat</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-600 transition-all duration-200"
            style={
              activeTab === tab.id
                ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.2)' }
                : { color: 'rgba(148,163,184,0.7)', border: '1px solid transparent' }
            }
          >
            <Icon name={tab.icon as any} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div>
              <SectionCard title="أنواع الإشعارات" icon="BellAlertIcon">
                <Toggle checked={prefs.notif_likes} onChange={(v) => update('notif_likes', v)} label="الإعجابات" description="إشعار عند إعجاب أحد بمنشوراتك" />
                <Toggle checked={prefs.notif_comments} onChange={(v) => update('notif_comments', v)} label="التعليقات" description="إشعار عند تعليق أحد على منشوراتك" />
                <Toggle checked={prefs.notif_follows} onChange={(v) => update('notif_follows', v)} label="المتابعون الجدد" description="إشعار عند متابعة أحد لك" />
                <Toggle checked={prefs.notif_messages} onChange={(v) => update('notif_messages', v)} label="الرسائل" description="إشعار عند استلام رسالة جديدة" />
                <Toggle checked={prefs.notif_trending} onChange={(v) => update('notif_trending', v)} label="المحتوى الرائج" description="إشعار عند ارتفاع مشاهدات منشوراتك" />
                <Toggle checked={prefs.notif_fomo} onChange={(v) => update('notif_fomo', v)} label="تنبيهات FOMO" description="إشعارات لإعادة التفاعل والمحتوى الحصري" />
              </SectionCard>

              <SectionCard title="تكرار الإشعارات" icon="ClockIcon">
                <SelectField
                  label="تكرار الإرسال"
                  value={prefs.notif_frequency}
                  onChange={(v) => update('notif_frequency', v)}
                  description="كيف تريد استلام الإشعارات"
                  options={[
                    { value: 'realtime', label: '⚡ فوري (Real-time)' },
                    { value: 'hourly', label: '🕐 كل ساعة' },
                    { value: 'daily', label: '📅 يومي (ملخص)' },
                    { value: 'weekly', label: '📆 أسبوعي (ملخص)' },
                    { value: 'never', label: '🔕 إيقاف الكل' },
                  ]}
                />
                <SelectField
                  label="بداية وقت الهدوء"
                  value={String(prefs.notif_quiet_hours_start)}
                  onChange={(v) => update('notif_quiet_hours_start', Number(v))}
                  description="لا إشعارات بعد هذا الوقت"
                  options={hours}
                />
                <SelectField
                  label="نهاية وقت الهدوء"
                  value={String(prefs.notif_quiet_hours_end)}
                  onChange={(v) => update('notif_quiet_hours_end', Number(v))}
                  description="استئناف الإشعارات من هذا الوقت"
                  options={hours}
                />
              </SectionCard>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div>
              <SectionCard title="فلاتر المحتوى" icon="FunnelIcon">
                <Toggle checked={prefs.filter_nsfw} onChange={(v) => update('filter_nsfw', v)} label="إخفاء المحتوى الحساس" description="تصفية المحتوى غير اللائق تلقائياً" />
                <Toggle checked={prefs.filter_violence} onChange={(v) => update('filter_violence', v)} label="إخفاء محتوى العنف" description="تصفية مقاطع العنف والصدمات" />
                <Toggle checked={prefs.filter_spam} onChange={(v) => update('filter_spam', v)} label="إخفاء السبام" description="تصفية المنشورات المتكررة والإعلانات المزيفة" />
              </SectionCard>

              <SectionCard title="تخصيص الخلاصة" icon="SparklesIcon">
                <SelectField
                  label="لغة المحتوى"
                  value={prefs.content_language}
                  onChange={(v) => update('content_language', v)}
                  description="اختر لغة المحتوى المفضلة"
                  options={[
                    { value: 'all', label: '🌍 الكل' },
                    { value: 'ar', label: '🇲🇦 العربية' },
                    { value: 'fr', label: '🇫🇷 الفرنسية' },
                    { value: 'en', label: '🇬🇧 الإنجليزية' },
                    { value: 'darija', label: '🇲🇦 الدارجة' },
                  ]}
                />
                <Toggle checked={prefs.show_trending} onChange={(v) => update('show_trending', v)} label="عرض المحتوى الرائج" description="إظهار المنشورات الأكثر تفاعلاً في خلاصتك" />
                <Toggle checked={prefs.show_suggested_users} onChange={(v) => update('show_suggested_users', v)} label="اقتراح مستخدمين" description="عرض حسابات مقترحة لمتابعتها" />
              </SectionCard>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div>
              <SectionCard title="رؤية الملف الشخصي" icon="UserCircleIcon">
                <SelectField
                  label="من يرى ملفك الشخصي"
                  value={prefs.profile_visibility}
                  onChange={(v) => update('profile_visibility', v)}
                  options={[
                    { value: 'public', label: '🌍 الجميع' },
                    { value: 'followers', label: '👥 المتابعون فقط' },
                    { value: 'private', label: '🔒 خاص' },
                  ]}
                />
                <Toggle checked={prefs.show_online_status} onChange={(v) => update('show_online_status', v)} label="إظهار حالة الاتصال" description="السماح للآخرين برؤية متى تكون متصلاً" />
                <Toggle checked={prefs.show_read_receipts} onChange={(v) => update('show_read_receipts', v)} label="إيصالات القراءة" description="إظهار علامة القراءة في الرسائل" />
              </SectionCard>

              <SectionCard title="التفاعل والتواصل" icon="ChatBubbleLeftRightIcon">
                <SelectField
                  label="من يمكنه مراسلتك"
                  value={prefs.allow_messages_from}
                  onChange={(v) => update('allow_messages_from', v)}
                  options={[
                    { value: 'everyone', label: '🌍 الجميع' },
                    { value: 'followers', label: '👥 المتابعون فقط' },
                    { value: 'nobody', label: '🚫 لا أحد' },
                  ]}
                />
                <SelectField
                  label="من يمكنه وسمك"
                  value={prefs.allow_tags_from}
                  onChange={(v) => update('allow_tags_from', v)}
                  options={[
                    { value: 'everyone', label: '🌍 الجميع' },
                    { value: 'followers', label: '👥 المتابعون فقط' },
                    { value: 'nobody', label: '🚫 لا أحد' },
                  ]}
                />
              </SectionCard>

              <SectionCard title="البيانات والإعلانات" icon="ShieldCheckIcon">
                <Toggle checked={prefs.data_analytics} onChange={(v) => update('data_analytics', v)} label="تحليلات الاستخدام" description="مشاركة بيانات الاستخدام لتحسين التطبيق" />
                <Toggle checked={prefs.personalized_ads} onChange={(v) => update('personalized_ads', v)} label="إعلانات مخصصة" description="عرض إعلانات بناءً على اهتماماتك" />
              </SectionCard>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {error}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={savePrefs}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-sm font-700 transition-all duration-300 flex items-center justify-center gap-2"
            style={{
              background: saved
                ? 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.2))'
                : 'linear-gradient(135deg, #00d2ff, #9b59ff)',
              color: saved ? '#4ade80' : '#050508',
              border: saved ? '1px solid rgba(34,197,94,0.3)' : 'none',
              boxShadow: saved ? 'none' : '0 0 20px rgba(0,210,255,0.3)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                جاري الحفظ...
              </>
            ) : saved ? (
              <>
                <Icon name="CheckCircleIcon" size={16} />
                تم الحفظ بنجاح ✓
              </>
            ) : (
              <>
                <Icon name="CloudArrowUpIcon" size={16} />
                حفظ التفضيلات
              </>
            )}
          </button>

          {!user && (
            <p className="text-center text-xs text-slate-500 mt-3">
              سجّل الدخول لحفظ تفضيلاتك
            </p>
          )}
        </>
      )}
    </div>
  );
}
