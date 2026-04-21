'use client';

import React, { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import {
  loadStrategyRules,
  saveStrategyRules,
  recordUserActivity,
  runStrategyScheduler,
  evaluateTrending,
} from '@/lib/pushStrategy';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/contexts/PushNotificationContext';

interface PushStrategyContextValue {
  triggerTrendingCheck: (likeCount: number, viewCount?: number) => void;
}

const PushStrategyContext = createContext<PushStrategyContextValue>({
  triggerTrendingCheck: () => {},
});

export const usePushStrategy = () => useContext(PushStrategyContext);

export function PushStrategyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isEnabled } = usePushNotifications();
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Record user activity on mount and periodically
  useEffect(() => {
    if (!user) return;
    recordUserActivity();
  }, [user]);

  // Run strategy scheduler every 15 minutes
  useEffect(() => {
    if (!user || !isEnabled) return;

    // Run once on mount
    runStrategyScheduler();

    // Then every 15 minutes
    schedulerRef.current = setInterval(() => {
      runStrategyScheduler();
    }, 15 * 60 * 1000);

    return () => {
      if (schedulerRef.current) clearInterval(schedulerRef.current);
    };
  }, [user, isEnabled]);

  const triggerTrendingCheck = useCallback((likeCount: number, viewCount?: number) => {
    if (!isEnabled) return;
    const rules = loadStrategyRules();
    const updated = evaluateTrending(rules, likeCount, viewCount);
    saveStrategyRules(updated);
  }, [isEnabled]);

  return (
    <PushStrategyContext.Provider value={{ triggerTrendingCheck }}>
      {children}
    </PushStrategyContext.Provider>
  );
}
