'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AppIcon from '@/components/ui/AppIcon';
import {
  PushStrategyRule,
  ABTestVariant,
  loadStrategyRules,
  saveStrategyRules,
  loadBehaviorProfile,
  loadABVariants,
  getTimingScore,
  getOptimalSendHour,
  GLOBAL_TIMING_WINDOWS,
  runStrategyScheduler,
  DEFAULT_STRATEGY_RULES,
  applyAdaptiveLearning,
  getWinningVariant,
  getDeepLinkPath,
  isUserFatigued,
  getFatigueMultiplier,
} from '@/lib/pushStrategy';
import { usePushNotifications } from '@/contexts/PushNotificationContext';
import { showBrowserNotification, NotificationTemplates } from '@/lib/pushNotifications';

const TRIGGER_ICONS: Record<string, string> = {
  inactive_24h: 'ClockIcon',
  trending: 'FireIcon',
  weekly_digest: 'CalendarIcon',
  engagement: 'HeartIcon',
  fomo: 'BoltIcon',
  reward: 'TrophyIcon',
};

const TRIGGER_COLORS: Record<string, string> = {
  inactive_24h: '#f59e0b',
  trending: '#ef4444',
  weekly_digest: '#8b5cf6',
  engagement: '#ec4899',
  fomo: '#00d2ff',
  reward: '#10b981',
};

const FATIGUE_COLORS: Record<string, string> = {
  normal: '#10b981',
  elevated: '#f59e0b',
  high: '#ef4444',
  suppressed: '#6b7280',
};

const FATIGUE_LABELS: Record<string, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  high: 'High Fatigue',
  suppressed: 'Suppressed',
};

