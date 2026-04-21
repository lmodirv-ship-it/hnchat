'use client';

export type PushNotificationType = 'like' | 'comment' | 'follow' | 'trending' | 'fomo' | 'reward' | 'inactive';

export interface PushNotificationPayload {
  type: PushNotificationType;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  link?: string;
  tag?: string;
}

const NOTIFICATION_ICONS: Record<PushNotificationType, string> = {
  like: '❤️',
  comment: '💬',
  follow: '➕',
  trending: '🔥',
  fomo: '⚡',
  reward: '💎',
  inactive: '👋',
};

// Check if browser supports notifications
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get current permission status
export function getPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// Request notification permission from user
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch {
    return 'denied';
  }
}

// Show a browser push notification
export function showBrowserNotification(payload: PushNotificationPayload): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') return null;

  const icon = payload.icon || '/assets/images/app_logo.png';
  const emoji = NOTIFICATION_ICONS[payload.type] || '🔔';

  try {
    const notification = new Notification(`${emoji} ${payload.title}`, {
      body: payload.body,
      icon,
      badge: payload.badge || icon,
      tag: payload.tag || payload.type,
      requireInteraction: payload.type === 'fomo' || payload.type === 'trending',
    });

    notification.onclick = () => {
      window.focus();
      if (payload.link) {
        window.location.href = payload.link;
      }
      notification.close();
    };

    // Auto-close after 6 seconds for non-critical notifications
    if (payload.type !== 'fomo' && payload.type !== 'trending') {
      setTimeout(() => notification.close(), 6000);
    }

    return notification;
  } catch {
    return null;
  }
}

// Pre-built notification templates
export const NotificationTemplates = {
  like: (actorName: string): PushNotificationPayload => ({
    type: 'like',
    title: 'New Like',
    body: `${actorName} liked your post`,
    link: '/home-feed',
    tag: 'like',
  }),

  comment: (actorName: string, preview?: string): PushNotificationPayload => ({
    type: 'comment',
    title: 'New Comment',
    body: preview ? `${actorName}: "${preview}"` : `${actorName} commented on your post`,
    link: '/home-feed',
    tag: 'comment',
  }),

  follow: (actorName: string): PushNotificationPayload => ({
    type: 'follow',
    title: 'New Follower',
    body: `${actorName} started following you`,
    link: '/profile',
    tag: 'follow',
  }),

  trending: (viewCount?: number): PushNotificationPayload => ({
    type: 'trending',
    title: 'فيديو كيطير! 🔥',
    body: viewCount
      ? `Your video is trending — ${viewCount.toLocaleString()} views in the last hour!`
      : 'محتوى جديد ليك — 3 creators you follow just posted!',
    link: '/video-live-feed',
    tag: 'trending',
  }),

  fomo: (watcherCount?: number): PushNotificationPayload => ({
    type: 'fomo',
    title: 'FOMO Alert ⚡',
    body: watcherCount
      ? `${watcherCount.toLocaleString()} users are watching a trending video right now — don't miss it!`: '🔥 Something big is happening on hnChat right now!',link: '/short-videos',tag: 'fomo',
  }),

  inactive: (): PushNotificationPayload => ({
    type: 'inactive',title: 'رجع، عندك محتوى جديد 💎',body: 'You have new content waiting for you on hnChat!',link: '/home-feed',tag: 'inactive',
  }),

  reward: (points: number): PushNotificationPayload => ({
    type: 'reward',title: 'Reward Earned! 💎',
    body: `You earned ${points} points! Keep going!`,
    link: '/invite',tag: 'reward',
  }),
};

// FOMO trigger: show notification if post has many likes
export function checkTrendingTrigger(likeCount: number, viewCount?: number): void {
  if (likeCount >= 50) {
    showBrowserNotification(NotificationTemplates.trending(viewCount));
  }
}

// Inactive user trigger (call after checking last activity)
export function checkInactiveTrigger(lastActiveMs: number): void {
  const INACTIVE_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours
  if (Date.now() - lastActiveMs > INACTIVE_THRESHOLD) {
    showBrowserNotification(NotificationTemplates.inactive());
  }
}

// Random FOMO notification (for engagement)
export function triggerFomoNotification(): void {
  const watcherCount = Math.floor(Math.random() * 500) + 300;
  showBrowserNotification(NotificationTemplates.fomo(watcherCount));
}
