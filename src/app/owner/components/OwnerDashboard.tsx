'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

const OWNER_EMAIL = 'lmodirv@gmail.com';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SiteStats {
  total_users: number;
  total_posts: number;
  total_videos: number;
  total_messages: number;
  new_users_today: number;
  new_posts_today: number;
  pending_reports: number;
  total_products: number;
}

interface UserRow {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  is_admin: boolean;
  is_owner: boolean;
  role: string | null;
  created_at: string;
  followers_count: number;
  posts_count: number;
}

interface PostRow {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_published: boolean;
  user_profiles: { username: string | null; full_name: string | null } | null;
}

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

type ActiveView = 'overview' | 'users' | 'posts' | 'reports' | 'payments';

// ─── Management Sections ─────────────────────────────────────────────────────
const managementSections = [
  {
    title: 'Core Management',
    items: [
      { label: 'Admin Dashboard', icon: 'ChartBarSquareIcon', href: '/admin', color: '#00d2ff', desc: 'Main control panel' },
      { label: 'Manage Users', icon: 'UsersIcon', href: '/admin/users', color: '#a78bfa', desc: 'Ban, delete, promote' },
      { label: 'Manage Posts', icon: 'DocumentTextIcon', href: '/admin/posts', color: '#34d399', desc: 'Moderate content' },
      { label: 'Reports', icon: 'FlagIcon', href: '/admin/reports', color: '#f87171', desc: 'Review flagged content' },
    ],
  },
  {
    title: 'Analytics & Growth',
    items: [
      { label: 'Analytics', icon: 'PresentationChartLineIcon', href: '/admin/analytics', color: '#fb923c', desc: 'Traffic & engagement' },
      { label: 'Growth Analytics', icon: 'ArrowTrendingUpIcon', href: '/growth-analytics', color: '#4ade80', desc: 'Growth metrics' },
      { label: 'Monitoring', icon: 'ServerIcon', href: '/monitoring', color: '#f472b6', desc: 'System health' },
      { label: 'Push Strategy', icon: 'BellIcon', href: '/push-strategy', color: '#fbbf24', desc: 'Notification campaigns' },
    ],
  },
  {
    title: 'Marketing & Revenue',
    items: [
      { label: 'Email Dashboard', icon: 'EnvelopeIcon', href: '/email-dashboard', color: '#60a5fa', desc: 'Email campaigns' },
      { label: 'Ads Manager', icon: 'MegaphoneIcon', href: '/ads-manager', color: '#e879f9', desc: 'Ad campaigns' },
      { label: 'Ads & Promo', icon: 'SparklesIcon', href: '/ads-promo', color: '#fde68a', desc: 'Promotions' },
      { label: 'Marketplace', icon: 'ShoppingBagIcon', href: '/marketplace', color: '#6ee7b7', desc: 'Product listings' },
    ],
  },
  {
    title: 'Platform Features',
    items: [
      { label: 'Home Feed', icon: 'HomeIcon', href: '/home-feed', color: '#94a3b8', desc: 'Main social feed' },
      { label: 'Short Videos', icon: 'FilmIcon', href: '/short-videos', color: '#c084fc', desc: 'Video content' },
      { label: 'Voice Rooms', icon: 'MicrophoneIcon', href: '/voice-rooms', color: '#67e8f9', desc: 'Live audio' },
      { label: 'AI Assistant', icon: 'CpuChipIcon', href: '/ai-assistant', color: '#86efac', desc: 'AI features' },
    ],
  },
];

