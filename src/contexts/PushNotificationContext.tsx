'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  requestNotificationPermission,
  getPermissionStatus,
  showBrowserNotification,
  NotificationTemplates,
  triggerFomoNotification,
  isNotificationSupported,
} from '@/lib/pushNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface PushNotificationContextValue {
  permission: NotificationPermission | 'unsupported';
  isEnabled: boolean;
  requestPermission: () => Promise<void>;
  sendTestNotification: () => void;
}

const PushNotificationContext = createContext<PushNotificationContextValue>({
  permission: 'default',
  isEnabled: false,
  requestPermission: async () => {},
  sendTestNotification: () => {},
});

export const usePushNotifications = () => useContext(PushNotificationContext);

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const fomoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize permission state on mount
  useEffect(() => {
    setPermission(getPermissionStatus());
  }, []);

  const requestPermission = useCallback(async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  }, []);

  const sendTestNotification = useCallback(() => {
    showBrowserNotification(NotificationTemplates.fomo(847));
  }, []);

  // Subscribe to Supabase realtime notifications for the current user
  useEffect(() => {
    if (!user || permission !== 'granted') return;

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase
      .channel(`push-notifications-${user.id}`)
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

          switch (data.type) {
            case 'like':
              showBrowserNotification(NotificationTemplates.like(data.actor_name || 'Someone'));
              break;
            case 'comment':
              showBrowserNotification(NotificationTemplates.comment(data.actor_name || 'Someone', data.content));
              break;
            case 'follow':
              showBrowserNotification(NotificationTemplates.follow(data.actor_name || 'Someone'));
              break;
            case 'trending':
              showBrowserNotification(NotificationTemplates.trending(data.view_count));
              break;
            case 'reward':
              showBrowserNotification(NotificationTemplates.reward(data.points || 50));
              break;
            default:
              showBrowserNotification({
                type: 'fomo',
                title: data.title || 'hnChat',
                body: data.message || 'You have a new notification',
                link: data.link,
              });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user, permission]);

  // FOMO periodic notifications (every 30 min when user is active)
  useEffect(() => {
    if (permission !== 'granted') return;

    // Show FOMO notification after 5 minutes of activity
    const initialTimer = setTimeout(() => {
      triggerFomoNotification();
    }, 5 * 60 * 1000);

    // Then every 30 minutes
    fomoTimerRef.current = setInterval(() => {
      triggerFomoNotification();
    }, 30 * 60 * 1000);

    return () => {
      clearTimeout(initialTimer);
      if (fomoTimerRef.current) clearInterval(fomoTimerRef.current);
    };
  }, [permission]);

  // Auto-prompt for permission after 10 seconds if not yet asked
  useEffect(() => {
    if (!isNotificationSupported()) return;
    if (permission !== 'default') return;

    const timer = setTimeout(async () => {
      const result = await requestNotificationPermission();
      setPermission(result);
    }, 10000);

    return () => clearTimeout(timer);
  }, [permission]);

  return (
    <PushNotificationContext.Provider
      value={{
        permission,
        isEnabled: permission === 'granted',
        requestPermission,
        sendTestNotification,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
}
