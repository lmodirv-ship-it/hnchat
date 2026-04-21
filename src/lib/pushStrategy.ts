'use client';

import { showBrowserNotification, NotificationTemplates } from './pushNotifications';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StrategyTrigger = 'inactive_24h' | 'trending' | 'weekly_digest' | 'engagement' | 'fomo' | 'reward';

export interface PushStrategyRule {
  id: string;
  trigger: StrategyTrigger;
  label: string;
  description: string;
  enabled: boolean;
  smartTiming: boolean;
  cooldownHours: number;
  lastFiredAt?: number;
  // Adaptive learning fields
  ctr?: number; // 0-100
  sentCount?: number;
  clickCount?: number;
  priorityMultiplier?: number; // 0.5 - 2.0
  frequencyMultiplier?: number;
  autoAdjusted?: boolean;
}

export interface SmartTimingWindow {
  hour: number;
  score: number;
}

export interface UserBehaviorProfile {
  lastActiveAt: number;
  preferredHours: number[];
  totalSessions: number;
  avgSessionDuration: number;
  notificationsClicked: number;
  notificationsDismissed: number;
  // Fatigue detection
  ignoreRate?: number; // 0-100
  fatigueLevel?: 'normal' | 'elevated' | 'high' | 'suppressed';
  suppressedUntil?: number; // timestamp
  // Personalized timing
  bestHour?: number;
  timezone?: string;
}

// ─── A/B Test Types ───────────────────────────────────────────────────────────

export interface ABTestVariant {
  ruleId: string;
  variantName: 'A' | 'B';
  title: string;
  body: string;
  emoji: string;
  sentCount: number;
  clickCount: number;
  ctr: number;
}

// ─── Default Strategy Rules ───────────────────────────────────────────────────

export const DEFAULT_STRATEGY_RULES: PushStrategyRule[] = [
  {
    id: 'inactive_24h',
    trigger: 'inactive_24h',
    label: 'Re-engage Inactive Users',
    description: 'Send a personalized notification after 24h of inactivity',
    enabled: true,
    smartTiming: true,
    cooldownHours: 24,
    ctr: 0,
    sentCount: 0,
    clickCount: 0,
    priorityMultiplier: 1.0,
    frequencyMultiplier: 1.0,
  },
  {
    id: 'trending_alert',
    trigger: 'trending',
    label: 'Trending Content Alert',
    description: 'Notify when content is going viral (50+ likes/hour)',
    enabled: true,
    smartTiming: false,
    cooldownHours: 2,
    ctr: 0,
    sentCount: 0,
    clickCount: 0,
    priorityMultiplier: 1.0,
    frequencyMultiplier: 1.0,
  },
  {
    id: 'weekly_digest',
    trigger: 'weekly_digest',
    label: 'Weekly Digest',
    description: 'Sunday evening summary of top content & activity',
    enabled: true,
    smartTiming: true,
    cooldownHours: 168,
    ctr: 0,
    sentCount: 0,
    clickCount: 0,
    priorityMultiplier: 1.0,
    frequencyMultiplier: 1.0,
  },
  {
    id: 'engagement_spike',
    trigger: 'engagement',
    label: 'Engagement Spike',
    description: 'Alert when your post gets 10+ interactions in 1 hour',
    enabled: true,
    smartTiming: false,
    cooldownHours: 1,
    ctr: 0,
    sentCount: 0,
    clickCount: 0,
    priorityMultiplier: 1.0,
    frequencyMultiplier: 1.0,
  },
  {
    id: 'fomo_prime',
    trigger: 'fomo',
    label: 'FOMO Prime Time',
    description: 'FOMO notification during peak hours (8pm-11pm)',
    enabled: true,
    smartTiming: true,
    cooldownHours: 4,
    ctr: 0,
    sentCount: 0,
    clickCount: 0,
    priorityMultiplier: 1.0,
    frequencyMultiplier: 1.0,
  },
  {
    id: 'reward_milestone',
    trigger: 'reward',
    label: 'Reward Milestones',
    description: 'Celebrate user achievements and point milestones',
    enabled: true,
    smartTiming: false,
    cooldownHours: 12,
    ctr: 0,
    sentCount: 0,
    clickCount: 0,
    priorityMultiplier: 1.0,
    frequencyMultiplier: 1.0,
  },
];

