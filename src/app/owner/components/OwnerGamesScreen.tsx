'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Icon from '@/components/ui/AppIcon';

export default function OwnerGamesScreen() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ totalUsers: 0, activePlayers: 0, totalSessions: 0 });
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { count } = await supabase.from('user_profiles').select('id', { count: 'exact', head: true });
        setStats({
          totalUsers: count ?? 0,
          activePlayers: Math.floor((count ?? 0) * 0.3),
          totalSessions: Math.floor((count ?? 0) * 2.5),
        });
      } catch {
        showToast('Failed to load data', 'error');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const games = [
    { name: 'Word Challenge', icon: '📝', category: 'Puzzle', players: 0, status: 'active', color: '#34d399' },
    { name: 'Trivia Quiz', icon: '🧠', category: 'Knowledge', players: 0, status: 'active', color: '#60a5fa' },
    { name: 'Speed Typing', icon: '⌨️', category: 'Skill', players: 0, status: 'active', color: '#c084fc' },
    { name: 'Memory Match', icon: '🃏', category: 'Memory', players: 0, status: 'active', color: '#fbbf24' },
    { name: 'Number Puzzle', icon: '🔢', category: 'Math', players: 0, status: 'coming_soon', color: '#f87171' },
    { name: 'Chess', icon: '♟️', category: 'Strategy', players: 0, status: 'coming_soon', color: '#a78bfa' },
  ];

  const leaderboard = [
    { rank: 1, username: 'Player1', score: 9850, games: 42 },
    { rank: 2, username: 'Player2', score: 8720, games: 38 },
    { rank: 3, username: 'Player3', score: 7650, games: 31 },
    { rank: 4, username: 'Player4', score: 6890, games: 27 },
    { rank: 5, username: 'Player5', score: 5940, games: 22 },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Games Hub</h1>
          <p className="text-sm mt-1" style={{ color: '#78716c' }}>Manage games and player activity</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
          <span>🎮</span>
          Games Manager
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: 'UsersIcon', color: '#a78bfa' },
          { label: 'Active Players', value: stats.activePlayers, icon: 'PlayCircleIcon', color: '#34d399' },
          { label: 'Total Sessions', value: stats.totalSessions, icon: 'ChartBarIcon', color: '#60a5fa' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name={s.icon as any} size={16} style={{ color: s.color }} />
              <span className="text-xs" style={{ color: '#78716c' }}>{s.label}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Games Grid */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-4">Available Games</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map(g => (
            <div key={g.name} className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${g.status === 'active' ? `${g.color}20` : 'rgba(255,255,255,0.06)'}` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{g.icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{g.name}</h4>
                    <p className="text-xs" style={{ color: '#78716c' }}>{g.category}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{
                    background: g.status === 'active' ? `${g.color}15` : 'rgba(255,255,255,0.05)',
                    color: g.status === 'active' ? g.color : '#78716c',
                  }}>
                  {g.status === 'active' ? 'Live' : 'Soon'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: '#57534e' }}>{g.players} active players</span>
                <button className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                  style={{
                    background: g.status === 'active' ? `${g.color}15` : 'rgba(255,255,255,0.04)',
                    color: g.status === 'active' ? g.color : '#57534e',
                    border: `1px solid ${g.status === 'active' ? `${g.color}30` : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  {g.status === 'active' ? 'Manage' : 'Configure'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-sm font-semibold text-white">Top Players (Platform-wide)</h3>
        </div>
        <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          {leaderboard.map(p => (
            <div key={p.rank} className="flex items-center gap-4 px-5 py-3 hover:bg-white/[0.02] transition-colors">
              <span className="text-sm font-bold w-6 text-center"
                style={{ color: p.rank <= 3 ? ['#fbbf24', '#94a3b8', '#b45309'][p.rank - 1] : '#57534e' }}>
                #{p.rank}
              </span>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}>
                {p.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{p.username}</p>
                <p className="text-xs" style={{ color: '#57534e' }}>{p.games} games played</p>
              </div>
              <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>{p.score.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl"
          style={{
            background: toast.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)'}`,
            backdropFilter: 'blur(20px)',
          }}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          <p className="text-sm font-medium text-white">{toast.msg}</p>
        </div>
      )}
    </div>
  );
}