const ownerPrivileges = [
  { icon: '🛡️', title: 'Deletion Protection', desc: 'Cannot be deleted by any admin or system process' },
  { icon: '👑', title: 'Permanent Admin', desc: 'Admin status is irrevocable and permanent' },
  { icon: '🔓', title: 'Full Site Control', desc: 'Unrestricted access to every panel and feature' },
  { icon: '⚡', title: 'Direct DB Access', desc: 'Owner actions bypass all RLS policies' },
];

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-in"
      style={{
        background: type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
        border: `1px solid ${type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
        backdropFilter: 'blur(20px)',
      }}>
      <span className="text-lg">{type === 'success' ? '✅' : '❌'}</span>
      <p className="text-sm font-medium text-white">{message}</p>
      <button onClick={onClose} className="text-slate-400 hover:text-white ml-2">✕</button>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4"
        style={{ background: 'rgba(15,15,25,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.15)' }}>
            <Icon name="ExclamationTriangleIcon" size={20} style={{ color: '#f87171' }} />
          </div>
          <p className="text-sm text-white font-medium leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OwnerDashboard() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('overview');
  const [currentTime, setCurrentTime] = useState('');

  // Users state
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(0);

  // Posts state
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postPage, setPostPage] = useState(0);

  // Reports state
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportFilter, setReportFilter] = useState<'pending' | 'resolved' | 'dismissed'>('pending');

  // Payments state
  const [receipts, setReceipts] = useState<any[]>([]);
  const [receiptsLoading, setReceiptsLoading] = useState(false);
  const [receiptFilter, setReceiptFilter] = useState<'pending_verification' | 'approved' | 'rejected'>('pending_verification');
  const [pendingReceiptsCount, setPendingReceiptsCount] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [bankForm, setBankForm] = useState({ account_holder: '', bank_name: '', account_number: '', rib: '', iban: '', swift_code: '', instructions: '' });
  const [bankFormLoading, setBankFormLoading] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);

  // UI state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Clock ──
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Auth check ──
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Global fallback: if auth check hangs beyond 6s, redirect to login
      router.replace('/owner-login');
    }, 6000);

    const runCheck = async () => {
      try {
        // Use getUser() for a real server-validated session check
        const userPromise = supabase.auth.getUser();
        const timeoutPromise = new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('auth timeout')), 4000)
        );

        const result = await Promise.race([userPromise, timeoutPromise]);

        if (!result || !('data' in result) || result.data?.user?.email !== OWNER_EMAIL) {
          clearTimeout(timeoutId);
          router.replace('/owner-login');
          return;
        }

        try {
          await Promise.race([
            fetch('/api/owner-setup', { method: 'POST' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('setup timeout')), 3000))
          ]);
        } catch { /* ignore setup errors */ }

        try {
          await loadStats();
        } catch { /* ignore stats errors, show dashboard anyway */ }
      } catch (err) {
        console.error('Owner access check failed:', err);
        router.replace('/owner-login');
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    runCheck();

    return () => clearTimeout(timeoutId);
  }, []);

  const checkOwnerAccess = async () => {
    // kept for compatibility but logic moved to useEffect above
  };

  // ── Owner API helper ──
  const ownerFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-owner-access': 'granted',
      ...(options.headers as Record<string, string> || {}),
    };

    // Also attach Supabase token if available
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['authorization'] = `Bearer ${session.access_token}`;
    }

    return fetch(url, { ...options, headers });
  }, [supabase]);

  // ── Stats ──
  const loadStats = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [usersRes, postsRes, videosRes, messagesRes, newUsersRes, newPostsRes, reportsRes, productsRes] = await Promise.all([
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }),
      supabase.from('videos').select('id', { count: 'exact', head: true }),
      supabase.from('messages').select('id', { count: 'exact', head: true }),
      supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('posts').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('marketplace_products').select('id', { count: 'exact', head: true }),
    ]);

    setStats({
      total_users: usersRes.count ?? 0,
      total_posts: postsRes.count ?? 0,
      total_videos: videosRes.count ?? 0,
      total_messages: messagesRes.count ?? 0,
      new_users_today: newUsersRes.count ?? 0,
      new_posts_today: newPostsRes.count ?? 0,
      pending_reports: reportsRes.count ?? 0,
      total_products: productsRes.count ?? 0,
    });
  }, [supabase]);

  // ── Load Users ──
  const loadUsers = useCallback(async (page = 0, search = '') => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({ type: 'users', page: String(page) });
      if (search) params.set('search', search);
      const res = await ownerFetch(`/api/owner-actions?${params}`);
      const json = await res.json();
      if (json.data) setUsers(json.data);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [ownerFetch]);

  // ── Load Posts ──
  const loadPosts = useCallback(async (page = 0) => {
    setPostsLoading(true);
    try {
      const res = await ownerFetch(`/api/owner-actions?type=posts&page=${page}`);
      const json = await res.json();
      if (json.data) setPosts(json.data);
    } catch {
      showToast('Failed to load posts', 'error');
    } finally {
      setPostsLoading(false);
    }
  }, [ownerFetch]);

  // ── Load Reports ──
  const loadReports = useCallback(async (status: string) => {
    setReportsLoading(true);
    try {
      const res = await ownerFetch(`/api/owner-actions?type=reports&status=${status}`);
      const json = await res.json();
      if (json.data) setReports(json.data);
    } catch {
      showToast('Failed to load reports', 'error');
    } finally {
      setReportsLoading(false);
    }
  }, [ownerFetch]);

  // ── Load Receipts ──
  const loadReceipts = useCallback(async (status: string) => {
    setReceiptsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_receipts')
        .select(`
          *,
          subscriptions (plan_name, amount_mad, amount_usd, payment_method),
          user_profiles!payment_receipts_user_id_fkey (username, full_name, email)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) setReceipts(data);
    } catch {
      showToast('Failed to load receipts', 'error');
    } finally {
      setReceiptsLoading(false);
    }
  }, [supabase]);

  // ── Load pending receipts count ──
  const loadPendingReceiptsCount = useCallback(async () => {
    const { count } = await supabase
      .from('payment_receipts')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_verification');
    setPendingReceiptsCount(count ?? 0);
  }, [supabase]);

  // ── Load Bank Details ──
  const loadBankDetails = useCallback(async () => {
    setBankFormLoading(true);
    try {
      const { data } = await supabase
        .from('bank_transfer_details')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();
      if (data) setBankForm({
        account_holder: data.account_holder || '',
        bank_name: data.bank_name || '',
        account_number: data.account_number || '',
        rib: data.rib || '',
        iban: data.iban || '',
        swift_code: data.swift_code || '',
        instructions: data.instructions || '',
      });
    } catch { /* no bank details yet */ } finally {
      setBankFormLoading(false);
    }
  }, [supabase]);

  // ── Save Bank Details ──
  const saveBankDetails = async () => {
    setBankSaving(true);
    try {
      const { data: existing } = await supabase
        .from('bank_transfer_details')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (existing) {
        await supabase.from('bank_transfer_details').update({ ...bankForm, updated_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await supabase.from('bank_transfer_details').insert({ ...bankForm, currency: 'MAD', is_active: true });
      }
      showToast('تم حفظ معلومات البنك بنجاح', 'success');
    } catch {
      showToast('فشل حفظ المعلومات', 'error');
    } finally {
      setBankSaving(false);
    }
  };

  // ── Handle Receipt Action ──
  const handleReceiptAction = async (receiptId: string, subscriptionId: string, action: 'approve' | 'reject') => {
    const key = `receipt_${receiptId}`;
    setActionLoading(key);
    try {
      const res = await ownerFetch('/api/payments/verify-receipt', {
        method: 'POST',
        body: JSON.stringify({
          receipt_id: receiptId,
          subscription_id: subscriptionId,
          action,
          rejection_reason: action === 'reject' ? rejectReason : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showToast(json.message, 'success');
      setRejectingId(null);
      setRejectReason('');
      await loadReceipts(receiptFilter);
      await loadPendingReceiptsCount();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // ── View switching ──
  useEffect(() => {
    if (activeView === 'users') loadUsers(userPage, userSearch);
    if (activeView === 'posts') loadPosts(postPage);
    if (activeView === 'reports') loadReports(reportFilter);
    if (activeView === 'payments') {
      loadReceipts(receiptFilter);
      loadBankDetails();
    }
  }, [activeView]);

  useEffect(() => {
    loadPendingReceiptsCount();
  }, [loadPendingReceiptsCount]);

  // ── Toast helper ──
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // ── Owner action ──
  const doAction = useCallback(async (action: string, payload: Record<string, string>, successMsg: string) => {
    const key = `${action}_${Object.values(payload)[0]}`;
    setActionLoading(key);
    try {
      const res = await ownerFetch('/api/owner-actions', {
        method: 'POST',
        body: JSON.stringify({ action, ...payload }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');
      showToast(json.message || successMsg, 'success');

      // Refresh relevant data
      if (action.includes('user') || action.includes('admin')) {
        await loadUsers(userPage, userSearch);
        await loadStats();
      }
      if (action.includes('post')) {
        await loadPosts(postPage);
        await loadStats();
      }
      if (action.includes('report')) {
        await loadReports(reportFilter);
        await loadStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  }, [ownerFetch, loadUsers, loadPosts, loadReports, userPage, userSearch, postPage, reportFilter]);

  const confirmAction = (message: string, action: () => void) => {
    setConfirm({ message, onConfirm: () => { setConfirm(null); action(); } });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    try { localStorage.removeItem('owner_access'); } catch { /* ignore */ }
    router.push('/sign-up-login');
  };

  // ─── Loading screen ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: '#050508' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border border-yellow-600 border-b-transparent animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
          </div>
          <p className="text-sm font-medium" style={{ color: '#fbbf24' }}>Verifying owner access...</p>
        </div>
      </div>
    );
  }

  const primaryStats = [
    { label: 'Total Users', value: stats?.total_users ?? 0, sub: `+${stats?.new_users_today ?? 0} today`, icon: 'UsersIcon', color: '#fbbf24', glow: 'rgba(251,191,36,0.2)', view: 'users' as ActiveView },
    { label: 'Total Posts', value: stats?.total_posts ?? 0, sub: `+${stats?.new_posts_today ?? 0} today`, icon: 'DocumentTextIcon', color: '#34d399', glow: 'rgba(52,211,153,0.15)', view: 'posts' as ActiveView },
    { label: 'Total Videos', value: stats?.total_videos ?? 0, sub: 'Published', icon: 'FilmIcon', color: '#f472b6', glow: 'rgba(244,114,182,0.15)', view: null },
    { label: 'Messages', value: stats?.total_messages ?? 0, sub: 'All time', icon: 'ChatBubbleLeftRightIcon', color: '#60a5fa', glow: 'rgba(96,165,250,0.15)', view: null },
    { label: 'Products', value: stats?.total_products ?? 0, sub: 'Marketplace', icon: 'ShoppingBagIcon', color: '#a78bfa', glow: 'rgba(167,139,250,0.15)', view: null },
    { label: 'Pending Reports', value: stats?.pending_reports ?? 0, sub: 'Need review', icon: 'FlagIcon', color: '#f87171', glow: 'rgba(248,113,113,0.15)', view: 'reports' as ActiveView },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#050508' }}>
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[800px] h-[800px] rounded-full opacity-[0.035]"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 65%)' }} />
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Confirm Dialog */}
      {confirm && <ConfirmDialog message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #92400e 100%)', boxShadow: '0 0 40px rgba(251,191,36,0.5), 0 0 80px rgba(251,191,36,0.2)' }}>
                <AppLogo size={28} />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', boxShadow: '0 0 12px rgba(251,191,36,0.6)' }}>
                👑
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Owner Command Center</h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.4)' }}>
                  SUPREME ACCESS
                </span>
              </div>
              <p className="text-sm mt-1" style={{ color: '#78716c' }}>
                <span style={{ color: '#fbbf24' }}>{OWNER_EMAIL}</span>
                <span className="mx-2">·</span>
                <span>{currentTime}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { loadStats(); if (activeView === 'users') loadUsers(userPage, userSearch); if (activeView === 'posts') loadPosts(postPage); if (activeView === 'reports') loadReports(reportFilter); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
              <Icon name="ArrowPathIcon" size={15} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Icon name="ArrowRightOnRectangleIcon" size={15} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* ── OWNER IDENTITY BANNER ── */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.05) 50%, rgba(146,64,14,0.04) 100%)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <div className="absolute top-0 right-0 w-64 h-full opacity-10"
            style={{ background: 'linear-gradient(to left, rgba(251,191,36,0.3), transparent)' }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.35)' }}>
                <Icon name="ShieldCheckIcon" size={22} style={{ color: '#fbbf24' }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Protected Owner Account — Full Sovereignty</p>
                <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>
                  This account has permanent, irrevocable ownership of <span style={{ color: '#fbbf24' }}>hnChat</span>. No admin can modify, ban, or delete this account.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              {ownerPrivileges.slice(0, 2).map((p) => (
                <div key={p.title} className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                  <span>{p.icon}</span>
                  <span>{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── NAV TABS ── */}
        <div className="flex gap-2 flex-wrap">
          {([
            { id: 'overview', label: 'Overview', icon: 'HomeIcon' },
            { id: 'users', label: 'Users', icon: 'UsersIcon' },
            { id: 'posts', label: 'Posts', icon: 'DocumentTextIcon' },
            { id: 'reports', label: 'Reports', icon: 'FlagIcon', badge: stats?.pending_reports },
            { id: 'payments', label: 'Payments', icon: 'BanknotesIcon', badge: pendingReceiptsCount },
          ] as const).map((tab) => (
            <button key={tab.id}
              onClick={() => setActiveView(tab.id as ActiveView)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeView === tab.id ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeView === tab.id ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.07)'}`,
                color: activeView === tab.id ? '#fbbf24' : '#78716c',
              }}>
              <Icon name={tab.icon as any} size={15} />
              {tab.label}
              {'badge' in tab && tab.badge ? (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171' }}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── OVERVIEW VIEW ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#78716c' }}>Platform Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {primaryStats.map((card) => (
                  <div key={card.label}
                    onClick={() => card.view && setActiveView(card.view)}
                    className={`rounded-2xl p-4 space-y-3 transition-all duration-200 hover:scale-[1.02] ${card.view ? 'cursor-pointer' : ''}`}
                    style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: card.glow, border: `1px solid ${card.color}30` }}>
                      <Icon name={card.icon as any} size={17} style={{ color: card.color }} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white leading-none">{card.value.toLocaleString()}</p>
                      <p className="text-xs font-medium mt-1" style={{ color: '#78716c' }}>{card.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: card.color, opacity: 0.8 }}>{card.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Owner Privileges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ownerPrivileges.map((priv) => (
                <div key={priv.title} className="flex items-start gap-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                  <span className="text-2xl flex-shrink-0 leading-none">{priv.icon}</span>
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#fbbf24' }}>{priv.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#a8a29e' }}>{priv.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Management Sections */}
            <div className="space-y-4">
              {managementSections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#78716c' }}>{section.title}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <div className="rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] group"
                          style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                            style={{ background: `${item.color}18`, border: `1px solid ${item.color}30` }}>
                            <Icon name={item.icon as any} size={19} style={{ color: item.color }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="text-xs mt-0.5" style={{ color: '#57534e' }}>{item.desc}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── USERS VIEW ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'users' && (
          <div className="space-y-4">
            {/* Search bar */}
            <div className="flex gap-3 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#78716c' }} />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { setUserPage(0); loadUsers(0, userSearch); } }}
                  placeholder="Search by name, username, email..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
              <button onClick={() => { setUserPage(0); loadUsers(0, userSearch); }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
                Search
              </button>
            </div>

            {/* Users table */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="text-sm font-bold text-white">All Users</h3>
                <span className="text-xs" style={{ color: '#78716c' }}>{users.length} shown</span>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-sm py-12" style={{ color: '#57534e' }}>No users found</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {users.map((user) => {
                    const isOwner = user.is_owner;
                    return (
                      <div key={user.id} className="px-5 py-4 hover:bg-white/[0.015] transition-all">
                        <div className="flex items-center gap-4 flex-wrap">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                            style={{ background: isOwner ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)', color: isOwner ? '#fbbf24' : '#94a3b8' }}>
                            {(user.full_name || user.username || '?')[0].toUpperCase()}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-white truncate">{user.full_name || user.username || 'Anonymous'}</p>
                              {isOwner && <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>👑 OWNER</span>}
                              {user.is_admin && !isOwner && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa' }}>Admin</span>}
                              {user.is_verified && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>✓ Verified</span>}
                              {!user.is_active && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Banned</span>}
                            </div>
                            <p className="text-xs mt-0.5 truncate" style={{ color: '#78716c' }}>
                              @{user.username || 'unknown'} · {user.email || 'no email'} · {user.followers_count} followers · {user.posts_count} posts
                            </p>
                          </div>

                          {/* Actions */}
                          {!isOwner && (
                            <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                              {/* Verify / Unverify */}
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => doAction(
                                  user.is_verified ? 'unverify_user' : 'verify_user',
                                  { userId: user.id },
                                  user.is_verified ? 'User unverified' : 'User verified'
                                )}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}
                                title={user.is_verified ? 'Remove verification' : 'Verify user'}>
                                {user.is_verified ? '✓ Unverify' : '✓ Verify'}
                              </button>

                              {/* Admin toggle */}
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => doAction(
                                  user.is_admin ? 'remove_admin' : 'make_admin',
                                  { userId: user.id },
                                  user.is_admin ? 'Admin removed' : 'Promoted to admin'
                                )}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                                style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }}
                                title={user.is_admin ? 'Remove admin' : 'Make admin'}>
                                {user.is_admin ? 'Demote' : 'Admin'}
                              </button>

                              {/* Ban / Unban */}
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => confirmAction(
                                  `Are you sure you want to ${user.is_active ? 'ban' : 'unban'} @${user.username || user.id}?`,
                                  () => doAction(
                                    user.is_active ? 'ban_user' : 'unban_user',
                                    { userId: user.id },
                                    user.is_active ? 'User banned' : 'User unbanned'
                                  )
                                )}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                                style={{
                                  background: user.is_active ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)',
                                  border: `1px solid ${user.is_active ? 'rgba(251,191,36,0.25)' : 'rgba(52,211,153,0.25)'}`,
                                  color: user.is_active ? '#fbbf24' : '#34d399',
                                }}>
                                {user.is_active ? 'Ban' : 'Unban'}
                              </button>

                              {/* Delete */}
                              <button
                                disabled={actionLoading !== null}
                                onClick={() => confirmAction(
                                  `⚠️ Permanently delete @${user.username || user.id}? This cannot be undone.`,
                                  () => doAction('delete_user', { userId: user.id }, 'User deleted')
                                )}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                                style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  disabled={userPage === 0 || usersLoading}
                  onClick={() => { const p = userPage - 1; setUserPage(p); loadUsers(p, userSearch); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                  ← Previous
                </button>
                <span className="text-xs" style={{ color: '#57534e' }}>Page {userPage + 1}</span>
                <button
                  disabled={users.length < 20 || usersLoading}
                  onClick={() => { const p = userPage + 1; setUserPage(p); loadUsers(p, userSearch); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── POSTS VIEW ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'posts' && (
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="text-sm font-bold text-white">All Posts</h3>
                <span className="text-xs" style={{ color: '#78716c' }}>{posts.length} shown</span>
              </div>

              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
              ) : posts.length === 0 ? (
                <p className="text-center text-sm py-12" style={{ color: '#57534e' }}>No posts found</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {posts.map((post) => (
                    <div key={post.id} className="px-5 py-4 hover:bg-white/[0.015] transition-all">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                              @{post.user_profiles?.username || 'unknown'}
                            </span>
                            {!post.is_published && (
                              <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Hidden</span>
                            )}
                            <span className="text-xs" style={{ color: '#57534e' }}>{formatTimeAgo(post.created_at)}</span>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">{post.content}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-xs flex items-center gap-1" style={{ color: '#78716c' }}>
                              <Icon name="HeartIcon" size={11} /> {post.likes_count}
                            </span>
                            <span className="text-xs flex items-center gap-1" style={{ color: '#78716c' }}>
                              <Icon name="ChatBubbleLeftIcon" size={11} /> {post.comments_count}
                            </span>
                          </div>
                        </div>

                        {/* Post actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => doAction(
                              post.is_published ? 'hide_post' : 'show_post',
                              { postId: post.id },
                              post.is_published ? 'Post hidden' : 'Post published'
                            )}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                            style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
                            {post.is_published ? 'Hide' : 'Show'}
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => confirmAction(
                              `Delete this post by @${post.user_profiles?.username || 'unknown'}? This cannot be undone.`,
                              () => doAction('delete_post', { postId: post.id }, 'Post deleted')
                            )}
                            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button
                  disabled={postPage === 0 || postsLoading}
                  onClick={() => { const p = postPage - 1; setPostPage(p); loadPosts(p); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                  ← Previous
                </button>
                <span className="text-xs" style={{ color: '#57534e' }}>Page {postPage + 1}</span>
                <button
                  disabled={posts.length < 20 || postsLoading}
                  onClick={() => { const p = postPage + 1; setPostPage(p); loadPosts(p); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── REPORTS VIEW ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'reports' && (
          <div className="space-y-4">
            {/* Filter tabs */}
            <div className="flex gap-2">
              {(['pending', 'resolved', 'dismissed'] as const).map((s) => (
                <button key={s}
                  onClick={() => { setReportFilter(s); loadReports(s); }}
                  className="px-4 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                  style={{
                    background: reportFilter === s ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${reportFilter === s ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    color: reportFilter === s ? '#fbbf24' : '#78716c',
                  }}>
                  {s}
                  {s === 'pending' && stats?.pending_reports ? ` (${stats.pending_reports})` : ''}
                </button>
              ))}
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 className="text-sm font-bold text-white capitalize">{reportFilter} Reports</h3>
              </div>

              {reportsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
              ) : reports.length === 0 ? (
                <p className="text-center text-sm py-12" style={{ color: '#57534e' }}>No {reportFilter} reports</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {reports.map((report) => (
                    <div key={report.id} className="px-5 py-4 hover:bg-white/[0.015] transition-all">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
                          <Icon name="FlagIcon" size={16} style={{ color: '#f87171' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-semibold text-white">{report.reason}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium`}
                              style={{
                                background: report.status === 'pending' ? 'rgba(251,191,36,0.15)' : report.status === 'resolved' ? 'rgba(52,211,153,0.15)' : 'rgba(100,116,139,0.15)',
                                color: report.status === 'pending' ? '#fbbf24' : report.status === 'resolved' ? '#34d399' : '#94a3b8',
                              }}>
                              {report.status}
                            </span>
                            <span className="text-xs" style={{ color: '#57534e' }}>{formatTimeAgo(report.created_at)}</span>
                          </div>
                          {report.description && (
                            <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#78716c' }}>{report.description}</p>
                          )}
                          <div className="flex gap-3 mt-1 text-xs" style={{ color: '#57534e' }}>
                            {report.reported_user_id && <span>User: {report.reported_user_id.slice(0, 8)}...</span>}
                            {report.reported_post_id && <span>Post: {report.reported_post_id.slice(0, 8)}...</span>}
                          </div>
                        </div>

                        {/* Report actions */}
                        {report.status === 'pending' && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => doAction('resolve_report', { reportId: report.id }, 'Report resolved')}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                              Resolve
                            </button>
                            <button
                              disabled={actionLoading !== null}
                              onClick={() => doAction('dismiss_report', { reportId: report.id }, 'Report dismissed')}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                              style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.25)', color: '#94a3b8' }}>
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
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ── PAYMENTS VIEW ── */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeView === 'payments' && (
          <div className="space-y-6">
            {/* ── Bank Details Config ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)' }}>
                  <Icon name="BuildingLibraryIcon" size={16} style={{ color: '#34d399' }} />
                </div>
                <h3 className="text-sm font-bold text-white">معلومات التحويل البنكي</h3>
              </div>
              {bankFormLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'account_holder', label: 'صاحب الحساب', placeholder: 'hnChat Platform' },
                    { key: 'bank_name', label: 'اسم البنك', placeholder: 'Attijariwafa Bank' },
                    { key: 'account_number', label: 'رقم الحساب', placeholder: '007 780 ...' },
                    { key: 'rib', label: 'RIB', placeholder: '007780...' },
                    { key: 'iban', label: 'IBAN', placeholder: 'MA64...' },
                    { key: 'swift_code', label: 'SWIFT', placeholder: 'BCMAMAMC' },
                  ].map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="text-xs text-slate-500 block mb-1.5">{label}</label>
                      <input
                        value={(bankForm as any)[key]}
                        onChange={(e) => setBankForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-700 outline-none focus:ring-1 focus:ring-amber-500"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-slate-500 block mb-1.5">تعليمات للمستخدم</label>
                    <textarea
                      value={bankForm.instructions}
                      onChange={(e) => setBankForm((prev) => ({ ...prev, instructions: e.target.value }))}
                      placeholder="يرجى تحويل المبلغ وإرفاق إيصال..."
                      rows={2}
                      className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-700 outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button onClick={saveBankDetails} disabled={bankSaving}
                      className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg, #34d399, #059669)', color: '#0a0a0f' }}>
                      {bankSaving ? 'جاري الحفظ...' : 'حفظ المعلومات'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Receipts Management ── */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-5 py-4 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.15)' }}>
                    <Icon name="DocumentCheckIcon" size={16} style={{ color: '#fbbf24' }} />
                  </div>
                  <h3 className="text-sm font-bold text-white">إيصالات الدفع</h3>
                </div>
                <div className="flex gap-2">
                  {([
                    { id: 'pending_verification', label: 'قيد المراجعة', color: '#60a5fa' },
                    { id: 'approved', label: 'مقبول', color: '#34d399' },
                    { id: 'rejected', label: 'مرفوض', color: '#f87171' },
                  ] as const).map((f) => (
                    <button key={f.id}
                      onClick={() => { setReceiptFilter(f.id); loadReceipts(f.id); }}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: receiptFilter === f.id ? `${f.color}18` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${receiptFilter === f.id ? `${f.color}44` : 'rgba(255,255,255,0.07)'}`,
                        color: receiptFilter === f.id ? f.color : '#78716c',
                      }}>
                      {f.label}
                      {f.id === 'pending_verification' && pendingReceiptsCount > 0 && (
                        <span className="mr-1 text-xs px-1 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(248,113,113,0.2)', color: '#f87171' }}>
                          {pendingReceiptsCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {receiptsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                </div>
              ) : receipts.length === 0 ? (
                <p className="text-center text-sm py-12" style={{ color: '#57534e' }}>لا توجد إيصالات</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  {receipts.map((receipt) => {
                    const profile = receipt.user_profiles;
                    const sub = receipt.subscriptions;
                    const isRejecting = rejectingId === receipt.id;
                    return (
                      <div key={receipt.id} className="px-5 py-4 hover:bg-white/[0.015] transition-all">
                        <div className="flex items-start gap-4 flex-wrap">
                          {/* User info */}
                          <div className="flex-1 min-w-[200px] space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-white">
                                {profile?.full_name || profile?.username || 'مستخدم'}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  background: sub?.payment_method === 'paypal' ? 'rgba(0,112,243,0.15)' : 'rgba(52,211,153,0.1)',
                                  color: sub?.payment_method === 'paypal' ? '#60a5fa' : '#34d399',
                                  border: `1px solid ${sub?.payment_method === 'paypal' ? 'rgba(0,112,243,0.3)' : 'rgba(52,211,153,0.25)'}`,
                                }}>
                                {sub?.payment_method === 'paypal' ? 'PayPal' : 'تحويل بنكي'}
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: '#78716c' }}>
                              {profile?.email} · خطة {sub?.plan_name} ·{' '}
                              {sub?.payment_method === 'paypal'
                                ? `$${sub?.amount_usd} USD`
                                : `${sub?.amount_mad} درهم`}
                            </p>
                            {receipt.transfer_reference && (
                              <p className="text-xs font-mono" style={{ color: '#94a3b8' }}>
                                Ref: {receipt.transfer_reference}
                              </p>
                            )}
                            {receipt.notes && (
                              <p className="text-xs italic" style={{ color: '#64748b' }}>{receipt.notes}</p>
                            )}
                            <p className="text-xs" style={{ color: '#44403c' }}>
                              {new Date(receipt.created_at).toLocaleString('ar-MA')}
                            </p>
                          </div>

                          {/* Receipt preview */}
                          <div className="flex items-center gap-3">
                            <a
                              href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/authenticated/payment-receipts/${receipt.receipt_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                              <Icon name="DocumentArrowDownIcon" size={14} />
                              عرض الإيصال
                            </a>
                          </div>

                          {/* Actions */}
                          {receiptFilter === 'pending_verification' && (
                            <div className="flex flex-col gap-2 flex-shrink-0">
                              {isRejecting ? (
                                <div className="space-y-2">
                                  <input
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="سبب الرفض..."
                                    className="w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600 outline-none"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(248,113,113,0.3)' }}
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleReceiptAction(receipt.id, receipt.subscription_id, 'reject')}
                                      disabled={actionLoading !== null}
                                      className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                      style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                                      تأكيد الرفض
                                    </button>
                                    <button onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-all"
                                      style={{ background: 'rgba(255,255,255,0.05)' }}>
                                      إلغاء
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleReceiptAction(receipt.id, receipt.subscription_id, 'approve')}
                                    disabled={actionLoading !== null}
                                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
                                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                                    ✓ قبول
                                  </button>
                                  <button
                                    onClick={() => setRejectingId(receipt.id)}
                                    disabled={actionLoading !== null}
                                    className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
                                    style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                                    ✕ رفض
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {receiptFilter === 'rejected' && receipt.rejection_reason && (
                            <div className="text-xs px-3 py-2 rounded-xl"
                              style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                              {receipt.rejection_reason}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 pb-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <AppLogo size={12} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#57534e' }}>hnChat Owner Portal</span>
          </div>
          <p className="text-xs" style={{ color: '#44403c' }}>
            Logged in as <span style={{ color: '#fbbf24' }}>{OWNER_EMAIL}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
