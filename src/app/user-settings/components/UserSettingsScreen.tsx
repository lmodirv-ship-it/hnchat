'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type SectionId = 'account' | 'privacy' | 'notifications' | 'security' | 'danger';

interface AccountData {
  fullName: string;
  username: string;
  email: string;
  bio: string;
  website: string;
}

interface PrivacySettings {
  profile_visibility: string;
  show_online_status: boolean;
  show_read_receipts: boolean;
  allow_messages_from: string;
  allow_tags_from: string;
  data_analytics: boolean;
  personalized_ads: boolean;
  show_activity_status: boolean;
  hide_from_search: boolean;
}

interface NotificationSettings {
  notif_likes: boolean;
  notif_comments: boolean;
  notif_follows: boolean;
  notif_messages: boolean;
  notif_trending: boolean;
  notif_mentions: boolean;
  notif_reposts: boolean;
  notif_email_digest: boolean;
  notif_push_enabled: boolean;
  notif_frequency: string;
}

const DEFAULT_PRIVACY: PrivacySettings = {
  profile_visibility: 'public',
  show_online_status: true,
  show_read_receipts: true,
  allow_messages_from: 'everyone',
  allow_tags_from: 'everyone',
  data_analytics: true,
  personalized_ads: true,
  show_activity_status: true,
  hide_from_search: false,
};

const DEFAULT_NOTIFS: NotificationSettings = {
  notif_likes: true,
  notif_comments: true,
  notif_follows: true,
  notif_messages: true,
  notif_trending: false,
  notif_mentions: true,
  notif_reposts: false,
  notif_email_digest: true,
  notif_push_enabled: true,
  notif_frequency: 'realtime',
};

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-500 text-slate-200">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>}
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