// ─── Smart Timing Engine ──────────────────────────────────────────────────────

const GLOBAL_TIMING_WINDOWS: SmartTimingWindow[] = [
  { hour: 7, score: 65 },
  { hour: 8, score: 72 },
  { hour: 9, score: 68 },
  { hour: 12, score: 75 },
  { hour: 13, score: 70 },
  { hour: 17, score: 78 },
  { hour: 18, score: 85 },
  { hour: 19, score: 90 },
  { hour: 20, score: 95 },
  { hour: 21, score: 92 },
  { hour: 22, score: 80 },
];

export { GLOBAL_TIMING_WINDOWS };

export function getOptimalSendHour(userProfile?: UserBehaviorProfile): number {
  const now = new Date();
  const currentHour = now.getHours();

  // Use personalized best hour if available
  if (userProfile?.bestHour !== undefined) {
    return userProfile.bestHour;
  }

  if (userProfile?.preferredHours?.length) {
    const nextPreferred = userProfile.preferredHours.find(h => h > currentHour);
    if (nextPreferred !== undefined) return nextPreferred;
    return userProfile.preferredHours[0];
  }

  const nextWindow = GLOBAL_TIMING_WINDOWS.find(w => w.hour > currentHour && w.score >= 75);
  return nextWindow?.hour ?? 20;
}

export function isOptimalSendTime(userProfile?: UserBehaviorProfile): boolean {
  const currentHour = new Date().getHours();

  // Use personalized best hour if available
  if (userProfile?.bestHour !== undefined) {
    return Math.abs(currentHour - userProfile.bestHour) <= 1;
  }

  if (userProfile?.preferredHours?.length) {
    return userProfile.preferredHours.includes(currentHour);
  }

  const window = GLOBAL_TIMING_WINDOWS.find(w => w.hour === currentHour);
  return window ? window.score >= 75 : false;
}

export function getTimingScore(): number {
  const currentHour = new Date().getHours();
  const window = GLOBAL_TIMING_WINDOWS.find(w => w.hour === currentHour);
  return window?.score ?? 30;
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hn_push_strategy';
const BEHAVIOR_KEY = 'hn_user_behavior';
const AB_VARIANTS_KEY = 'hn_ab_variants';

// ─── Strategy Rules Storage ───────────────────────────────────────────────────

export function loadStrategyRules(): PushStrategyRule[] {
  if (typeof window === 'undefined') return DEFAULT_STRATEGY_RULES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STRATEGY_RULES;
    const parsed: PushStrategyRule[] = JSON.parse(stored);
    return DEFAULT_STRATEGY_RULES.map(def => {
      const saved = parsed.find(p => p.id === def.id);
      return saved ? { ...def, ...saved } : def;
    });
  } catch {
    return DEFAULT_STRATEGY_RULES;
  }
}

