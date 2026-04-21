'use client';
import React, { useState, useEffect, useId } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { toast, Toaster } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface InvitedFriend {
  id: string;
  name: string;
  avatar: string;
  avatarAlt: string;
  joinedAt: string;
  status: 'active' | 'pending';
  reward: number;
}

const REWARDS = [
  { milestone: 1, label: '1 Friend', reward: '🎁 +50 Points', icon: 'UserPlusIcon', color: '#00d2ff' },
  { milestone: 5, label: '5 Friends', reward: '⭐ Premium Week', icon: 'StarIcon', color: '#f59e0b' },
  { milestone: 10, label: '10 Friends', reward: '💎 Premium Month', icon: 'GemIcon', color: '#a78bfa' },
  { milestone: 25, label: '25 Friends', reward: '🚀 Creator Badge', icon: 'RocketLaunchIcon', color: '#e879f9' },
  { milestone: 50, label: '50 Friends', reward: '👑 VIP Status', icon: 'TrophyIcon', color: '#fbbf24' },
];

const mockFriends: InvitedFriend[] = [
  { id: 'f1', name: 'Sara Benali', avatar: 'https://i.pravatar.cc/48?img=5', avatarAlt: 'Sara Benali profile picture', joinedAt: '2 days ago', status: 'active', reward: 50 },
  { id: 'f2', name: 'Youssef Amrani', avatar: 'https://i.pravatar.cc/48?img=12', avatarAlt: 'Youssef Amrani profile picture', joinedAt: '5 days ago', status: 'active', reward: 50 },
  { id: 'f3', name: 'Fatima Zahra', avatar: 'https://i.pravatar.cc/48?img=9', avatarAlt: 'Fatima Zahra profile picture', joinedAt: 'Pending', status: 'pending', reward: 0 },
];