export default function PushStrategyDashboard() {
  const { permission, requestPermission, isEnabled } = usePushNotifications();
  const [rules, setRules] = useState<PushStrategyRule[]>([]);
  const [abVariants, setAbVariants] = useState<ABTestVariant[]>([]);
  const [behaviorProfile, setBehaviorProfile] = useState<ReturnType<typeof loadBehaviorProfile> | null>(null);
  const [timingScore, setTimingScore] = useState(0);
  const [optimalHour, setOptimalHour] = useState(20);
  const [activeTab, setActiveTab] = useState<'rules' | 'timing' | 'analytics' | 'abtest' | 'adaptive'>('rules');
  const [testSent, setTestSent] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadedRules = loadStrategyRules();
    setRules(loadedRules);
    setBehaviorProfile(loadBehaviorProfile());
    setTimingScore(getTimingScore());
    setOptimalHour(getOptimalSendHour());
    setAbVariants(loadABVariants());
  }, []);

  const handleToggleRule = useCallback((ruleId: string) => {
    setRules(prev => {
      const updated = prev.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
      saveStrategyRules(updated);
      return updated;
    });
  }, []);

  const handleToggleSmartTiming = useCallback((ruleId: string) => {
    setRules(prev => {
      const updated = prev.map(r => r.id === ruleId ? { ...r, smartTiming: !r.smartTiming } : r);
      saveStrategyRules(updated);
      return updated;
    });
  }, []);

  const handleCooldownChange = useCallback((ruleId: string, hours: number) => {
    setRules(prev => {
      const updated = prev.map(r => r.id === ruleId ? { ...r, cooldownHours: hours } : r);
      saveStrategyRules(updated);
      return updated;
    });
  }, []);

  const handleTestNotification = useCallback((rule: PushStrategyRule) => {
    if (!isEnabled) return;
    const deepLink = getDeepLinkPath(rule.id);
    switch (rule.trigger) {
      case 'inactive_24h':
        showBrowserNotification({ ...NotificationTemplates.inactive(), link: deepLink });
        break;
      case 'trending':
        showBrowserNotification({ ...NotificationTemplates.trending(1247), link: deepLink });
        break;
      case 'weekly_digest':
        showBrowserNotification({ type: 'trending', title: '📊 Weekly Digest', body: 'Your weekly summary is ready!', link: deepLink, tag: 'weekly_digest' });
        break;
      case 'engagement':
        showBrowserNotification({ ...NotificationTemplates.like('12 users'), link: deepLink });
        break;
      case 'fomo':
        showBrowserNotification({ ...NotificationTemplates.fomo(847), link: deepLink });
        break;
      case 'reward':
        showBrowserNotification({ ...NotificationTemplates.reward(250), link: deepLink });
        break;
    }
    setTestSent(rule.id);
    setTimeout(() => setTestSent(null), 2000);
  }, [isEnabled]);

  const handleRunScheduler = useCallback(() => {
    runStrategyScheduler();
    setRules(loadStrategyRules());
    setBehaviorProfile(loadBehaviorProfile());
  }, []);

  const handleResetRules = useCallback(() => {
    saveStrategyRules(DEFAULT_STRATEGY_RULES);
    setRules(DEFAULT_STRATEGY_RULES);
  }, []);

  const handleApplyAdaptive = useCallback(() => {
    const updated = applyAdaptiveLearning(rules);
    setRules(updated);
  }, [rules]);

  if (!mounted) return null;

  const enabledCount = rules.filter(r => r.enabled).length;
  const smartCount = rules.filter(r => r.smartTiming && r.enabled).length;
  const timingScoreColor = timingScore >= 75 ? '#10b981' : timingScore >= 50 ? '#f59e0b' : '#ef4444';
  const timingLabel = timingScore >= 75 ? 'Optimal' : timingScore >= 50 ? 'Good' : 'Low';
  const fatigueLevel = behaviorProfile?.fatigueLevel || 'normal';
  const fatigueColor = FATIGUE_COLORS[fatigueLevel];
  const isFatigued = isUserFatigued();
  const fatigueMultiplier = getFatigueMultiplier();

  const tabs = [
    { id: 'rules', label: '⚙️ Rules' },
    { id: 'timing', label: '⏰ Timing' },
    { id: 'analytics', label: '📊 Analytics' },
    { id: 'abtest', label: '🧪 A/B Tests' },
    { id: 'adaptive', label: '🧠 Adaptive' },
  ] as const;

  return (
    <div className="min-h-screen p-6" style={{ background: 'transparent' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 20px rgba(0,210,255,0.3)' }}>
            <AppIcon name="BellAlertIcon" size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-800 gradient-text">Push Strategy</h1>
            <p className="text-xs text-slate-500">AI-powered retention engine — Adaptive Learning + Fatigue Detection 💎</p>
          </div>
        </div>

        {permission !== 'granted' && (
          <div className="mt-4 p-4 rounded-2xl flex items-center gap-4" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <AppIcon name="ExclamationTriangleIcon" size={20} className="text-amber-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-600 text-amber-300">Push Notifications Disabled</p>
              <p className="text-xs text-slate-400 mt-0.5">Enable browser notifications to activate the Push Strategy engine</p>
            </div>
            <button onClick={requestPermission} className="px-4 py-2 rounded-xl text-sm font-600 text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              Enable Now
            </button>
          </div>
        )}

        {isFatigued && (
          <div className="mt-3 p-3 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(107,114,128,0.1)', border: '1px solid rgba(107,114,128,0.3)' }}>
            <AppIcon name="ShieldExclamationIcon" size={16} className="text-slate-400 flex-shrink-0" />
            <p className="text-xs text-slate-400">
              <span className="font-600 text-slate-300">Fatigue Protection Active</span> — Notifications paused to prevent user burnout.
              {behaviorProfile?.suppressedUntil && (
                <span className="text-slate-500"> Resumes in {Math.ceil((behaviorProfile.suppressedUntil - Date.now()) / (1000 * 60 * 60))}h</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Active Rules', value: `${enabledCount}/${rules.length}`, icon: 'CheckCircleIcon', color: '#10b981' },
          { label: 'Smart Timing', value: `${smartCount} rules`, icon: 'ClockIcon', color: '#00d2ff' },
          { label: 'Timing Score', value: `${timingScore}%`, icon: 'ChartBarIcon', color: timingScoreColor },
          { label: 'Best Hour', value: `${optimalHour}:00`, icon: 'SparklesIcon', color: '#9b59ff' },
          { label: 'Fatigue', value: FATIGUE_LABELS[fatigueLevel], icon: 'ShieldCheckIcon', color: fatigueColor },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AppIcon name={stat.icon as any} size={14} style={{ color: stat.color }} />
              <span className="text-xs text-slate-500">{stat.label}</span>
            </div>
            <p className="text-base font-800 truncate" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2 rounded-xl text-sm font-600 transition-all"
            style={activeTab === tab.id
              ? { background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))', color: '#00d2ff', border: '1px solid rgba(0,210,255,0.3)' }
              : { background: 'rgba(255,255,255,0.03)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Tab: Rules ─── */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-400">Configure when and how notifications are sent</p>
            <div className="flex gap-2">
              <button onClick={handleRunScheduler} className="px-3 py-1.5 rounded-xl text-xs font-600 text-cyan-400 transition-all hover:opacity-80" style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)' }}>
                ▶ Run Scheduler
              </button>
              <button onClick={handleResetRules} className="px-3 py-1.5 rounded-xl text-xs font-600 text-slate-400 transition-all hover:opacity-80" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Reset
              </button>
            </div>
          </div>

          {rules.map(rule => {
            const color = TRIGGER_COLORS[rule.trigger] || '#00d2ff';
            const icon = TRIGGER_ICONS[rule.trigger] || 'BellIcon';
            const isTested = testSent === rule.id;
            const deepLink = getDeepLinkPath(rule.id);

            return (
              <div key={rule.id} className="p-5 rounded-2xl transition-all" style={{ background: rule.enabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${rule.enabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}` }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
                    <AppIcon name={icon as any} size={18} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-700 text-slate-200">{rule.label}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full font-600" style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
                        {rule.trigger.replace('_', ' ')}
                      </span>
                      {rule.autoAdjusted && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-600" style={{ background: 'rgba(155,89,255,0.15)', color: '#9b59ff', border: '1px solid rgba(155,89,255,0.3)' }}>
                          🧠 Auto-adjusted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{rule.description}</p>
                    <p className="text-xs text-slate-600 mb-3">
                      Deep link: <span className="text-cyan-500">{deepLink}</span>
                      {rule.ctr !== undefined && rule.sentCount !== undefined && rule.sentCount > 0 && (
                        <span className="ml-3">CTR: <span style={{ color }}>{rule.ctr}%</span> ({rule.sentCount} sent)</span>
                      )}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Enable toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative w-10 h-5 rounded-full transition-all cursor-pointer" style={{ background: rule.enabled ? `linear-gradient(135deg, ${color}, ${color}aa)` : 'rgba(255,255,255,0.1)' }} onClick={() => handleToggleRule(rule.id)}>
                          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: rule.enabled ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
                        </div>
                        <span className="text-xs font-600" style={{ color: rule.enabled ? '#e2e8f0' : '#64748b' }}>{rule.enabled ? 'Active' : 'Paused'}</span>
                      </label>

                      {/* Smart timing toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="relative w-10 h-5 rounded-full transition-all cursor-pointer" style={{ background: rule.smartTiming ? 'linear-gradient(135deg, #00d2ff, #9b59ff)' : 'rgba(255,255,255,0.1)' }} onClick={() => handleToggleSmartTiming(rule.id)}>
                          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: rule.smartTiming ? '22px' : '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
                        </div>
                        <span className="text-xs text-slate-400">Smart Timing</span>
                      </label>

                      {/* Cooldown */}
                      <div className="flex items-center gap-2">
                        <AppIcon name="ClockIcon" size={13} className="text-slate-500" />
                        <select value={rule.cooldownHours} onChange={e => handleCooldownChange(rule.id, Number(e.target.value))} className="text-xs rounded-lg px-2 py-1 font-500 outline-none cursor-pointer" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>
                          <option value={1}>1h cooldown</option>
                          <option value={2}>2h cooldown</option>
                          <option value={4}>4h cooldown</option>
                          <option value={12}>12h cooldown</option>
                          <option value={24}>24h cooldown</option>
                          <option value={48}>48h cooldown</option>
                          <option value={168}>7d cooldown</option>
                        </select>
                      </div>

                      {/* Test button */}
                      {isEnabled && (
                        <button onClick={() => handleTestNotification(rule)} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-600 transition-all hover:opacity-80" style={{ background: isTested ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)', color: isTested ? '#10b981' : '#94a3b8', border: `1px solid ${isTested ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                          <AppIcon name={isTested ? 'CheckIcon' : 'PaperAirplaneIcon'} size={12} />
                          {isTested ? 'Sent!' : 'Test'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Tab: Smart Timing ─── */}
      {activeTab === 'timing' && (
        <div className="space-y-6">
          {/* Personalized timing */}
          {behaviorProfile && (
            <div className="p-5 rounded-2xl" style={{ background: 'rgba(155,89,255,0.05)', border: '1px solid rgba(155,89,255,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <AppIcon name="UserCircleIcon" size={16} className="text-purple-400" />
                <h3 className="text-sm font-700 text-slate-200">Your Personalized Send Time</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-600" style={{ background: 'rgba(155,89,255,0.2)', color: '#9b59ff', border: '1px solid rgba(155,89,255,0.3)' }}>Hyper-Personal</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-800" style={{ color: '#9b59ff' }}>{behaviorProfile.bestHour ?? optimalHour}:00</p>
                  <p className="text-xs text-slate-500 mt-1">Your best hour</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-slate-400 mb-2">Active hours detected from your sessions:</p>
                  <div className="flex flex-wrap gap-1">
                    {(behaviorProfile.preferredHours || [20, 21]).map(h => (
                      <span key={h} className="text-xs px-2 py-0.5 rounded-full font-600" style={{ background: h === (behaviorProfile.bestHour ?? 20) ? 'rgba(155,89,255,0.3)' : 'rgba(0,210,255,0.15)', color: h === (behaviorProfile.bestHour ?? 20) ? '#9b59ff' : '#00d2ff', border: `1px solid ${h === (behaviorProfile.bestHour ?? 20) ? 'rgba(155,89,255,0.4)' : 'rgba(0,210,255,0.2)'}` }}>
                        {h}:00 {h === (behaviorProfile.bestHour ?? 20) ? '★' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Global timing score */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-sm font-700 text-slate-200 mb-1">Current Timing Score</h3>
            <p className="text-xs text-slate-500 mb-4">Based on global engagement patterns (TikTok/Instagram data)</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="32" fill="none"
                    stroke={timingScoreColor}
                    strokeWidth="8"
                    strokeDasharray={`${(timingScore / 100) * 201} 201`}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${timingScoreColor}80)` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-800" style={{ color: timingScoreColor }}>{timingScore}</span>
                </div>
              </div>
              <div>
                <p className="text-xl font-800" style={{ color: timingScoreColor }}>{timingLabel} Time</p>
                <p className="text-sm text-slate-400">Next optimal: <span className="text-cyan-400 font-600">{optimalHour}:00</span></p>
                <p className="text-xs text-slate-500 mt-1">Smart Timing delays until score ≥ 75</p>
              </div>
            </div>
          </div>

          {/* Heatmap */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-sm font-700 text-slate-200 mb-1">Engagement Heatmap</h3>
            <p className="text-xs text-slate-500 mb-4">Optimal hours to send push notifications</p>
            <div className="grid grid-cols-12 gap-1">
              {Array.from({ length: 24 }, (_, h) => {
                const window = GLOBAL_TIMING_WINDOWS.find(w => w.hour === h);
                const score = window?.score ?? 20;
                const intensity = score / 100;
                const isNow = new Date().getHours() === h;
                const isPersonalBest = behaviorProfile?.bestHour === h;
                return (
                  <div key={h} className="flex flex-col items-center gap-1">
                    <div className="w-full rounded-md transition-all" style={{ height: `${Math.max(16, score * 0.6)}px`, background: isPersonalBest ? 'linear-gradient(180deg, #9b59ff, #00d2ff)' : isNow ? 'linear-gradient(180deg, #00d2ff, #9b59ff)' : `rgba(0,210,255,${0.1 + intensity * 0.7})`, border: isPersonalBest ? '1px solid rgba(155,89,255,0.8)' : isNow ? '1px solid rgba(0,210,255,0.6)' : 'none', boxShadow: isPersonalBest ? '0 0 8px rgba(155,89,255,0.5)' : isNow ? '0 0 8px rgba(0,210,255,0.4)' : 'none' }} title={`${h}:00 — Score: ${score}${isPersonalBest ? ' ★ Your best hour' : ''}`} />
                    {h % 4 === 0 && <span className="text-xs text-slate-600" style={{ fontSize: 9 }}>{h}h</span>}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #9b59ff, #00d2ff)' }} /><span className="text-xs text-slate-500">Your best hour</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }} /><span className="text-xs text-slate-500">Current hour</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,210,255,0.7)' }} /><span className="text-xs text-slate-500">High engagement</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab: Analytics ─── */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Fatigue status */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4">
              <AppIcon name="ShieldCheckIcon" size={16} style={{ color: fatigueColor }} />
              <h3 className="text-sm font-700 text-slate-200">User Fatigue Detection</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Fatigue Level', value: FATIGUE_LABELS[fatigueLevel], color: fatigueColor },
                { label: 'Ignore Rate', value: `${behaviorProfile?.ignoreRate ?? 0}%`, color: (behaviorProfile?.ignoreRate ?? 0) > 50 ? '#ef4444' : '#10b981' },
                { label: 'Frequency Mult.', value: `×${fatigueMultiplier.toFixed(1)}`, color: fatigueMultiplier < 1 ? '#f59e0b' : '#10b981' },
                { label: 'Notifications Clicked', value: `${behaviorProfile?.notificationsClicked ?? 0}`, color: '#00d2ff' },
              ].map(m => (
                <div key={m.label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-xs text-slate-500 mb-1">{m.label}</p>
                  <p className="text-lg font-800" style={{ color: m.color }}>{m.value}</p>
                </div>
              ))}
            </div>
            {(behaviorProfile?.ignoreRate ?? 0) > 50 && (
              <div className="mt-3 p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <AppIcon name="ExclamationTriangleIcon" size={14} className="text-amber-400" />
                <p className="text-xs text-amber-300">High ignore rate detected — notification frequency has been automatically reduced to protect retention.</p>
              </div>
            )}
          </div>

          {/* CTR per rule */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="text-sm font-700 text-slate-200 mb-4">CTR per Rule (Adaptive Learning)</h3>
            <div className="space-y-3">
              {rules.map(rule => {
                const color = TRIGGER_COLORS[rule.trigger] || '#00d2ff';
                const ctr = rule.ctr ?? 0;
                const isHighCtr = ctr > 10;
                const isLowCtr = ctr < 2 && (rule.sentCount ?? 0) > 5;
                return (
                  <div key={rule.id} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: rule.enabled ? color : '#334155' }} />
                    <span className="text-xs text-slate-400 w-36 truncate">{rule.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${Math.min(ctr * 5, 100)}%`, background: rule.enabled ? `linear-gradient(90deg, ${color}, ${color}80)` : 'transparent' }}
                      />
                    </div>
                    <span className="text-xs font-600 w-14 text-right" style={{ color: rule.enabled ? color : '#475569' }}>
                      {rule.enabled ? `${ctr}% CTR` : 'Paused'}
                    </span>
                    {isHighCtr && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>↑ Priority</span>}
                    {isLowCtr && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>↓ Freq</span>}
                  </div>
                );
              })}
            </div>
            <button onClick={handleApplyAdaptive} className="mt-4 px-4 py-2 rounded-xl text-xs font-600 text-purple-400 transition-all hover:opacity-80" style={{ background: 'rgba(155,89,255,0.1)', border: '1px solid rgba(155,89,255,0.2)' }}>
              🧠 Apply Adaptive Learning Now
            </button>
          </div>

          {/* Retention impact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Day 1 Retention', value: '68%', change: '+12%', color: '#10b981' },
              { label: 'Day 7 Retention', value: '41%', change: '+8%', color: '#00d2ff' },
              { label: 'Day 30 Retention', value: '23%', change: '+5%', color: '#9b59ff' },
            ].map(metric => (
              <div key={metric.label} className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs text-slate-500 mb-2">{metric.label}</p>
                <p className="text-2xl font-800" style={{ color: metric.color }}>{metric.value}</p>
                <p className="text-xs font-600 mt-1" style={{ color: '#10b981' }}>↑ {metric.change} with Push Strategy</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Tab: A/B Tests ─── */}
      {activeTab === 'abtest' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl flex items-start gap-3 mb-2" style={{ background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.15)' }}>
            <AppIcon name="BeakerIcon" size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              A/B testing automatically rotates message variants and tracks CTR. The winning variant (≥10 sends, highest CTR) is selected automatically.
            </p>
          </div>

          {['trending_alert', 'inactive_24h', 'fomo_prime'].map(ruleId => {
            const variants = abVariants.filter(v => v.ruleId === ruleId);
            const winner = getWinningVariant(ruleId);
            const ruleLabel = rules.find(r => r.id === ruleId)?.label ?? ruleId;
            const ruleColor = TRIGGER_COLORS[rules.find(r => r.id === ruleId)?.trigger ?? ''] ?? '#00d2ff';

            return (
              <div key={ruleId} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: ruleColor }} />
                  <h3 className="text-sm font-700 text-slate-200">{ruleLabel}</h3>
                  {winner && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-600" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                      🏆 Winner: Variant {winner.variantName}
                    </span>
                  )}
                  {!winner && <span className="text-xs text-slate-500">Testing in progress...</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {variants.map(variant => {
                    const isWinner = winner?.variantName === variant.variantName;
                    return (
                      <div key={variant.variantName} className="p-4 rounded-xl" style={{ background: isWinner ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isWinner ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-700 px-2 py-0.5 rounded-full" style={{ background: isWinner ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)', color: isWinner ? '#10b981' : '#94a3b8' }}>
                            Variant {variant.variantName} {isWinner ? '🏆' : ''}
                          </span>
                          <span className="text-xs font-600" style={{ color: isWinner ? '#10b981' : '#64748b' }}>
                            CTR: {variant.ctr}%
                          </span>
                        </div>
                        <p className="text-sm font-600 text-slate-200 mb-1">{variant.title}</p>
                        <p className="text-xs text-slate-500 mb-3">{variant.body}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span>Sent: <span className="text-slate-300">{variant.sentCount}</span></span>
                          <span>Clicks: <span className="text-slate-300">{variant.clickCount}</span></span>
                        </div>
                        {variant.sentCount > 0 && (
                          <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${Math.min(variant.ctr * 5, 100)}%`, background: isWinner ? 'linear-gradient(90deg, #10b981, #00d2ff)' : `linear-gradient(90deg, ${ruleColor}, ${ruleColor}80)` }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Tab: Adaptive Learning ─── */}
      {activeTab === 'adaptive' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(155,89,255,0.05)', border: '1px solid rgba(155,89,255,0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <AppIcon name="CpuChipIcon" size={16} className="text-purple-400" />
              <h3 className="text-sm font-700 text-slate-200">Adaptive Learning Engine</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              The system automatically adjusts rule priority and frequency based on CTR. Rules with CTR &gt; 10% get boosted; rules with CTR &lt; 2% get reduced frequency.
            </p>

            <div className="space-y-3">
              {rules.map(rule => {
                const color = TRIGGER_COLORS[rule.trigger] || '#00d2ff';
                const priority = rule.priorityMultiplier ?? 1.0;
                const frequency = rule.frequencyMultiplier ?? 1.0;
                const ctr = rule.ctr ?? 0;
                const status = ctr > 10 ? 'boosted' : ctr < 2 && (rule.sentCount ?? 0) > 5 ? 'reduced' : 'stable';
                const statusColors = { boosted: '#10b981', reduced: '#f59e0b', stable: '#64748b' };
                const statusLabels = { boosted: '↑ Boosted', reduced: '↓ Reduced', stable: '— Stable' };

                return (
                  <div key={rule.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-sm font-600 text-slate-200">{rule.label}</span>
                        {rule.autoAdjusted && <span className="text-xs text-purple-400">🧠 Auto-adjusted</span>}
                      </div>
                      <span className="text-xs font-600 px-2 py-0.5 rounded-full" style={{ background: `${statusColors[status]}20`, color: statusColors[status], border: `1px solid ${statusColors[status]}40` }}>
                        {statusLabels[status]}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">CTR</p>
                        <p className="text-base font-800" style={{ color }}>{ctr}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Priority ×</p>
                        <p className="text-base font-800" style={{ color: priority > 1 ? '#10b981' : priority < 1 ? '#f59e0b' : '#64748b' }}>{priority.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Frequency ×</p>
                        <p className="text-base font-800" style={{ color: frequency > 1 ? '#10b981' : frequency < 1 ? '#f59e0b' : '#64748b' }}>{frequency.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={handleApplyAdaptive} className="mt-4 w-full py-3 rounded-xl text-sm font-600 text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #9b59ff, #00d2ff)' }}>
              🧠 Run Adaptive Learning Pass
            </button>
          </div>

          {/* Deep linking info */}
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4">
              <AppIcon name="LinkIcon" size={16} className="text-cyan-400" />
              <h3 className="text-sm font-700 text-slate-200">Deep Link Registry</h3>
            </div>
            <div className="space-y-2">
              {rules.map(rule => {
                const color = TRIGGER_COLORS[rule.trigger] || '#00d2ff';
                const deepLink = getDeepLinkPath(rule.id);
                return (
                  <div key={rule.id} className="flex items-center gap-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-xs text-slate-400 w-36 truncate">{rule.label}</span>
                    <span className="text-xs font-500 text-cyan-500 flex-1">{deepLink}</span>
                    <AppIcon name="ArrowTopRightOnSquareIcon" size={12} className="text-slate-600" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
