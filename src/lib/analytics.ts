declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
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
export function trackVideoView(videoId: string, videoIndex: number = 0) {
  trackEvent('video_view', {
    video_id: videoId,
    video_index: videoIndex,
    event_category: 'video',
    event_label: `view_${videoId}`,
  });
}

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
export function trackSessionDepth(depth: number) {
  trackEvent('session_depth', {
    depth,
    event_category: 'retention',
    metric2: depth,
  });
}

export function trackUserReturn(daysSinceLastVisit: number) {
  trackEvent('user_return', {
    days_since_last_visit: daysSinceLastVisit,
    event_category: 'retention',
    event_label: daysSinceLastVisit <= 1 ? 'daily' : daysSinceLastVisit <= 7 ? 'weekly' : 'churned',
  });
}

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

// ─── Marketplace Tracking ─────────────────────────────────────────────────────
export function trackProductView(productId: string, productName: string, price?: number) {
  trackEvent('view_item', {
    item_id: productId,
    item_name: productName,
    price,
    event_category: 'ecommerce',
  });
}

export function trackAddToCart(productId: string, productName: string, price?: number) {
  trackEvent('add_to_cart', {
    item_id: productId,
    item_name: productName,
    price,
    event_category: 'ecommerce',
  });
}

export function trackPurchase(orderId: string, value: number, currency: string = 'USD') {
  trackEvent('purchase', {
    transaction_id: orderId,
    value,
    currency,
    event_category: 'ecommerce',
  });
}

// ─── Social Tracking ──────────────────────────────────────────────────────────
export function trackProfileView(profileId: string, isOwnProfile: boolean = false) {
  trackEvent('profile_view', {
    profile_id: profileId,
    is_own_profile: isOwnProfile,
    event_category: 'social',
  });
}

export function trackFollow(targetUserId: string) {
  trackEvent('follow_user', {
    target_user_id: targetUserId,
    event_category: 'social',
  });
}

export function trackMessageSent(conversationType: 'direct' | 'group') {
  trackEvent('message_sent', {
    conversation_type: conversationType,
    event_category: 'messaging',
  });
}

// ─── Notification Tracking ────────────────────────────────────────────────────
export function trackNotificationClick(notificationType: string) {
  trackEvent('notification_click', {
    notification_type: notificationType,
    event_category: 'notifications',
  });
}

export function trackPushPermission(granted: boolean) {
  trackEvent('push_permission', {
    granted,
    event_category: 'notifications',
  });
}

// ─── AI Feature Tracking ──────────────────────────────────────────────────────
export function trackAIQuery(model: string, queryLength: number) {
  trackEvent('ai_query', {
    model,
    query_length: queryLength,
    event_category: 'ai',
  });
}

// ─── Invite / Referral Tracking ───────────────────────────────────────────────
export function trackInviteSent(method: 'link' | 'email' | 'social') {
  trackEvent('invite_sent', {
    method,
    event_category: 'referral',
  });
}

export function trackInviteAccepted(inviteCode: string) {
  trackEvent('invite_accepted', {
    invite_code: inviteCode,
    event_category: 'referral',
  });
}

// ─── Content Creation Tracking ────────────────────────────────────────────────
export function trackPostCreated(contentType: 'text' | 'image' | 'video') {
  trackEvent('post_created', {
    content_type: contentType,
    event_category: 'creation',
  });
}

export function trackLiveStreamStarted(roomId: string) {
  trackEvent('live_stream_started', {
    room_id: roomId,
    event_category: 'live',
  });
}
