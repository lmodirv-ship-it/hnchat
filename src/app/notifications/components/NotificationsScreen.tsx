'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';


interface Notification {
  id: string;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  actor: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
  } | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const typeConfig: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  like: { icon: 'HeartIcon', color: '#f87171', bg: 'rgba(248,113,113,0.12)', label: 'liked your post' },
  comment: { icon: 'ChatBubbleOvalLeftIcon', color: '#00d2ff', bg: 'rgba(0,210,255,0.12)', label: 'commented on your post' },
  follow: { icon: 'UserPlusIcon', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'started following you' },
  mention: { icon: 'AtSymbolIcon', color: '#34d399', bg: 'rgba(52,211,153,0.12)', label: 'mentioned you' },
  message: { icon: 'ChatBubbleLeftRightIcon', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', label: 'sent you a message' },
  system: { icon: 'BellIcon', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', label: 'system notification' },
};

export default function NotificationsScreen() {
  const { user } = useAuth();
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select(`
          id, notification_type, message, is_read, created_at, post_id, comment_id,
          actor:actor_id(id, username, full_name, avatar_url, is_verified)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setNotifications(data as Notification[]);
    } catch (err) {
      console.error('loadNotifications error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AppLayout activePath="/notifications">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-slate-500 mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Icon name="CheckIcon" size={13} />
                Mark all read
              </button>
            )}
            <button onClick={loadNotifications}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Icon name="ArrowPathIcon" size={15} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 ${
                filter === f ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              style={filter === f ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.25)' } : {}}>
              {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)' }}>
              <Icon name="BellIcon" size={28} className="text-cyan-400" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">No notifications yet</p>
              <p className="text-slate-500 text-sm mt-1">
                {filter === 'unread' ? 'All caught up!' : 'Interact with posts to get notifications'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(notif => {
              const config = typeConfig[notif.notification_type] || typeConfig.system;
              const actor = notif.actor;
              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markRead(notif.id)}
                  className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    background: notif.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(0,210,255,0.04)',
                    border: `1px solid ${notif.is_read ? 'rgba(255,255,255,0.06)' : 'rgba(0,210,255,0.15)'}`,
                  }}>
                  {/* Actor avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-black"
                      style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                      {actor?.full_name?.[0] || actor?.username?.[0] || '?'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: config.bg, border: `1px solid ${config.color}30` }}>
                      <Icon name={config.icon as any} size={11} style={{ color: config.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 leading-snug">
                      <span className="font-semibold">{actor?.full_name || actor?.username || 'Someone'}</span>
                      {' '}
                      <span className="text-slate-400">{notif.message || config.label}</span>
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>

                  {/* Unread dot */}
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                      style={{ background: '#00d2ff', boxShadow: '0 0 6px rgba(0,210,255,0.6)' }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
