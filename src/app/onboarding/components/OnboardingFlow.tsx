'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import AppLogo from '@/components/ui/AppLogo';

const INTERESTS = [
  { id: 'music', label: 'Music', emoji: '🎵' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'fashion', label: 'Fashion', emoji: '👗' },
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'art', label: 'Art', emoji: '🎨' },
  { id: 'comedy', label: 'Comedy', emoji: '😂' },
  { id: 'sports', label: 'Sports', emoji: '⚽' },
  { id: 'beauty', label: 'Beauty', emoji: '💄' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'business', label: 'Business', emoji: '📈' },
  { id: 'movies', label: 'Movies', emoji: '🎬' },
  { id: 'crypto', label: 'Crypto', emoji: '₿' },
  { id: 'pets', label: 'Pets', emoji: '🐾' },
];

const SUGGESTED_USERS = [
  { id: '1', name: 'Sara Nova', username: 'sara.nova', category: 'Creator', followers: '124K', emoji: '🌟' },
  { id: '2', name: 'Alex Mercer', username: 'alexm', category: 'Tech', followers: '89K', emoji: '💻' },
  { id: '3', name: 'Luna Beats', username: 'lunabeats', category: 'Music', followers: '210K', emoji: '🎵' },
  { id: '4', name: 'Chef Marco', username: 'chefmarco', category: 'Food', followers: '67K', emoji: '🍕' },
  { id: '5', name: 'FitWithJay', username: 'fitwithjay', category: 'Fitness', followers: '155K', emoji: '💪' },
  { id: '6', name: 'TravelWithMia', username: 'travelwithmia', category: 'Travel', followers: '98K', emoji: '✈️' },
];

const STEPS = ['interests', 'follow', 'ready'] as const;
type Step = typeof STEPS[number];

export default function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('interests');
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [completing, setCompleting] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleFollow = (id: string) => {
    setFollowing(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleComplete = async () => {
    setCompleting(true);
    // Mark onboarding done in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('hn_onboarding_done', '1');
    }
    setTimeout(() => {
      router.push('/short-videos');
    }, 800);
  };

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-ice-black flex flex-col items-center justify-start overflow-x-hidden">
      {/* Background orbs */}
      <div className="fixed top-[-80px] left-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,210,255,0.07) 0%, transparent 70%)' }} />
      <div className="fixed bottom-[-60px] right-[-60px] w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(155,89,255,0.07) 0%, transparent 70%)' }} />

      {/* Header */}
      <div className="w-full max-w-lg px-5 pt-8 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 12px rgba(0,210,255,0.4)' }}>
              <AppLogo size={20} />
            </div>
            <span className="font-bold text-base gradient-text">hnChat</span>
          </div>
          <button onClick={handleComplete} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Skip
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-1 rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00d2ff, #9b59ff)' }} />
        </div>
        <p className="text-xs text-slate-600 text-right">{stepIndex + 1} / {STEPS.length}</p>
      </div>

      {/* Step: Interests */}
      {step === 'interests' && (
        <div className="w-full max-w-lg px-5 pb-32 animate-fade-in">
          <h1 className="text-2xl font-800 text-white mb-1">What do you love? 🔥</h1>
          <p className="text-slate-400 text-sm mb-6">Pick at least 3 interests to personalize your feed</p>

          <div className="grid grid-cols-2 gap-3">
            {INTERESTS.map(interest => {
              const selected = selectedInterests.has(interest.id);
              return (
                <button key={interest.id} onClick={() => toggleInterest(interest.id)}
                  className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 active:scale-95 text-left"
                  style={{
                    background: selected ? 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.15))' : 'rgba(255,255,255,0.04)',
                    border: selected ? '1px solid rgba(0,210,255,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: selected ? '0 0 16px rgba(0,210,255,0.1)' : 'none',
                  }}>
                  <span className="text-2xl">{interest.emoji}</span>
                  <span className={`text-sm font-600 ${selected ? 'text-cyan-glow' : 'text-slate-300'}`}>{interest.label}</span>
                  {selected && (
                    <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                      <Icon name="CheckIcon" size={12} className="text-black" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step: Follow */}
      {step === 'follow' && (
        <div className="w-full max-w-lg px-5 pb-32 animate-fade-in">
          <h1 className="text-2xl font-800 text-white mb-1">Follow creators 💎</h1>
          <p className="text-slate-400 text-sm mb-6">Follow at least 2 to get a personalized feed instantly</p>

          <div className="space-y-3">
            {SUGGESTED_USERS.map(u => {
              const isFollowing = following.has(u.id);
              return (
                <div key={u.id} className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))', border: '1px solid rgba(0,210,255,0.2)' }}>
                    {u.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-700 text-white truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">@{u.username} · {u.category}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#00d2ff' }}>{u.followers} followers</p>
                  </div>
                  <button onClick={() => toggleFollow(u.id)}
                    className="px-4 py-2 rounded-xl text-xs font-700 transition-all duration-200 active:scale-95 flex-shrink-0"
                    style={isFollowing
                      ? { background: 'rgba(255,255,255,0.08)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)' }
                      : { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                    {isFollowing ? '✓ Following' : 'Follow'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step: Ready */}
      {step === 'ready' && (
        <div className="w-full max-w-lg px-5 pb-32 animate-fade-in flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6 mt-4"
            style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.2), rgba(155,89,255,0.2))', border: '1px solid rgba(0,210,255,0.3)', boxShadow: '0 0 40px rgba(0,210,255,0.15)' }}>
            🚀
          </div>
          <h1 className="text-3xl font-800 text-white mb-3">You're all set!</h1>
          <p className="text-slate-400 text-base mb-8 max-w-xs leading-relaxed">
            Your personalized feed is ready. Discover trending videos, creators, and content made for you.
          </p>

          <div className="w-full space-y-3 mb-8">
            {[
              { emoji: '🎯', label: `${selectedInterests.size} interests selected` },
              { emoji: '👥', label: `${following.size} creators followed` },
              { emoji: '🔥', label: 'Personalized feed ready' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(0,210,255,0.06)', border: '1px solid rgba(0,210,255,0.12)' }}>
                <span className="text-xl">{item.emoji}</span>
                <span className="text-sm font-600 text-slate-200">{item.label}</span>
                <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                  <Icon name="CheckIcon" size={12} className="text-black" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{ background: 'linear-gradient(to top, rgba(5,5,8,1) 60%, transparent)', zIndex: 50 }}>
        <div className="max-w-lg mx-auto">
          {step === 'interests' && (
            <button
              onClick={() => selectedInterests.size >= 1 ? setStep('follow') : null}
              disabled={selectedInterests.size === 0}
              className="w-full py-4 rounded-2xl font-700 text-base transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
              Continue ({selectedInterests.size} selected) →
            </button>
          )}
          {step === 'follow' && (
            <div className="flex gap-3">
              <button onClick={() => setStep('interests')}
                className="px-5 py-4 rounded-2xl font-600 text-sm transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>
                Back
              </button>
              <button onClick={() => setStep('ready')}
                className="flex-1 py-4 rounded-2xl font-700 text-base transition-all duration-200 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                {following.size > 0 ? `Following ${following.size} · Continue →` : 'Continue →'}
              </button>
            </div>
          )}
          {step === 'ready' && (
            <button onClick={handleComplete} disabled={completing}
              className="w-full py-4 rounded-2xl font-700 text-base transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
              {completing ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  Loading your feed...
                </>
              ) : '🔥 Start Exploring'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
