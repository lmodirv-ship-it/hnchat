'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  is_active: boolean;
  is_admin: boolean;
  is_owner?: boolean;
  followers_count: number;
  posts_count: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'banned' | 'admin'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('user_profiles')
      .select('id, email, username, full_name, avatar_url, is_verified, is_active, is_admin, is_owner, followers_count, posts_count, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const banUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.is_owner) { showToast('Cannot ban the site owner', 'error'); return; }
    setActionLoading(userId);
    const { error } = await supabase.from('user_profiles').update({ is_active: false }).eq('id', userId);
    if (error) { showToast('Failed to ban user', 'error'); }
    else { setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: false } : u)); showToast('User banned successfully'); }
    setActionLoading(null);
  };

  const unbanUser = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase.from('user_profiles').update({ is_active: true }).eq('id', userId);
    if (error) { showToast('Failed to unban user', 'error'); }
    else { setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: true } : u)); showToast('User unbanned successfully'); }
    setActionLoading(null);
  };

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user?.is_owner) { showToast('Cannot delete the site owner', 'error'); setConfirmDelete(null); return; }
    setActionLoading(userId);
    setConfirmDelete(null);
    const { error } = await supabase.from('user_profiles').delete().eq('id', userId);
    if (error) { showToast('Failed to delete user', 'error'); }
    else { setUsers(prev => prev.filter(u => u.id !== userId)); showToast('User deleted'); }
    setActionLoading(null);
  };

  const toggleAdmin = async (userId: string, currentValue: boolean) => {
    const user = users.find(u => u.id === userId);
    if (user?.is_owner) { showToast('Cannot change owner role', 'error'); return; }
    setActionLoading(userId);
    const { error } = await supabase.from('user_profiles').update({ is_admin: !currentValue }).eq('id', userId);
    if (error) { showToast('Failed to update role', 'error'); }
    else { setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_admin: !currentValue } : u)); showToast(`Role updated`); }
    setActionLoading(null);
  };

  const filtered = users.filter(u => {
    const matchSearch =
      u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      filter === 'all' ? true :
      filter === 'active' ? u.is_active :
      filter === 'banned' ? !u.is_active :
      filter === 'admin' ? u.is_admin : true;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-screen-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl transition-all"
          style={{
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
            color: toast.type === 'success' ? '#34d399' : '#f87171',
            backdropFilter: 'blur(12px)',
          }}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="rounded-2xl p-6 w-80 space-y-4"
            style={{ background: 'rgba(10,10,18,0.98)', border: '1px solid rgba(248,113,113,0.3)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(248,113,113,0.15)' }}>
                <Icon name="TrashIcon" size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Delete User</p>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">Are you sure you want to permanently delete this user and all their data?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={() => deleteUser(confirmDelete)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-white transition-all"
                style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">{users.length} total users registered</p>
        </div>
        <button onClick={loadUsers}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Icon name="ArrowPathIcon" size={15} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
        </div>
        <div className="flex gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['all', 'active', 'banned', 'admin'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                filter === f ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              style={filter === f ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.25)' } : {}}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Role</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, idx) => (
                  <tr key={u.id}
                    className="hover:bg-white/[0.02] transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                          {(u.full_name || u.username || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium text-slate-200">
                              {u.full_name || u.username || 'Unknown'}
                            </span>
                            {u.is_verified && (
                              <Icon name="CheckBadgeIcon" size={14} style={{ color: '#00d2ff' }} />
                            )}
                            {u.is_owner && (
                              <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                                style={{ background: 'rgba(0,210,255,0.15)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)', fontSize: 9 }}>
                                👑 OWNER
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-600">@{u.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-slate-400">{u.email || '—'}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <button
                        onClick={() => toggleAdmin(u.id, u.is_admin)}
                        disabled={actionLoading === u.id}
                        className="text-xs px-2.5 py-1 rounded-full font-medium transition-all hover:opacity-80 disabled:opacity-40"
                        style={u.is_admin
                          ? { background: 'rgba(0,210,255,0.15)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.25)' }
                          : { background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {u.is_admin ? '⚡ Admin' : 'User'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-slate-600">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={u.is_active
                          ? { background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }
                          : { background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                        {u.is_active ? '● Active' : '● Banned'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {u.is_owner ? (
                          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                            style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.2)' }}>
                            🛡️ Protected
                          </span>
                        ) : (
                          <>
                            {u.is_active ? (
                              <button
                                onClick={() => banUser(u.id)}
                                disabled={actionLoading === u.id || u.is_admin}
                                title={u.is_admin ? "Can't ban admin" : "Ban user"}
                                className="p-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
                                style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
                                {actionLoading === u.id ? (
                                  <div className="w-3.5 h-3.5 rounded-full border border-current border-t-transparent animate-spin" />
                                ) : (
                                  <Icon name="NoSymbolIcon" size={14} />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => unbanUser(u.id)}
                                disabled={actionLoading === u.id}
                                title="Unban user"
                                className="p-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30"
                                style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
                                {actionLoading === u.id ? (
                                  <div className="w-3.5 h-3.5 rounded-full border border-current border-t-transparent animate-spin" />
                                ) : (
                                  <Icon name="CheckCircleIcon" size={14} />
                                )}
                              </button>
                            )}
                            <button
                              onClick={() => setConfirmDelete(u.id)}
                              disabled={actionLoading === u.id || u.is_admin}
                              title={u.is_admin ? "Can't delete admin" : "Delete user"}
                              className="p-1.5 rounded-lg transition-all disabled:opacity-30"
                              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
                              <Icon name="TrashIcon" size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Icon name="UsersIcon" size={32} className="text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-600">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
