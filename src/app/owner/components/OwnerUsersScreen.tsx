'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

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

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function OwnerUsersScreen() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'banned' | 'verified'>('all');

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const ownerFetch = useCallback(async (url: string, opts: RequestInit = {}) => {
    const token = await getSession();
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

  const loadUsers = useCallback(async (p = 0, q = '', role = filterRole) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: 'users', page: String(p) });
      if (q) params.set('search', q);
      const res = await ownerFetch(`/api/owner-actions?${params}`);
      const json = await res.json();
      let data: UserRow[] = json.data || [];
      if (role === 'admin') data = data.filter(u => u.is_admin && !u.is_owner);
      if (role === 'banned') data = data.filter(u => !u.is_active);
      if (role === 'verified') data = data.filter(u => u.is_verified);
      setUsers(data);
    } catch {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [ownerFetch, filterRole]);

  useEffect(() => { loadUsers(0, search, filterRole); }, [filterRole]);

  const doAction = async (action: string, payload: Record<string, string>, successMsg: string) => {
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
      await loadUsers(page, search, filterRole);
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Toast */}
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

      {/* Confirm */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full mx-4 space-y-4"
            style={{ background: 'rgba(15,15,25,0.98)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm text-white">{confirm.msg}</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={() => { setConfirm(null); confirm.fn(); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage all registered users — ban, verify, promote, or delete</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#78716c' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setPage(0); loadUsers(0, search, filterRole); } }}
            placeholder="Search by name, username, email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-1 focus:ring-amber-500"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <button onClick={() => { setPage(0); loadUsers(0, search, filterRole); }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', color: '#fbbf24' }}>
          Search
        </button>
        {(['all', 'admin', 'banned', 'verified'] as const).map(f => (
          <button key={f} onClick={() => setFilterRole(f)}
            className="px-3 py-2.5 rounded-xl text-sm font-medium capitalize transition-all"
            style={{
              background: filterRole === f ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterRole === f ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`,
              color: filterRole === f ? '#fbbf24' : '#78716c',
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-sm font-bold text-white">Users</h3>
          <span className="text-xs" style={{ color: '#78716c' }}>{users.length} shown</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-sm py-16" style={{ color: '#57534e' }}>No users found</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {users.map(user => (
              <div key={user.id} className="px-5 py-4 hover:bg-white/[0.015] transition-all">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                    style={{ background: user.is_owner ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)', color: user.is_owner ? '#fbbf24' : '#94a3b8' }}>
                    {(user.full_name || user.username || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white truncate">{user.full_name || user.username || 'Anonymous'}</p>
                      {user.is_owner && <span className="text-xs px-1.5 py-0.5 rounded-md font-bold" style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>👑 OWNER</span>}
                      {user.is_admin && !user.is_owner && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa' }}>Admin</span>}
                      {user.is_verified && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>✓ Verified</span>}
                      {!user.is_active && <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Banned</span>}
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#78716c' }}>
                      @{user.username || 'unknown'} · {user.email || 'no email'} · Joined {formatDate(user.created_at)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#57534e' }}>
                      {user.followers_count} followers · {user.posts_count} posts
                    </p>
                  </div>
                  {!user.is_owner && (
                    <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      <button disabled={!!actionLoading}
                        onClick={() => doAction(user.is_verified ? 'unverify_user' : 'verify_user', { userId: user.id }, '')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                        {user.is_verified ? 'Unverify' : 'Verify'}
                      </button>
                      <button disabled={!!actionLoading}
                        onClick={() => doAction(user.is_admin ? 'remove_admin' : 'make_admin', { userId: user.id }, '')}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa' }}>
                        {user.is_admin ? 'Demote' : 'Admin'}
                      </button>
                      <button disabled={!!actionLoading}
                        onClick={() => setConfirm({ msg: `${user.is_active ? 'Ban' : 'Unban'} @${user.username}?`, fn: () => doAction(user.is_active ? 'ban_user' : 'unban_user', { userId: user.id }, '') })}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: user.is_active ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${user.is_active ? 'rgba(251,191,36,0.25)' : 'rgba(52,211,153,0.25)'}`, color: user.is_active ? '#fbbf24' : '#34d399' }}>
                        {user.is_active ? 'Ban' : 'Unban'}
                      </button>
                      <button disabled={!!actionLoading}
                        onClick={() => setConfirm({ msg: `⚠️ Permanently delete @${user.username}? This cannot be undone.`, fn: () => doAction('delete_user', { userId: user.id }, '') })}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 disabled:opacity-50"
                        style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171' }}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button disabled={page === 0 || loading}
            onClick={() => { const p = page - 1; setPage(p); loadUsers(p, search, filterRole); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
            ← Previous
          </button>
          <span className="text-xs" style={{ color: '#57534e' }}>Page {page + 1}</span>
          <button disabled={users.length < 20 || loading}
            onClick={() => { const p = page + 1; setPage(p); loadUsers(p, search, filterRole); }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
