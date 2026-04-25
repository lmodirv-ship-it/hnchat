'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent, trackVideoView, trackVideoWatch } from '@/lib/analytics';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function useGoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!measurementId) return;

    if (!window.dataLayer) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head.appendChild(script);

      window.dataLayer = [];
      window.gtag = function (...args: any[]) {
        window.dataLayer.push(args);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        send_page_view: false,
        custom_map: {
          dimension1: 'user_type',
          dimension2: 'signup_method',
          metric1: 'video_watch_percent',
          metric2: 'session_depth',
        },
      });
    }

    const url = pathname + (searchParams.toString() ? `?${searchParams}` : '');
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams]);
}

export function useVideoRetentionTracker(videoId: string, durationSeconds: number, isPlaying: boolean) {
  const startTimeRef = useRef<number | null>(null);
  const watchedSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!videoId || !durationSeconds) return;
    startTimeRef.current = null;
    watchedSecondsRef.current = 0;
    lastTickRef.current = null;
    reportedRef.current = false;
    trackVideoView(videoId);
  }, [videoId, durationSeconds]);

  useEffect(() => {
    if (!isPlaying) {
      lastTickRef.current = null;
      return;
    }
    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now();
    }
    lastTickRef.current = Date.now();

    const interval = setInterval(() => {
      if (lastTickRef.current !== null) {
        watchedSecondsRef.current += 1;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (!reportedRef.current && watchedSecondsRef.current > 0) {
        reportedRef.current = true;
        const completed = watchedSecondsRef.current >= durationSeconds * 0.9;
        trackVideoWatch(videoId, durationSeconds, completed, watchedSecondsRef.current);
      }
    };
  }, [videoId, durationSeconds]);
}

export function usePageEngagement(pageName: string) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    trackEvent('page_engage_start', { page_name: pageName, event_category: 'engagement' });

    return () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 2) {
        trackEvent('page_engage_end', {
          page_name: pageName,
          time_spent_seconds: timeSpent,
          event_category: 'engagement',
        });
      }
    };
  }, [pageName]);
}