export default function InviteScreen() {
  const { user } = useAuth();
  const uid = useId();
  const [copied, setCopied] = useState(false);
  const [friends] = useState<InvitedFriend[]>(mockFriends);
  const [totalPoints] = useState(100);
  const [totalInvited] = useState(2);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hnchat7959.builtwithrocket.new';
  const inviteCode = user?.id ? user.id.slice(0, 8).toUpperCase() : 'HNCH1234';
  const inviteLink = `${baseUrl}/sign-up-login?ref=${inviteCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      toast.success('Invite link copied! 🎉');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareVia = (platform: string) => {
    const text = `Join me on hnChat — the next-gen social platform! Use my invite link:`;
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + inviteLink)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(inviteLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(text)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
  };

  const nextMilestone = REWARDS.find((r) => r.milestone > totalInvited) || REWARDS[REWARDS.length - 1];
  const progress = Math.min((totalInvited / nextMilestone.milestone) * 100, 100);

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6 space-y-6">

        {/* Hero */}
        <div
          className="glass-card p-8 text-center relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.06) 0%, rgba(155,89,255,0.06) 100%)' }}
        >
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={`${uid}-star-${i}`}
                className="absolute w-1 h-1 rounded-full opacity-40"
                style={{
                  background: i % 2 === 0 ? '#00d2ff' : '#9b59ff',
                  top: `${15 + i * 14}%`,
                  left: `${5 + i * 16}%`,
                  boxShadow: `0 0 6px ${i % 2 === 0 ? '#00d2ff' : '#9b59ff'}`,
                }}
              />
            ))}
          </div>
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 32px rgba(0,210,255,0.4)' }}
          >
            <Icon name="UserGroupIcon" size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-700 gradient-text mb-2">Invite Friends & Earn Rewards</h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Share your unique invite link. For every friend who joins, you both get rewarded!
          </p>

          {/* Points badge */}
          <div
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-600"
            style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)', color: '#6ee7f7' }}
          >
            <Icon name="SparklesIcon" size={16} />
            {totalPoints} Points Earned
          </div>
        </div>

        {/* Invite Link */}
        <div className="glass-card p-5 space-y-4">
          <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
            <Icon name="LinkIcon" size={16} className="text-cyan-glow" />
            Your Invite Link
          </h2>
          <div className="flex gap-2">
            <div
              className="flex-1 flex items-center px-4 py-3 rounded-xl text-sm text-slate-400 font-mono truncate"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="truncate">{inviteLink}</span>
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-600 transition-all duration-150 flex-shrink-0"
              style={{
                background: copied ? 'rgba(0,210,255,0.15)' : 'linear-gradient(135deg, #00d2ff, #9b59ff)',
                color: copied ? '#6ee7f7' : '#0a0a0f',
                border: copied ? '1px solid rgba(0,210,255,0.3)' : 'none',
              }}
            >
              <Icon name={copied ? 'CheckIcon' : 'ClipboardDocumentIcon'} size={16} />
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Invite Code */}
          <div className="flex items-center gap-3">
            <div
              className="flex-1 flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ background: 'rgba(155,89,255,0.06)', border: '1px solid rgba(155,89,255,0.15)' }}
            >
              <span className="text-xs text-slate-500">Your Code</span>
              <span className="text-sm font-700 text-purple-300 font-mono tracking-widest">{inviteCode}</span>
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex gap-2">
            {[
              { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', icon: 'ChatBubbleLeftRightIcon' },
              { id: 'twitter', label: 'Twitter/X', color: '#1DA1F2', icon: 'GlobeAltIcon' },
              { id: 'telegram', label: 'Telegram', color: '#0088cc', icon: 'PaperAirplaneIcon' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => shareVia(s.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-600 transition-all duration-150 hover:opacity-80"
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}30`, color: s.color }}
              >
                <Icon name={s.icon as any} size={14} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress to next reward */}
        <div className="glass-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
              <Icon name="TrophyIcon" size={16} className="text-amber-400" />
              Progress to Next Reward
            </h2>
            <span className="text-xs text-slate-500">{totalInvited} / {nextMilestone.milestone} friends</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00d2ff, #9b59ff)' }}
            />
          </div>
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(0,210,255,0.05)', border: '1px solid rgba(0,210,255,0.1)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${nextMilestone.color}18`, border: `1px solid ${nextMilestone.color}30` }}
            >
              <Icon name={nextMilestone.icon as any} size={18} style={{ color: nextMilestone.color }} />
            </div>
            <div>
              <p className="text-sm font-600 text-slate-200">{nextMilestone.reward}</p>
              <p className="text-xs text-slate-500">Invite {nextMilestone.milestone - totalInvited} more friend{nextMilestone.milestone - totalInvited !== 1 ? 's' : ''} to unlock</p>
            </div>
          </div>
        </div>

        {/* Reward milestones */}
        <div className="glass-card p-5 space-y-3">
          <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
            <Icon name="GiftIcon" size={16} className="text-pink-400" />
            Reward Milestones
          </h2>
          <div className="space-y-2">
            {REWARDS.map((r) => {
              const unlocked = totalInvited >= r.milestone;
              return (
                <div
                  key={`reward-${r.milestone}`}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150"
                  style={{
                    background: unlocked ? `${r.color}10` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${unlocked ? r.color + '30' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: unlocked ? `${r.color}20` : 'rgba(255,255,255,0.05)' }}
                  >
                    <Icon name={r.icon as any} size={16} style={{ color: unlocked ? r.color : '#64748b' }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-600" style={{ color: unlocked ? '#e2e8f0' : '#64748b' }}>{r.reward}</p>
                    <p className="text-xs text-slate-600">{r.label} invited</p>
                  </div>
                  {unlocked ? (
                    <div
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-600"
                      style={{ background: `${r.color}20`, color: r.color }}
                    >
                      <Icon name="CheckCircleIcon" size={12} />
                      Unlocked
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600">{r.milestone} friends</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Invited friends list */}
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
              <Icon name="UsersIcon" size={16} className="text-cyan-glow" />
              Invited Friends
            </h2>
            <span
              className="text-xs font-600 px-2 py-1 rounded-lg"
              style={{ background: 'rgba(0,210,255,0.1)', color: '#6ee7f7' }}
            >
              {friends.length} total
            </span>
          </div>
          {friends.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="UserGroupIcon" size={32} className="text-slate-700 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No friends invited yet</p>
              <p className="text-xs text-slate-600 mt-1">Share your link to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <AppImage
                    src={f.avatar}
                    alt={f.avatarAlt}
                    width={36}
                    height={36}
                    className="rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-slate-200">{f.name}</p>
                    <p className="text-xs text-slate-500">{f.joinedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.status === 'active' ? (
                      <span
                        className="text-xs font-600 px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(0,210,255,0.1)', color: '#6ee7f7' }}
                      >
                        +{f.reward} pts
                      </span>
                    ) : (
                      <span
                        className="text-xs font-600 px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}
                      >
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}
