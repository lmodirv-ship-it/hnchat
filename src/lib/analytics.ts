'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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
        send_page_view: false, // manual page view tracking
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

export function trackEvent(eventName: string, eventParams: Record<string, any> = {}) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}

// ─── Funnel Tracking ──────────────────────────────────────────────────────────
export function trackFunnelStep(step: 'visit' | 'signup' | 'watch' | 'like' | 'share', params: Record<string, any> = {}) {
  trackEvent(`funnel_${step}`, { funnel_step: step, ...params });
}

export function trackViralShare(platform: string, contentId: string, contentType: string = 'video') {
  trackEvent('viral_share', { platform, content_id: contentId, content_type: contentType });
}

// ─── Auth Tracking ────────────────────────────────────────────────────────────
export function trackSignup(method: 'email' | 'google' | 'invite') {
  trackEvent('sign_up', {
    method,
    event_category: 'auth',
    event_label: `signup_${method}`,
  });
  // Also track as conversion
  trackEvent('conversion', {
    send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    event_category: 'acquisition',
    value: 1,
    currency: 'USD',
  });
}

export function trackLogin(method: 'email' | 'google') {
  trackEvent('login', {
    method,
    event_category: 'auth',
    event_label: `login_${method}`,
  });
}

export function trackLogout() {
  trackEvent('logout', { event_category: 'auth' });
}

// ─── Video Tracking ───────────────────────────────────────────────────────────

/**
 * Track video view start
 */
export function trackVideoView(videoId: string, videoIndex: number = 0) {
  trackEvent('video_view', {
    video_id: videoId,
    video_index: videoIndex,
    event_category: 'video',
    event_label: `view_${videoId}`,
  });
}

/**
 * Track video watch with retention data
 * @param videoId - unique video identifier
 * @param durationSeconds - total video duration
 * @param watchedSeconds - how many seconds the user actually watched
 * @param completed - whether the user watched to the end
 */
export function trackVideoWatch(videoId: string, durationSeconds: number, completed: boolean, watchedSeconds?: number) {
  const watchPercent = durationSeconds > 0 && watchedSeconds != null
    ? Math.round((watchedSeconds / durationSeconds) * 100)
    : completed ? 100 : 0;

  trackEvent('video_watch', {
    video_id: videoId,
    duration: durationSeconds,
    watched_seconds: watchedSeconds ?? (completed ? durationSeconds : 0),
    watch_percent: watchPercent,
    completed,
    event_category: 'video',
    event_label: completed ? 'completed' : `partial_${watchPercent}pct`,
    metric1: watchPercent,
  });

  // Track retention milestones
  if (watchPercent >= 25 && watchPercent < 50) {
    trackEvent('video_retention_25', { video_id: videoId, event_category: 'retention' });
  } else if (watchPercent >= 50 && watchPercent < 75) {
    trackEvent('video_retention_50', { video_id: videoId, event_category: 'retention' });
  } else if (watchPercent >= 75 && watchPercent < 100) {
    trackEvent('video_retention_75', { video_id: videoId, event_category: 'retention' });
  } else if (watchPercent >= 100 || completed) {
    trackEvent('video_retention_100', { video_id: videoId, event_category: 'retention' });
  }
}

/**
 * Hook to automatically track video retention while a video is playing.
 * Call inside the video player component.
 */
export function useVideoRetentionTracker(videoId: string, durationSeconds: number, isPlaying: boolean) {
  const startTimeRef = useRef<number | null>(null);
  const watchedSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!videoId || !durationSeconds) return;
    // Reset on new video
    startTimeRef.current = null;
    watchedSecondsRef.current = 0;
    lastTickRef.current = null;
    reportedRef.current = false;
    // Track view start
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

  // Report on unmount or video change
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

// ─── Content Tracking ─────────────────────────────────────────────────────────
export function trackContentLike(contentId: string, contentType: string) {
  trackEvent('content_like', {
    content_id: contentId,
    content_type: contentType,
    event_category: 'engagement',
  });
}

export function trackContentComment(contentId: string, contentType: string) {
  trackEvent('content_comment', {
    content_id: contentId,
    content_type: contentType,
    event_category: 'engagement',
  });
}

export function trackSearch(query: string, resultsCount: number) {
  trackEvent('search', {
    search_term: query,
    results_count: resultsCount,
    event_category: 'discovery',
  });
}

// ─── Retention Tracking ───────────────────────────────────────────────────────

/**
 * Track user session depth (how many screens/actions in one session)
 */
export function trackSessionDepth(depth: number) {
  trackEvent('session_depth', {
    depth,
    event_category: 'retention',
    metric2: depth,
  });
}

/**
 * Track user returning after inactivity
 */
export function trackUserReturn(daysSinceLastVisit: number) {
  trackEvent('user_return', {
    days_since_last_visit: daysSinceLastVisit,
    event_category: 'retention',
    event_label: daysSinceLastVisit <= 1 ? 'daily' : daysSinceLastVisit <= 7 ? 'weekly' : 'churned',
  });
}

/**
 * Track onboarding completion rate
 */
export function trackOnboardingComplete(completedSteps: number, totalSteps: number) {
  const completionRate = Math.round((completedSteps / totalSteps) * 100);
  trackEvent('onboarding_complete', {
    completed_steps: completedSteps,
    total_steps: totalSteps,
    completion_rate: completionRate,
    event_category: 'retention',
  });
}

// ─── Error Tracking ───────────────────────────────────────────────────────────
export function trackError(errorName: string, errorMessage: string, componentStack?: string) {
  trackEvent('app_error', {
    error_name: errorName,
    error_message: errorMessage.substring(0, 150),
    component_stack: componentStack?.substring(0, 150),
    event_category: 'error',
  });
}

// ─── Engagement Tracking ──────────────────────────────────────────────────────
export function trackOnboardingStep(step: number, stepName: string) {
  trackEvent('onboarding_step', {
    step_number: step,
    step_name: stepName,
    event_category: 'onboarding',
  });
}

export function trackFeatureUsed(featureName: string) {
  trackEvent('feature_used', {
    feature_name: featureName,
    event_category: 'engagement',
  });
}
