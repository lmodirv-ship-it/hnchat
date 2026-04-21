'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { usePushNotifications } from '@/contexts/PushNotificationContext';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'like' | 'follow' | 'comment' | 'trending' | 'reward' | 'fomo';
  actor: string;
  actorAvatar: string;
  actorAvatarAlt: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1', type: 'like', actor: 'Sara Benali',
    actorAvatar: 'https://i.pravatar.cc/36?img=5', actorAvatarAlt: 'Sara Benali avatar',
    message: 'liked your post', time: '2m ago', read: false, link: '/home-feed',
  },
  {
    id: 'n2', type: 'follow', actor: 'Youssef Amrani',
    actorAvatar: 'https://i.pravatar.cc/36?img=12', actorAvatarAlt: 'Youssef Amrani avatar',
    message: 'started following you', time: '15m ago', read: false, link: '/profile',
  },
  {
    id: 'n3', type: 'trending', actor: 'hnChat',
    actorAvatar: '', actorAvatarAlt: '',
    message: '🔥 فيديو كيدوز بزاف دابا — 2.4K views in the last hour!', time: '1h ago', read: false, link: '/video-live-feed',
  },
  {
    id: 'n4', type: 'comment', actor: 'Fatima Zahra',
    actorAvatar: 'https://i.pravatar.cc/36?img=9', actorAvatarAlt: 'Fatima Zahra avatar',
    message: 'commented on your post: "Amazing content! 🔥"', time: '2h ago', read: true, link: '/home-feed',
  },
  {
    id: 'n5', type: 'reward', actor: 'hnChat',
    actorAvatar: '', actorAvatarAlt: '',
    message: '🎁 You earned 50 points for inviting a friend!', time: '3h ago', read: true, link: '/invite',
  },
  {
    id: 'n6', type: 'like', actor: 'Karim Idrissi',
    actorAvatar: 'https://i.pravatar.cc/36?img=15', actorAvatarAlt: 'Karim Idrissi avatar',
    message: 'and 12 others liked your video', time: '5h ago', read: true, link: '/video-live-feed',
  },
  {
    id: 'n7', type: 'trending', actor: 'hnChat',
    actorAvatar: '', actorAvatarAlt: '',
    message: '💎 محتوى جديد ليك — 3 creators you follow just posted!', time: '6h ago', read: true, link: '/home-feed',
  },
  {
    id: 'n8', type: 'fomo', actor: 'hnChat',
    actorAvatar: '', actorAvatarAlt: '',
    message: '⚡ FOMO Alert: 847 users are watching a trending video right now — don\'t miss it!', time: '8h ago', read: true, link: '/short-videos',
  },
];

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  like: { icon: 'HeartIcon', color: '#f43f5e' },
  follow: { icon: 'UserPlusIcon', color: '#00d2ff' },
  comment: { icon: 'ChatBubbleLeftIcon', color: '#a78bfa' },
  trending: { icon: 'FireIcon', color: '#f59e0b' },
  reward: { icon: 'GiftIcon', color: '#e879f9' },
  fomo: { icon: 'BoltIcon', color: '#00d2ff' },
};

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const panelRef = useRef<HTMLDivElement>(null);
  const { permission, requestPermission, isEnabled } = usePushNotifications();
  const { user } = useAuth();
  const supabase = createClient();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  // Subscribe to realtime notifications and prepend new ones
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notif-panel-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const data = payload.new as any;
          if (!data) return;
          const newNotif: Notification = {
            id: data.id || String(Date.now()),
            type: data.type || 'trending',
            actor: data.actor_name || 'hnChat',
            actorAvatar: data.actor_avatar || '',
            actorAvatarAlt: data.actor_name ? `${data.actor_name} avatar` : '',
            message: data.message || data.content || '',
            time: 'just now',
            read: false,
            link: data.link || '/home-feed',
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 rounded-2xl overflow-hidden z-50 shadow-2xl"
      style={{
        background: 'rgba(12,12,20,0.98)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(110,231,247,0.12)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,210,255,0.05)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/06">
        <div className="flex items-center gap-2">
          <Icon name="BellIcon" size={18} className="text-cyan-glow" />
          <h3 className="text-sm font-700 text-slate-200">Notifications</h3>
          {unreadCount > 0 && (
            <span
              className="text-xs font-700 px-1.5 py-0.5 rounded-full text-ice-black tabular-nums"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-cyan-glow hover:underline transition-all duration-150"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/08">
            <Icon name="XMarkIcon" size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Push notification status bar */}
      {permission !== 'granted' && permission !== 'unsupported' && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 border-b border-white/04"
          style={{ background: 'rgba(0,210,255,0.04)' }}
        >
          <Icon name="BellSlashIcon" size={14} className="text-amber-400 flex-shrink-0" />
          <p className="text-xs text-slate-400 flex-1">
            {permission === 'denied' ? 'Push notifications blocked in browser settings' : 'Push notifications are off'}
          </p>
          {permission === 'default' && (
            <button
              onClick={requestPermission}
              className="text-xs font-600 px-2 py-1 rounded-lg flex-shrink-0"
              style={{ background: 'rgba(0,210,255,0.12)', color: '#6ee7f7' }}
            >
              Enable
            </button>
          )}
        </div>
      )}
      {isEnabled && (
        <div
          className="flex items-center gap-2 px-4 py-2 border-b border-white/04"
          style={{ background: 'rgba(0,255,150,0.03)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
          <p className="text-xs text-emerald-400/80">Push notifications active</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-white/04">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-600 transition-all duration-150 capitalize"
            style={filter === f
              ? { background: 'rgba(0,210,255,0.12)', color: '#6ee7f7' }
              : { color: '#64748b' }
            }
          >
            {f} {f === 'unread' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="overflow-y-auto max-h-80" style={{ scrollbarWidth: 'none' }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Icon name="BellSlashIcon" size={28} className="text-slate-700 mb-2" />
            <p className="text-sm text-slate-500">No notifications</p>
          </div>
        ) : (
          filtered.map((n) => {
            const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.like;
            return (
              <Link
                key={n.id}
                href={n.link || '#'}
                onClick={() => { markRead(n.id); onClose(); }}
                className="flex items-start gap-3 px-4 py-3 hover:bg-white/04 transition-all duration-150 relative"
                style={!n.read ? { background: 'rgba(0,210,255,0.03)' } : {}}
              >
                {/* Unread dot */}
                {!n.read && (
                  <div
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: '#00d2ff', boxShadow: '0 0 6px rgba(0,210,255,0.6)' }}
                  />
                )}

                {/* Avatar or icon */}
                <div className="relative flex-shrink-0">
                  {n.actorAvatar ? (
                    <AppImage
                      src={n.actorAvatar}
                      alt={n.actorAvatarAlt}
                      width={36}
                      height={36}
                      className="rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${typeInfo.color}18`, border: `1px solid ${typeInfo.color}25` }}
                    >
                      <Icon name={typeInfo.icon as any} size={16} style={{ color: typeInfo.color }} />
                    </div>
                  )}
                  {n.actorAvatar && (
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: typeInfo.color, boxShadow: `0 0 6px ${typeInfo.color}60` }}
                    >
                      <Icon name={typeInfo.icon as any} size={9} className="text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-600 text-slate-200">{n.actor}</span>{' '}
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">{n.time}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/06">
        <Link
          href="/home-feed"
          onClick={onClose}
          className="flex items-center justify-center gap-1.5 text-xs text-cyan-glow hover:underline transition-all duration-150"
        >
          View all activity
          <Icon name="ArrowRightIcon" size={12} />
        </Link>
      </div>
    </div>
  );
}
