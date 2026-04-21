'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_posts: number;
  total_videos: number;
  total_messages: number;
  pending_reports: number;
  new_users_today: number;
  new_posts_today: number;
}

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string;
  is_verified: boolean;
  is_active: boolean;
  is_admin: boolean;
  followers_count: number;
  posts_count: number;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  post_type: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profiles: { username: string; full_name: string } | null;
}

interface Report {
  id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter: { username: string } | null;
  reported_user: { username: string } | null;
}

type Tab = 'overview' | 'users' | 'posts' | 'reports';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      router.push('/sign-up-login');
      return;
    }
    const { data } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!data?.is_admin) {
      router.push('/home-feed');
      return;
    }
    setIsAdmin(true);
    loadStats();
    loadUsers();
  };

  const loadStats = async () => {
    try {
      const { data } = await supabase.rpc('get_admin_analytics');
      if (data) setStats(data as AdminStats);
    } catch (err) {
      console.log('loadStats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('id, email, username, full_name, avatar_url, is_verified, is_active, is_admin, followers_count, posts_count, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setUsers(data);
  };

  const loadPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, content, post_type, likes_count, comments_count, created_at, user_profiles(username, full_name)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setPosts(data as Post[]);
  };

  const loadReports = async () => {
    const { data } = await supabase
      .from('reports')
      .select('id, reason, description, status, created_at, reporter:reporter_id(username), reported_user:reported_user_id(username)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setReports(data as any);
  };

  useEffect(() => {
    if (!isAdmin) return;
    if (activeTab === 'posts') loadPosts();
    if (activeTab === 'reports') loadReports();
  }, [activeTab, isAdmin]);

  const banUser = async (userId: string) => {
    setActionLoading(userId);
    await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: false } : u));
    setActionLoading(null);
  };

  const unbanUser = async (userId: string) => {
    setActionLoading(userId);
    await supabase
      .from('user_profiles')
      .update({ is_active: true })
      .eq('id', userId);
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: true } : u));
    setActionLoading(null);
  };

  const deletePost = async (postId: string) => {
    setActionLoading(postId);
    await supabase.from('posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    setActionLoading(null);
  };

  const resolveReport = async (reportId: string) => {
    setActionLoading(reportId);
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r));
    setActionLoading(null);
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin && !loading) return null;

  const statCards = [
    { label: 'Total Users', value: stats?.total_users ?? 0, icon: 'UsersIcon', color: '#00d2ff', change: `+${stats?.new_users_today ?? 0} today` },
    { label: 'Active Users', value: stats?.active_users ?? 0, icon: 'UserCircleIcon', color: '#9b59ff', change: 'Currently active' },
    { label: 'Total Posts', value: stats?.total_posts ?? 0, icon: 'DocumentTextIcon', color: '#e879f9', change: `+${stats?.new_posts_today ?? 0} today` },
    { label: 'Total Videos', value: stats?.total_videos ?? 0, icon: 'FilmIcon', color: '#00d2ff', change: 'Published' },
    { label: 'Messages', value: stats?.total_messages ?? 0, icon: 'ChatBubbleLeftRightIcon', color: '#9b59ff', change: 'All time' },
    { label: 'Pending Reports', value: stats?.pending_reports ?? 0, icon: 'FlagIcon', color: '#f87171', change: 'Needs review' },
  ];

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'ChartBarIcon' },
    { id: 'users', label: 'Users', icon: 'UsersIcon' },
    { id: 'posts', label: 'Posts', icon: 'DocumentTextIcon' },
    { id: 'reports', label: 'Reports', icon: 'FlagIcon' },
  ];

  return (
    <AppLayout activePath="/admin">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 24px rgba(0,210,255,0.4)' }}
          >
            <Icon name="ShieldCheckIcon" size={24} className="text-ice-black" />
          </div>
          <div>
            <h1 className="text-2xl font-800 gradient-text">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Manage users, content, and platform health</p>
          </div>
          <div className="ml-auto">
            <span
              className="px-3 py-1.5 rounded-full text-xs font-700 uppercase tracking-widest"
              style={{ background: 'rgba(0,210,255,0.15)', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }}
            >
              ⚡ Admin Access
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 transition-all duration-200 flex-1 justify-center ${
                activeTab === tab.id ? 'text-ice-black' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' } : {}}
            >
              <Icon name={tab.icon as any} size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-glow border-t-transparent animate-spin" />
          </div>
        )}

        {/* Overview Tab */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${card.color}20`, border: `1px solid ${card.color}30` }}
                    >
                      <Icon name={card.icon as any} size={20} style={{ color: card.color }} />
                    </div>
                  </div>
                  <div className="text-3xl font-800 text-slate-100 mb-1 tabular-nums">
                    {card.value.toLocaleString()}
                  </div>
                  <div className="text-sm font-600 text-slate-300 mb-1">{card.label}</div>
                  <div className="text-xs text-slate-600">{card.change}</div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div
              className="rounded-2xl p-6"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <h3 className="text-base font-700 text-slate-200 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Manage Users', icon: 'UsersIcon', tab: 'users' as Tab },
                  { label: 'Review Posts', icon: 'DocumentTextIcon', tab: 'posts' as Tab },
                  { label: 'View Reports', icon: 'FlagIcon', tab: 'reports' as Tab },
                  { label: 'Analytics', icon: 'ChartBarIcon', tab: 'overview' as Tab },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={() => setActiveTab(action.tab)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 hover:bg-white/06 text-slate-400 hover:text-slate-200"
                    style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <Icon name={action.icon as any} size={22} />
                    <span className="text-xs font-500">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {!loading && activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Icon name="MagnifyingGlassIcon" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-slate-200 placeholder-slate-600 outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
              <span className="text-sm text-slate-500">{filteredUsers.length} users</span>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th className="text-left px-4 py-3 text-xs font-700 text-slate-400 uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 text-xs font-700 text-slate-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                      <th className="text-left px-4 py-3 text-xs font-700 text-slate-400 uppercase tracking-wider hidden lg:table-cell">Followers</th>
                      <th className="text-left px-4 py-3 text-xs font-700 text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-700 text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u, idx) => (
                      <tr
                        key={u.id}
                        style={{
                          background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                        }}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-700 text-ice-black flex-shrink-0"
                              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
                            >
                              {(u.full_name || u.username || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-600 text-slate-200 flex items-center gap-1">
                                {u.full_name || u.username || 'Unknown'}
                                {u.is_verified && <Icon name="CheckBadgeIcon" size={14} className="text-cyan-glow" />}
                                {u.is_admin && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,210,255,0.2)', color: '#00d2ff' }}>Admin</span>}
                              </div>
                              <div className="text-xs text-slate-600">@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm text-slate-400">{u.email}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-sm text-slate-400 tabular-nums">{u.followers_count?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-600 px-2 py-1 rounded-full"
                            style={u.is_active
                              ? { background: 'rgba(52,211,153,0.15)', color: '#34d399' }
                              : { background: 'rgba(248,113,113,0.15)', color: '#f87171' }
                            }
                          >
                            {u.is_active ? 'Active' : 'Banned'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {u.is_active ? (
                              <button
                                onClick={() => banUser(u.id)}
                                disabled={actionLoading === u.id || u.is_admin}
                                className="text-xs px-3 py-1.5 rounded-lg font-600 transition-all duration-200 disabled:opacity-40"
                                style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                              >
                                {actionLoading === u.id ? '...' : 'Ban'}
                              </button>
                            ) : (
                              <button
                                onClick={() => unbanUser(u.id)}
                                disabled={actionLoading === u.id}
                                className="text-xs px-3 py-1.5 rounded-lg font-600 transition-all duration-200 disabled:opacity-40"
                                style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                              >
                                {actionLoading === u.id ? '...' : 'Unban'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <div className="text-center py-12 text-slate-500">No users found</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {!loading && activeTab === 'posts' && (
          <div className="space-y-3">
            {posts.map(post => (
              <div
                key={post.id}
                className="rounded-2xl p-4 flex items-start gap-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-600 text-slate-300">
                      @{(post.user_profiles as any)?.username || 'unknown'}
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,210,255,0.1)', color: '#00d2ff' }}
                    >
                      {post.post_type}
                    </span>
                    <span className="text-xs text-slate-600 ml-auto">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-slate-600">❤️ {post.likes_count}</span>
                    <span className="text-xs text-slate-600">💬 {post.comments_count}</span>
                  </div>
                </div>
                <button
                  onClick={() => deletePost(post.id)}
                  disabled={actionLoading === post.id}
                  className="flex-shrink-0 p-2 rounded-xl transition-all duration-200 disabled:opacity-40"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}
                  title="Delete post"
                >
                  <Icon name="TrashIcon" size={16} className="text-red-400" />
                </button>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12 text-slate-500">No posts found</div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {!loading && activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.map(report => (
              <div
                key={report.id}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-xs font-700 px-2 py-1 rounded-full"
                        style={report.status === 'pending'
                          ? { background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }
                          : { background: 'rgba(52,211,153,0.15)', color: '#34d399' }
                        }
                      >
                        {report.status}
                      </span>
                      <span className="text-sm font-600 text-slate-300">{report.reason}</span>
                      <span className="text-xs text-slate-600 ml-auto">
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{report.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <span>Reporter: @{(report.reporter as any)?.username || 'unknown'}</span>
                      {report.reported_user && (
                        <span>Reported: @{(report.reported_user as any)?.username}</span>
                      )}
                    </div>
                  </div>
                  {report.status === 'pending' && (
                    <button
                      onClick={() => resolveReport(report.id)}
                      disabled={actionLoading === report.id}
                      className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl font-600 transition-all duration-200 disabled:opacity-40"
                      style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}
                    >
                      {actionLoading === report.id ? '...' : 'Resolve'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {reports.length === 0 && (
              <div className="text-center py-12 text-slate-500">No reports found</div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