export function saveStrategyRules(rules: PushStrategyRule[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
}

// ─── Behavior Profile Storage ─────────────────────────────────────────────────

export function loadBehaviorProfile(): UserBehaviorProfile {
  if (typeof window === 'undefined') {
    return {
      lastActiveAt: Date.now(),
      preferredHours: [20, 21],
      totalSessions: 0,
      avgSessionDuration: 0,
      notificationsClicked: 0,
      notificationsDismissed: 0,
      ignoreRate: 0,
      fatigueLevel: 'normal',
      bestHour: 20,
    };
  }
  try {
    const stored = localStorage.getItem(BEHAVIOR_KEY);
    if (!stored) {
      return {
        lastActiveAt: Date.now(),
        preferredHours: [20, 21],
        totalSessions: 1,
        avgSessionDuration: 5,
        notificationsClicked: 0,
        notificationsDismissed: 0,
        ignoreRate: 0,
        fatigueLevel: 'normal',
        bestHour: 20,
      };
    }
    return JSON.parse(stored);
  } catch {
    return {
      lastActiveAt: Date.now(),
      preferredHours: [20, 21],
      totalSessions: 1,
      avgSessionDuration: 5,
      notificationsClicked: 0,
      notificationsDismissed: 0,
      ignoreRate: 0,
      fatigueLevel: 'normal',
      bestHour: 20,
    };
  }
}

export function updateBehaviorProfile(updates: Partial<UserBehaviorProfile>): void {
  if (typeof window === 'undefined') return;
  const current = loadBehaviorProfile();
  const updated = { ...current, ...updates };
  localStorage.setItem(BEHAVIOR_KEY, JSON.stringify(updated));
}

export function recordUserActivity(): void {
  const profile = loadBehaviorProfile();
  const currentHour = new Date().getHours();
  const preferredHours = [...new Set([...profile.preferredHours, currentHour])].slice(-5);

  // Compute best hour from preferred hours (most frequent)
  const hourFrequency: Record<number, number> = {};
  preferredHours.forEach(h => { hourFrequency[h] = (hourFrequency[h] || 0) + 1; });
  const bestHour = preferredHours.reduce((best, h) =>
    (hourFrequency[h] || 0) > (hourFrequency[best] || 0) ? h : best,
    preferredHours[0] ?? 20
  );

  updateBehaviorProfile({
    lastActiveAt: Date.now(),
    totalSessions: profile.totalSessions + 1,
    preferredHours,
    bestHour,
  });
}

// ─── Notification Interaction Tracking ───────────────────────────────────────

export function recordNotificationClick(ruleId: string): void {
  const profile = loadBehaviorProfile();
  let rules = loadStrategyRules();

  // Update behavior profile
  updateBehaviorProfile({
    notificationsClicked: profile.notificationsClicked + 1,
  });

  // Update rule CTR
  const updatedRules = rules.map(r => {
    if (r.id === ruleId) {
      const newClickCount = (r.clickCount || 0) + 1;
      const newSentCount = r.sentCount || 1;
      const newCtr = Math.round((newClickCount / newSentCount) * 100);
      return { ...r, clickCount: newClickCount, ctr: newCtr };
    }
    return r;
  });
  saveStrategyRules(updatedRules);

  // Adaptive learning: if CTR > 10%, increase priority
  applyAdaptiveLearning(updatedRules);

  // Update A/B variant click
  recordABVariantClick(ruleId);
}

export function recordNotificationDismiss(ruleId: string): void {
  const profile = loadBehaviorProfile();
  const totalSent = profile.notificationsClicked + profile.notificationsDismissed + 1;
  const totalIgnored = profile.notificationsDismissed + 1;
  const ignoreRate = Math.round((totalIgnored / totalSent) * 100);

  let fatigueLevel: UserBehaviorProfile['fatigueLevel'] = 'normal';
  let suppressedUntil: number | undefined;

  if (ignoreRate >= 80) {
    fatigueLevel = 'suppressed';
    suppressedUntil = Date.now() + 48 * 60 * 60 * 1000;
  } else if (ignoreRate >= 70) {
    fatigueLevel = 'high';
    suppressedUntil = Date.now() + 24 * 60 * 60 * 1000;
  } else if (ignoreRate >= 50) {
    fatigueLevel = 'elevated';
  }

  updateBehaviorProfile({
    notificationsDismissed: profile.notificationsDismissed + 1,
    ignoreRate,
    fatigueLevel,
    suppressedUntil,
  });

  // Adaptive learning: if CTR < 2%, reduce frequency
  let rules = loadStrategyRules();
  const updatedRules = rules.map(r => {
    if (r.id === ruleId) {
      const newSentCount = (r.sentCount || 0) + 1;
      const ctr = r.ctr || 0;
      if (ctr < 2 && newSentCount > 5) {
        return { ...r, sentCount: newSentCount, frequencyMultiplier: Math.max(0.5, (r.frequencyMultiplier || 1) - 0.1), autoAdjusted: true };
      }
      return { ...r, sentCount: newSentCount };
    }
    return r;
  });
  saveStrategyRules(updatedRules);
}

// ─── Adaptive Learning Engine ─────────────────────────────────────────────────

export function applyAdaptiveLearning(rules: PushStrategyRule[]): PushStrategyRule[] {
  const adjusted = rules.map(rule => {
    const ctr = rule.ctr || 0;
    const sentCount = rule.sentCount || 0;

    if (sentCount < 5) return rule; // Not enough data

    let priorityMultiplier = rule.priorityMultiplier || 1.0;
    let frequencyMultiplier = rule.frequencyMultiplier || 1.0;
    let autoAdjusted = false;

    if (ctr > 10) {
      // High CTR: increase priority
      priorityMultiplier = Math.min(2.0, priorityMultiplier + 0.1);
      frequencyMultiplier = Math.min(1.5, frequencyMultiplier + 0.05);
      autoAdjusted = true;
    } else if (ctr < 2) {
      // Low CTR: reduce frequency
      priorityMultiplier = Math.max(0.5, priorityMultiplier - 0.1);
      frequencyMultiplier = Math.max(0.5, frequencyMultiplier - 0.1);
      autoAdjusted = true;
    }

    return { ...rule, priorityMultiplier, frequencyMultiplier, autoAdjusted };
  });

  saveStrategyRules(adjusted);
  return adjusted;
}

// ─── Fatigue Detection ────────────────────────────────────────────────────────

export function isUserFatigued(): boolean {
  const profile = loadBehaviorProfile();
  if (profile.fatigueLevel === 'suppressed') {
    if (profile.suppressedUntil && Date.now() < profile.suppressedUntil) {
      return true;
    }
    // Suppression expired — reset
    updateBehaviorProfile({ fatigueLevel: 'normal', suppressedUntil: undefined });
    return false;
  }
  return false;
}

export function getFatigueMultiplier(): number {
  const profile = loadBehaviorProfile();
  switch (profile.fatigueLevel) {
    case 'suppressed': return 0;
    case 'high': return 0.3;
    case 'elevated': return 0.6;
    default: return 1.0;
  }
}

// ─── A/B Testing Engine ───────────────────────────────────────────────────────

const DEFAULT_AB_VARIANTS: ABTestVariant[] = [
  { ruleId: 'trending_alert', variantName: 'A', title: 'هذا الفيديو طالع 🔥', body: 'المحتوى هذا كيتشار بسرعة — شوفه دابا!', emoji: '🔥', sentCount: 0, clickCount: 0, ctr: 0 },
  { ruleId: 'trending_alert', variantName: 'B', title: 'غادي يعجبك هذا الفيديو 💎', body: 'اكتشف المحتوى الأكثر مشاهدة الآن', emoji: '💎', sentCount: 0, clickCount: 0, ctr: 0 },
  { ruleId: 'inactive_24h', variantName: 'A', title: 'واش مزال هنا؟ 👋', body: 'عندك محتوى جديد ينتظرك — ارجع دابا!', emoji: '👋', sentCount: 0, clickCount: 0, ctr: 0 },
  { ruleId: 'inactive_24h', variantName: 'B', title: 'اشتقنا ليك 💙', body: 'المحتوى الجديد جاهز — شوف شنو فاتك', emoji: '💙', sentCount: 0, clickCount: 0, ctr: 0 },
  { ruleId: 'fomo_prime', variantName: 'A', title: 'الكل كيشوف هذا دابا 👀', body: 'لا تفوتك اللحظة — انضم للنقاش', emoji: '👀', sentCount: 0, clickCount: 0, ctr: 0 },
  { ruleId: 'fomo_prime', variantName: 'B', title: 'الوقت المثالي للمشاركة ⚡', body: 'الآن هو أفضل وقت للتفاعل مع المجتمع', emoji: '⚡', sentCount: 0, clickCount: 0, ctr: 0 },
];

export function loadABVariants(): ABTestVariant[] {
  if (typeof window === 'undefined') return DEFAULT_AB_VARIANTS;
  try {
    const stored = localStorage.getItem(AB_VARIANTS_KEY);
    if (!stored) return DEFAULT_AB_VARIANTS;
    return JSON.parse(stored);
  } catch {
    return DEFAULT_AB_VARIANTS;
  }
}

export function saveABVariants(variants: ABTestVariant[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AB_VARIANTS_KEY, JSON.stringify(variants));
}

export function getWinningVariant(ruleId: string): ABTestVariant | null {
  const variants = loadABVariants().filter(v => v.ruleId === ruleId);
  if (!variants.length) return null;
  // Need at least 10 sends per variant to declare winner
  const qualified = variants.filter(v => v.sentCount >= 10);
  if (qualified.length < 2) return null;
  return qualified.reduce((best, v) => v.ctr > best.ctr ? v : best, qualified[0]);
}

export function selectABVariant(ruleId: string): ABTestVariant | null {
  const variants = loadABVariants().filter(v => v.ruleId === ruleId);
  if (!variants.length) return null;

  const winner = getWinningVariant(ruleId);
  if (winner) return winner;

  // Round-robin: pick variant with fewer sends
  const sorted = [...variants].sort((a, b) => a.sentCount - b.sentCount);
  const selected = sorted[0];

  // Record send
  const updated = loadABVariants().map(v =>
    v.ruleId === ruleId && v.variantName === selected.variantName
      ? { ...v, sentCount: v.sentCount + 1 }
      : v
  );
  saveABVariants(updated);

  return selected;
}

export function recordABVariantClick(ruleId: string): void {
  const variants = loadABVariants();
  // Find the last sent variant (lowest sentCount difference)
  const ruleVariants = variants.filter(v => v.ruleId === ruleId);
  if (!ruleVariants.length) return;

  // Click goes to the variant that was most recently sent (highest sentCount)
  const lastSent = ruleVariants.reduce((latest, v) => v.sentCount > latest.sentCount ? v : latest, ruleVariants[0]);

  const updated = variants.map(v => {
    if (v.ruleId === ruleId && v.variantName === lastSent.variantName) {
      const newClickCount = v.clickCount + 1;
      const newCtr = v.sentCount > 0 ? Math.round((newClickCount / v.sentCount) * 100) : 0;
      return { ...v, clickCount: newClickCount, ctr: newCtr };
    }
    return v;
  });
  saveABVariants(updated);
}

// ─── Deep Linking ─────────────────────────────────────────────────────────────

export interface DeepLinkTarget {
  type: 'video' | 'comment' | 'message' | 'profile' | 'page';
  id?: string;
  path: string;
}

export const DEEP_LINK_TARGETS: Record<string, DeepLinkTarget> = {
  trending_alert: { type: 'video', path: '/short-videos' },
  inactive_24h: { type: 'page', path: '/home-feed' },
  weekly_digest: { type: 'page', path: '/growth-analytics' },
  engagement_spike: { type: 'page', path: '/home-feed' },
  fomo_prime: { type: 'video', path: '/video-live-feed' },
  reward_milestone: { type: 'profile', path: '/profile' },
};

export function getDeepLinkPath(ruleId: string, contentId?: string): string {
  const target = DEEP_LINK_TARGETS[ruleId];
  if (!target) return '/home-feed';
  if (contentId && target.type === 'video') return `${target.path}?id=${contentId}`;
  if (contentId && target.type === 'comment') return `${target.path}?comment=${contentId}`;
  if (contentId && target.type === 'message') return `/chats-messaging?thread=${contentId}`;
  return target.path;
}

// ─── Trigger Evaluators ───────────────────────────────────────────────────────

function canFire(rule: PushStrategyRule): boolean {
  if (!rule.enabled) return false;
  if (isUserFatigued()) return false;

  const fatigueMultiplier = getFatigueMultiplier();
  let frequencyMultiplier = rule.frequencyMultiplier || 1.0;
  const effectiveCooldown = rule.cooldownHours / (frequencyMultiplier * fatigueMultiplier || 1);

  if (!rule.lastFiredAt) return true;
  const hoursSinceLast = (Date.now() - rule.lastFiredAt) / (1000 * 60 * 60);
  return hoursSinceLast >= effectiveCooldown;
}

function fireWithABTest(ruleId: string, fallbackTitle: string, fallbackBody: string, link: string, tag: string): void {
  const variant = selectABVariant(ruleId);
  if (variant) {
    showBrowserNotification({
      type: 'trending',
      title: variant.title,
      body: variant.body,
      link: getDeepLinkPath(ruleId),
      tag,
    });
  } else {
    showBrowserNotification({
      type: 'trending',
      title: fallbackTitle,
      body: fallbackBody,
      link,
      tag,
    });
  }
}

export function evaluateInactiveUser(rules: PushStrategyRule[]): PushStrategyRule[] {
  const rule = rules.find(r => r.id === 'inactive_24h');
  if (!rule || !canFire(rule)) return rules;

  const profile = loadBehaviorProfile();
  const hoursSinceActive = (Date.now() - profile.lastActiveAt) / (1000 * 60 * 60);

  if (hoursSinceActive >= 24) {
    if (!rule.smartTiming || isOptimalSendTime(profile)) {
      fireWithABTest('inactive_24h', NotificationTemplates.inactive().title, NotificationTemplates.inactive().body, getDeepLinkPath('inactive_24h'), 'inactive_24h');
      const newSentCount = (rule.sentCount || 0) + 1;
      return rules.map(r => r.id === rule.id ? { ...r, lastFiredAt: Date.now(), sentCount: newSentCount } : r);
    }
  }
  return rules;
}

export function evaluateTrending(rules: PushStrategyRule[], likeCount: number, viewCount?: number): PushStrategyRule[] {
  const rule = rules.find(r => r.id === 'trending_alert');
  if (!rule || !canFire(rule)) return rules;

  if (likeCount >= 50) {
    fireWithABTest('trending_alert', `🔥 Trending Now`, `${viewCount?.toLocaleString() ?? likeCount} people are watching this`, getDeepLinkPath('trending_alert'), 'trending_alert');
    const newSentCount = (rule.sentCount || 0) + 1;
    return rules.map(r => r.id === rule.id ? { ...r, lastFiredAt: Date.now(), sentCount: newSentCount } : r);
  }
  return rules;
}

export function evaluateWeeklyDigest(rules: PushStrategyRule[]): PushStrategyRule[] {
  const rule = rules.find(r => r.id === 'weekly_digest');
  if (!rule || !canFire(rule)) return rules;

  const now = new Date();
  const isSunday = now.getDay() === 0;
  const isEvening = now.getHours() >= 18 && now.getHours() <= 21;

  if (isSunday && isEvening) {
    showBrowserNotification({
      type: 'trending',
      title: '📊 Weekly Digest',
      body: 'Your weekly summary is ready — top videos, trending creators & more!',
      link: getDeepLinkPath('weekly_digest'),
      tag: 'weekly_digest',
    });
    const newSentCount = (rule.sentCount || 0) + 1;
    return rules.map(r => r.id === rule.id ? { ...r, lastFiredAt: Date.now(), sentCount: newSentCount } : r);
  }
  return rules;
}

export function evaluateFomoPrimeTime(rules: PushStrategyRule[]): PushStrategyRule[] {
  const rule = rules.find(r => r.id === 'fomo_prime');
  if (!rule || !canFire(rule)) return rules;

  const profile = loadBehaviorProfile();
  const hour = new Date().getHours();
  const isPrimeTime = hour >= 20 && hour <= 23;

  if (isPrimeTime && (!rule.smartTiming || isOptimalSendTime(profile))) {
    const watchers = Math.floor(Math.random() * 800) + 400;
    fireWithABTest('fomo_prime', `👀 ${watchers.toLocaleString()} watching now`, 'Join the conversation before it ends!', getDeepLinkPath('fomo_prime'), 'fomo_prime');
    const newSentCount = (rule.sentCount || 0) + 1;
    return rules.map(r => r.id === rule.id ? { ...r, lastFiredAt: Date.now(), sentCount: newSentCount } : r);
  }
  return rules;
}

// ─── Master Scheduler ─────────────────────────────────────────────────────────

export function runStrategyScheduler(): void {
  if (isUserFatigued()) return; // Skip entirely if user is suppressed

  let rules = loadStrategyRules();
  rules = evaluateInactiveUser(rules);
  rules = evaluateWeeklyDigest(rules);
  rules = evaluateFomoPrimeTime(rules);
  rules = applyAdaptiveLearning(rules);
  saveStrategyRules(rules);
}