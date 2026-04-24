'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface PointTransaction {
  id: string;
  amount: number;
  type: string;
  reason: string;
  created_at: string;
}

interface UserPointsData {
  balance: number;
  total_earned: number;
  total_spent: number;
}

const EARN_ACTIONS = [
  { icon: 'PencilSquareIcon', label: 'Create a post', points: 15, color: '#00d2ff' },
  { icon: 'HeartIcon', label: 'Like a post', points: 2, color: '#f87171' },
  { icon: 'ChatBubbleOvalLeftIcon', label: 'Comment on a post', points: 5, color: '#a78bfa' },
  { icon: 'ShareIcon', label: 'Share a post', points: 10, color: '#34d399' },
  { icon: 'UserPlusIcon', label: 'Invite a friend', points: 50, color: '#fbbf24' },
  { icon: 'GiftIcon', label: 'Send a live gift', points: -10, color: '#e879f9' },
];

export default function PointsRewardsScreen() {
  const { user } = useAuth();
  const supabase = createClient();
  const [pointsData, setPointsData] = useState<UserPointsData>({ balance: 0, total_earned: 0, total_spent: 0 });
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const [ptsRes, txRes] = await Promise.all([
        supabase.from('user_points').select('balance, total_earned, total_spent').eq('user_id', user.id).single(),
        supabase.from('point_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);
      if (ptsRes.data) setPointsData(ptsRes.data);
      if (txRes.data) setTransactions(txRes.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const typeColor: Record<string, string> = {
    engagement_like: '#f87171',
    engagement_comment: '#a78bfa',
    engagement_share: '#34d399',
    engagement_post: '#00d2ff',
    referral: '#fbbf24',
    gift_sent: '#e879f9',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-6 pb-24 lg:pb-6 space-y-6">
      {/* Balance Card */}
      <div
        className="glass-card p-8 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.06) 0%, rgba(155,89,255,0.06) 100%)' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 32px rgba(0,210,255,0.4)' }}
        >
          <Icon name="SparklesIcon" size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-700 gradient-text mb-1">Points & Rewards</h1>
        <p className="text-sm text-slate-400 mb-4">Earn points by engaging with the community</p>
        {loading ? (
          <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        ) : (
          <div className="text-5xl font-700 gradient-text">{pointsData.balance.toLocaleString()}</div>
        )}
        <p className="text-xs text-slate-500 mt-1">Available Points</p>

        <div className="flex gap-4 justify-center mt-6">
          <div className="text-center">
            <p className="text-lg font-700 text-green-400">{pointsData.total_earned.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Earned</p>
          </div>
          <div className="w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="text-center">
            <p className="text-lg font-700 text-pink-400">{pointsData.total_spent.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Spent</p>
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
          <Icon name="BoltIcon" size={16} className="text-yellow-400" />
          How to Earn Points
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {EARN_ACTIONS.map((a) => (
            <div key={a.label}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${a.color}18` }}>
                <Icon name={a.icon as any} size={15} style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 truncate">{a.label}</p>
                <p className="text-xs font-700" style={{ color: a.points > 0 ? '#34d399' : '#f87171' }}>
                  {a.points > 0 ? '+' : ''}{a.points} pts
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Redeem Points */}
      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
          <Icon name="GiftIcon" size={16} className="text-pink-400" />
          Redeem Points
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Premium Week', cost: 500, icon: 'StarIcon', color: '#f59e0b', href: '/subscription' },
            { label: 'Premium Month', cost: 1500, icon: 'GemIcon', color: '#a78bfa', href: '/subscription' },
            { label: 'Send Live Gift', cost: 10, icon: 'HeartIcon', color: '#f87171', href: '/live-stream' },
          ].map((r) => (
            <div key={r.label}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${r.color}18` }}>
                <Icon name={r.icon as any} size={16} style={{ color: r.color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-600 text-slate-200">{r.label}</p>
                <p className="text-xs text-slate-500">{r.cost} points required</p>
              </div>
              <Link href={r.href}
                className="px-3 py-1.5 rounded-xl text-xs font-600 transition-all"
                style={pointsData.balance >= r.cost
                  ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                  : { background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>
                {pointsData.balance >= r.cost ? 'Redeem' : 'Need more'}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card p-5 space-y-3">
        <h2 className="text-sm font-700 text-slate-300 flex items-center gap-2">
          <Icon name="ClockIcon" size={16} className="text-slate-400" />
          Transaction History
        </h2>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-6">
            <Icon name="SparklesIcon" size={28} className="text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No transactions yet</p>
            <p className="text-xs text-slate-600 mt-1">Start engaging to earn points!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${typeColor[tx.type] || '#94a3b8'}18` }}>
                  <Icon name="BoltIcon" size={14} style={{ color: typeColor[tx.type] || '#94a3b8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-600 text-slate-300 truncate">{tx.reason}</p>
                  <p className="text-xs text-slate-600">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-700" style={{ color: tx.amount > 0 ? '#34d399' : '#f87171' }}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