function SelectField({
  label,
  value,
  onChange,
  options,
  description,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  description?: string;
}) {
  return (
    <div className="py-3.5">
      <p className="text-sm font-500 text-slate-200 mb-1">{label}</p>
      {description && <p className="text-xs text-slate-500 mb-2 leading-relaxed">{description}</p>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none transition-all"
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

function SectionCard({
  title,
  icon,
  iconColor,
  children,
}: {
  title: string;
  icon: string;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: iconColor || 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))' }}
        >
          <Icon name={icon as any} size={15} className="text-cyan-400" />
        </div>
        <h3 className="text-sm font-600 text-slate-100">{title}</h3>
      </div>
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {children}
      </div>
    </div>
  );
}

const SECTIONS: { id: SectionId; label: string; icon: string }[] = [
  { id: 'account', label: 'الحساب', icon: 'UserCircleIcon' },
  { id: 'privacy', label: 'الخصوصية', icon: 'ShieldCheckIcon' },
  { id: 'notifications', label: 'الإشعارات', icon: 'BellIcon' },
  { id: 'security', label: 'الأمان', icon: 'LockClosedIcon' },
  { id: 'danger', label: 'منطقة الخطر', icon: 'ExclamationTriangleIcon' },
];

export default function UserSettingsScreen() {
  const { user, signOut } = useAuth();
  const supabase = createClient();

  const [activeSection, setActiveSection] = useState<SectionId>('account');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [account, setAccount] = useState<AccountData>({
    fullName: '',
    username: '',
    email: user?.email || '',
    bio: '',
    website: '',
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);
  const [notifs, setNotifs] = useState<NotificationSettings>(DEFAULT_NOTIFS);

  const loadSettings = useCallback(async () => {
    if (!user) return;
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name, username, bio, website')
        .eq('id', user.id)
        .single();

      if (profile) {
        setAccount({
          fullName: profile.full_name || '',
          username: profile.username || '',
          email: user.email || '',
          bio: profile.bio || '',
          website: profile.website || '',
        });
      }

      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefs) {
        setPrivacy({
          profile_visibility: prefs.profile_visibility ?? 'public',
          show_online_status: prefs.show_online_status ?? true,
          show_read_receipts: prefs.show_read_receipts ?? true,
          allow_messages_from: prefs.allow_messages_from ?? 'everyone',
          allow_tags_from: prefs.allow_tags_from ?? 'everyone',
          data_analytics: prefs.data_analytics ?? true,
          personalized_ads: prefs.personalized_ads ?? true,
          show_activity_status: prefs.show_activity_status ?? true,
          hide_from_search: prefs.hide_from_search ?? false,
        });
        setNotifs({
          notif_likes: prefs.notif_likes ?? true,
          notif_comments: prefs.notif_comments ?? true,
          notif_follows: prefs.notif_follows ?? true,
          notif_messages: prefs.notif_messages ?? true,
          notif_trending: prefs.notif_trending ?? false,
          notif_mentions: prefs.notif_mentions ?? true,
          notif_reposts: prefs.notif_reposts ?? false,
          notif_email_digest: prefs.notif_email_digest ?? true,
          notif_push_enabled: prefs.notif_push_enabled ?? true,
          notif_frequency: prefs.notif_frequency ?? 'realtime',
        });
      }
    } catch {
      // silently fail
    }
  }, [user, supabase]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveAccount = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { error: profileErr } = await supabase
        .from('user_profiles')
        .update({
          full_name: account.fullName,
          username: account.username,
          bio: account.bio,
          website: account.website,
        })
        .eq('id', user.id);
      if (profileErr) throw profileErr;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const savePrivacy = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { error: prefErr } = await supabase
        .from('user_preferences')
        .upsert({ ...privacy, user_id: user.id }, { onConflict: 'user_id' });
      if (prefErr) throw prefErr;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      const { error: prefErr } = await supabase
        .from('user_preferences')
        .upsert({ ...notifs, user_id: user.id }, { onConflict: 'user_id' });
      if (prefErr) throw prefErr;
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMsg({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    try {
      await signOut();
    } catch {
      // handle
    }
  };

  const updatePrivacy = (key: keyof PrivacySettings, value: any) =>
    setPrivacy((p) => ({ ...p, [key]: value }));
  const updateNotif = (key: keyof NotificationSettings, value: any) =>
    setNotifs((n) => ({ ...n, [key]: value }));

  const getSaveHandler = () => {
    if (activeSection === 'account') return saveAccount;
    if (activeSection === 'privacy') return savePrivacy;
    if (activeSection === 'notifications') return saveNotifications;
    return null;
  };

  const saveHandler = getSaveHandler();

  return (
    <div className="flex h-full">
      {/* Sidebar nav */}
      <div
        className="hidden md:flex flex-col w-56 flex-shrink-0 p-4 gap-1"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p
          className="text-xs font-600 uppercase tracking-widest px-3 mb-3"
          style={{ color: 'rgba(0,210,255,0.4)', fontSize: 9 }}
        >
          الإعدادات
        </p>
        {SECTIONS.map((s) => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 w-full ${
                isActive
                  ? 'text-cyan-300' :'text-slate-400 hover:text-slate-200 hover:bg-white/04'
              }`}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(135deg, rgba(0,210,255,0.12), rgba(155,89,255,0.08))',
                      border: '1px solid rgba(0,210,255,0.2)',
                    }
                  : { border: '1px solid transparent' }
              }
            >
              <Icon
                name={s.icon as any}
                size={16}
                className={isActive ? 'text-cyan-400' : 'text-slate-500'}
                style={isActive ? { filter: 'drop-shadow(0 0 5px rgba(0,210,255,0.5))' } : {}}
              />
              <span className="text-xs font-500">{s.label}</span>
              {s.id === 'danger' && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: 9 }}
                >
                  !
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile section tabs */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 px-4 pb-2">
        <div
          className="flex gap-1 p-1 rounded-2xl overflow-x-auto"
          style={{ background: 'rgba(5,5,8,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap text-xs font-500 transition-all flex-shrink-0 ${
                activeSection === s.id ? 'text-cyan-300' : 'text-slate-500'
              }`}
              style={
                activeSection === s.id
                  ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.1))' }
                  : {}
              }
            >
              <Icon name={s.icon as any} size={13} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-40 md:pb-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
                  boxShadow: '0 0 20px rgba(0,210,255,0.3)',
                }}
              >
                <Icon name="Cog6ToothIcon" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-700 text-slate-100">إعدادات الحساب</h1>
                <p className="text-xs text-slate-500">تحكم كامل في حسابك وخصوصيتك</p>
              </div>
            </div>
            {saveHandler && (
              <button
                onClick={saveHandler}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-600 transition-all duration-200"
                style={{
                  background: saved
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.2))'
                    : 'linear-gradient(135deg, #00d2ff, #9b59ff)',
                  color: saved ? '#34d399' : '#050508',
                  boxShadow: saved ? '0 0 12px rgba(16,185,129,0.3)' : '0 0 16px rgba(0,210,255,0.4)',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Icon name={saved ? 'CheckIcon' : 'CloudArrowUpIcon'} size={15} />
                {saving ? 'جاري الحفظ...' : saved ? 'تم الحفظ!' : 'حفظ التغييرات'}
              </button>
            )}
          </div>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl text-sm text-red-400 flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <Icon name="ExclamationCircleIcon" size={15} />
              {error}
            </div>
          )}

          {/* ── ACCOUNT ── */}
          {activeSection === 'account' && (
            <div>
              <SectionCard title="المعلومات الشخصية" icon="UserCircleIcon">
                <div className="py-3.5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">الاسم الكامل</label>
                      <input
                        type="text"
                        value={account.fullName}
                        onChange={(e) => setAccount((a) => ({ ...a, fullName: e.target.value }))}
                        placeholder="اسمك الكامل"
                        className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">اسم المستخدم</label>
                      <input
                        type="text"
                        value={account.username}
                        onChange={(e) => setAccount((a) => ({ ...a, username: e.target.value }))}
                        placeholder="@username"
                        className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={account.email}
                      disabled
                      className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-500 cursor-not-allowed"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                    />
                    <p className="text-xs text-slate-600 mt-1">لا يمكن تغيير البريد الإلكتروني مباشرة</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">نبذة شخصية</label>
                    <textarea
                      value={account.bio}
                      onChange={(e) => setAccount((a) => ({ ...a, bio: e.target.value }))}
                      placeholder="اكتب نبذة عن نفسك..."
                      rows={3}
                      className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none transition-all resize-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">الموقع الإلكتروني</label>
                    <input
                      type="url"
                      value={account.website}
                      onChange={(e) => setAccount((a) => ({ ...a, website: e.target.value }))}
                      placeholder="https://yourwebsite.com"
                      className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="معلومات الحساب" icon="InformationCircleIcon">
                <div className="py-3 space-y-2">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-500">معرّف الحساب</span>
                    <span className="text-xs font-mono text-slate-400 truncate max-w-[180px]">{user?.id?.slice(0, 16)}...</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-500">تاريخ الإنشاء</span>
                    <span className="text-xs text-slate-400">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-slate-500">حالة التحقق</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={
                        user?.email_confirmed_at
                          ? { background: 'rgba(16,185,129,0.15)', color: '#34d399' }
                          : { background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }
                      }
                    >
                      {user?.email_confirmed_at ? '✓ موثّق' : 'غير موثّق'}
                    </span>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ── PRIVACY ── */}
          {activeSection === 'privacy' && (
            <div>
              <SectionCard title="رؤية الملف الشخصي" icon="EyeIcon">
                <SelectField
                  label="من يمكنه رؤية ملفك الشخصي"
                  value={privacy.profile_visibility}
                  onChange={(v) => updatePrivacy('profile_visibility', v)}
                  options={[
                    { value: 'public', label: 'الجميع' },
                    { value: 'followers', label: 'المتابعون فقط' },
                    { value: 'private', label: 'خاص (أنت فقط)' },
                  ]}
                />
                <Toggle
                  checked={privacy.show_online_status}
                  onChange={(v) => updatePrivacy('show_online_status', v)}
                  label="إظهار حالة الاتصال"
                  description="يرى الآخرون متى تكون متصلاً"
                />
                <Toggle
                  checked={privacy.show_activity_status}
                  onChange={(v) => updatePrivacy('show_activity_status', v)}
                  label="إظهار حالة النشاط"
                  description="إظهار آخر وقت نشاط لك"
                />
                <Toggle
                  checked={privacy.hide_from_search}
                  onChange={(v) => updatePrivacy('hide_from_search', v)}
                  label="إخفاء الحساب من نتائج البحث"
                  description="لن يظهر حسابك في نتائج البحث"
                />
              </SectionCard>

              <SectionCard title="التواصل والتفاعل" icon="ChatBubbleLeftRightIcon">
                <Toggle
                  checked={privacy.show_read_receipts}
                  onChange={(v) => updatePrivacy('show_read_receipts', v)}
                  label="إيصالات القراءة"
                  description="إظهار متى قرأت الرسائل"
                />
                <SelectField
                  label="من يمكنه مراسلتك"
                  value={privacy.allow_messages_from}
                  onChange={(v) => updatePrivacy('allow_messages_from', v)}
                  options={[
                    { value: 'everyone', label: 'الجميع' },
                    { value: 'followers', label: 'المتابعون فقط' },
                    { value: 'nobody', label: 'لا أحد' },
                  ]}
                />
                <SelectField
                  label="من يمكنه وسمك في المنشورات"
                  value={privacy.allow_tags_from}
                  onChange={(v) => updatePrivacy('allow_tags_from', v)}
                  options={[
                    { value: 'everyone', label: 'الجميع' },
                    { value: 'followers', label: 'المتابعون فقط' },
                    { value: 'nobody', label: 'لا أحد' },
                  ]}
                />
              </SectionCard>

              <SectionCard title="البيانات والإعلانات" icon="ChartBarIcon">
                <Toggle
                  checked={privacy.data_analytics}
                  onChange={(v) => updatePrivacy('data_analytics', v)}
                  label="مشاركة بيانات الاستخدام"
                  description="تساعدنا في تحسين المنصة"
                />
                <Toggle
                  checked={privacy.personalized_ads}
                  onChange={(v) => updatePrivacy('personalized_ads', v)}
                  label="الإعلانات المخصصة"
                  description="إعلانات بناءً على اهتماماتك"
                />
              </SectionCard>
            </div>
          )}

          {/* ── NOTIFICATIONS ── */}
          {activeSection === 'notifications' && (
            <div>
              <SectionCard title="إشعارات التفاعل" icon="BellIcon">
                <Toggle
                  checked={notifs.notif_likes}
                  onChange={(v) => updateNotif('notif_likes', v)}
                  label="الإعجابات"
                  description="عند إعجاب شخص بمنشوراتك"
                />
                <Toggle
                  checked={notifs.notif_comments}
                  onChange={(v) => updateNotif('notif_comments', v)}
                  label="التعليقات"
                  description="عند تعليق شخص على منشوراتك"
                />
                <Toggle
                  checked={notifs.notif_mentions}
                  onChange={(v) => updateNotif('notif_mentions', v)}
                  label="الإشارات"
                  description="عند ذكر اسمك في منشور أو تعليق"
                />
                <Toggle
                  checked={notifs.notif_reposts}
                  onChange={(v) => updateNotif('notif_reposts', v)}
                  label="إعادة النشر"
                  description="عند مشاركة شخص لمنشوراتك"
                />
                <Toggle
                  checked={notifs.notif_follows}
                  onChange={(v) => updateNotif('notif_follows', v)}
                  label="المتابعون الجدد"
                  description="عند متابعة شخص لحسابك"
                />
                <Toggle
                  checked={notifs.notif_messages}
                  onChange={(v) => updateNotif('notif_messages', v)}
                  label="الرسائل"
                  description="عند استلام رسالة جديدة"
                />
              </SectionCard>

              <SectionCard title="إشعارات المنصة" icon="MegaphoneIcon">
                <Toggle
                  checked={notifs.notif_trending}
                  onChange={(v) => updateNotif('notif_trending', v)}
                  label="المحتوى الرائج"
                  description="إشعارات عن المواضيع الرائجة"
                />
                <Toggle
                  checked={notifs.notif_push_enabled}
                  onChange={(v) => updateNotif('notif_push_enabled', v)}
                  label="الإشعارات الفورية"
                  description="إشعارات على المتصفح أو الجهاز"
                />
                <Toggle
                  checked={notifs.notif_email_digest}
                  onChange={(v) => updateNotif('notif_email_digest', v)}
                  label="ملخص البريد الإلكتروني"
                  description="ملخص أسبوعي بالنشاط على حسابك"
                />
              </SectionCard>

              <SectionCard title="تكرار الإشعارات" icon="ClockIcon">
                <SelectField
                  label="تكرار الإشعارات"
                  value={notifs.notif_frequency}
                  onChange={(v) => updateNotif('notif_frequency', v)}
                  options={[
                    { value: 'realtime', label: 'فوري' },
                    { value: 'hourly', label: 'كل ساعة' },
                    { value: 'daily', label: 'يومي' },
                    { value: 'weekly', label: 'أسبوعي' },
                  ]}
                  description="كم مرة تريد تلقي الإشعارات"
                />
              </SectionCard>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeSection === 'security' && (
            <div>
              <SectionCard title="تغيير كلمة المرور" icon="LockClosedIcon">
                <div className="py-3.5 space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">كلمة المرور الحالية</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">كلمة المرور الجديدة</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">تأكيد كلمة المرور</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                  {passwordMsg && (
                    <div
                      className="px-3 py-2 rounded-xl text-xs flex items-center gap-2"
                      style={
                        passwordMsg.type === 'success'
                          ? { background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }
                          : { background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }
                      }
                    >
                      <Icon name={passwordMsg.type === 'success' ? 'CheckCircleIcon' : 'ExclamationCircleIcon'} size={13} />
                      {passwordMsg.text}
                    </div>
                  )}
                  <button
                    onClick={changePassword}
                    className="w-full py-2.5 rounded-xl text-sm font-600 transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))',
                      border: '1px solid rgba(0,210,255,0.3)',
                      color: '#00d2ff',
                    }}
                  >
                    تحديث كلمة المرور
                  </button>
                </div>
              </SectionCard>

              <SectionCard title="جلسات تسجيل الدخول" icon="DevicePhoneMobileIcon">
                <div className="py-3.5">
                  <div
                    className="flex items-center justify-between p-3 rounded-xl mb-2"
                    style={{ background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.1)' }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon name="ComputerDesktopIcon" size={16} className="text-cyan-400" />
                      <div>
                        <p className="text-xs font-500 text-slate-200">الجلسة الحالية</p>
                        <p className="text-xs text-slate-500">متصل الآن</p>
                      </div>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}
                    >
                      نشط
                    </span>
                  </div>
                  <button
                    onClick={signOut}
                    className="w-full py-2.5 rounded-xl text-sm font-500 transition-all duration-200 text-slate-400 hover:text-red-400"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    تسجيل الخروج من جميع الأجهزة
                  </button>
                </div>
              </SectionCard>
            </div>
          )}

          {/* ── DANGER ZONE ── */}
          {activeSection === 'danger' && (
            <div>
              <div
                className="rounded-2xl p-5 mb-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.03) 100%)',
                  border: '1px solid rgba(239,68,68,0.15)',
                }}
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(239,68,68,0.15)' }}
                  >
                    <Icon name="ExclamationTriangleIcon" size={15} className="text-red-400" />
                  </div>
                  <h3 className="text-sm font-600 text-red-400">منطقة الخطر</h3>
                </div>

                <div className="space-y-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <p className="text-sm font-500 text-slate-200 mb-1">تعطيل الحساب مؤقتاً</p>
                    <p className="text-xs text-slate-500 mb-3">
                      سيتم إخفاء ملفك الشخصي ومنشوراتك مؤقتاً. يمكنك إعادة التفعيل في أي وقت.
                    </p>
                    <button
                      className="px-4 py-2 rounded-xl text-xs font-600 transition-all"
                      style={{
                        background: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        color: '#fbbf24',
                      }}
                    >
                      تعطيل الحساب
                    </button>
                  </div>

                  <div
                    className="p-4 rounded-xl"
                    style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}
                  >
                    <p className="text-sm font-500 text-red-300 mb-1">حذف الحساب نهائياً</p>
                    <p className="text-xs text-slate-500 mb-3">
                      سيتم حذف جميع بياناتك ومنشوراتك ورسائلك بشكل دائم ولا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 rounded-xl text-xs font-600 transition-all"
                      style={{
                        background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171',
                      }}
                    >
                      حذف الحساب
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(15,15,25,0.98), rgba(10,10,18,0.98))',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.15)' }}
              >
                <Icon name="ExclamationTriangleIcon" size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-700 text-red-300">تأكيد الحذف</h3>
                <p className="text-xs text-slate-500">هذا الإجراء لا يمكن التراجع عنه</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              اكتب <span className="font-700 text-red-400">DELETE</span> للتأكيد
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full text-sm rounded-xl px-3 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none mb-4"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-500 text-slate-400 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== 'DELETE'}
                className="flex-1 py-2.5 rounded-xl text-sm font-600 transition-all"
                style={{
                  background: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: deleteConfirm === 'DELETE' ? '#f87171' : '#6b7280',
                  cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed',
                }}
              >
                حذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
