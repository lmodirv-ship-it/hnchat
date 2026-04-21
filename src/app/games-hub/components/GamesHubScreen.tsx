'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Game {
  id: number;
  name: string;
  genre: string;
  players: string;
  rating: number;
  icon: string;
  gradient: string;
  featured?: boolean;
  live?: boolean;
  description: string;
}

const games: Game[] = [
  { id: 1, name: 'Diamond Clash', genre: 'Battle Royale', players: '2.4M', rating: 4.9, icon: '💎', gradient: 'from-cyan-500 to-violet-600', featured: true, live: true, description: 'Epic 100-player battle royale with diamond-grade graphics and crystal weapons.' },
  { id: 2, name: 'Neon Racer X', genre: 'Racing', players: '1.2M', rating: 4.7, icon: '🏎️', gradient: 'from-orange-500 to-red-600', featured: true, live: false, description: 'Futuristic racing through neon-lit crystal cities at hyperspeed.' },
  { id: 3, name: 'Quantum Chess', genre: 'Strategy', players: '890K', rating: 4.8, icon: '♟️', gradient: 'from-violet-500 to-purple-600', featured: false, live: false, description: 'Chess reimagined with quantum mechanics and AI opponents.' },
  { id: 4, name: 'Crystal Puzzle', genre: 'Puzzle', players: '3.1M', rating: 4.6, icon: '🔮', gradient: 'from-pink-500 to-rose-600', featured: false, live: false, description: 'Mind-bending 3D crystal puzzles with satisfying diamond shatters.' },
  { id: 5, name: 'Space Miners', genre: 'Adventure', players: '567K', rating: 4.5, icon: '🚀', gradient: 'from-blue-500 to-indigo-600', featured: false, live: true, description: 'Mine rare crystals across the galaxy in this epic space adventure.' },
  { id: 6, name: 'Prism Tower', genre: 'Tower Defense', players: '1.8M', rating: 4.7, icon: '🏰', gradient: 'from-emerald-500 to-teal-600', featured: true, live: false, description: 'Defend your crystal tower against waves of shadow invaders.' },
  { id: 7, name: 'AI Dungeon X', genre: 'RPG', players: '2.2M', rating: 4.9, icon: '⚔️', gradient: 'from-amber-500 to-orange-600', featured: false, live: false, description: 'AI-generated infinite RPG adventures in a diamond fantasy world.' },
  { id: 8, name: 'Beat Diamond', genre: 'Rhythm', players: '4.5M', rating: 4.8, icon: '🎵', gradient: 'from-fuchsia-500 to-pink-600', featured: true, live: true, description: 'Rhythm game with diamond-shattering beats and crystal visuals.' },
];

const genres = ['All', 'Featured', 'Battle Royale', 'Racing', 'Strategy', 'Puzzle', 'Adventure', 'RPG', 'Rhythm'];

const leaderboard = [
  { rank: 1, name: 'Kai Nexus', score: '9,847,200', avatar: 'KN', badge: '💎' },
  { rank: 2, name: 'Nova Stellar', score: '8,234,100', avatar: 'NS', badge: '🥈' },
  { rank: 3, name: 'Orion Byte', score: '7,891,500', avatar: 'OB', badge: '🥉' },
  { rank: 4, name: 'Zara Flux', score: '6,543,200', avatar: 'ZF', badge: '⭐' },
  { rank: 5, name: 'Luna Prism', score: '5,234,800', avatar: 'LP', badge: '⭐' },
];

export default function GamesHubScreen() {
  const [activeGenre, setActiveGenre] = useState('All');
  const [activeTab, setActiveTab] = useState<'games' | 'leaderboard' | 'tournaments'>('games');

  const filtered = games.filter(g => {
    if (activeGenre === 'All') return true;
    if (activeGenre === 'Featured') return g.featured;
    return g.genre === activeGenre;
  });

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.95)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-800 gradient-text mb-1">🎮 Games Hub</h1>
            <p className="text-slate-500 text-sm">Play · Compete · Win · Diamond League</p>
          </div>
          <div className="flex gap-2">
            <div className="px-3 py-1.5 rounded-xl text-xs font-600 flex items-center gap-1.5"
              style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              3 Live Games
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex gap-3">
          {(['games', 'leaderboard', 'tournaments'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-2xl text-sm font-600 capitalize transition-all duration-200"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tab === 'games' ? '🎮 Games' : tab === 'leaderboard' ? '🏆 Leaderboard' : '⚔️ Tournaments'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'games' && (
          <>
            {/* Genre filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {genres.map(g => (
                <button key={g} onClick={() => setActiveGenre(g)}
                  className="px-4 py-1.5 rounded-xl text-xs font-600 whitespace-nowrap transition-all duration-200 flex-shrink-0"
                  style={activeGenre === g
                    ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {g}
                </button>
              ))}
            </div>

            {/* Featured game banner */}
            {activeGenre === 'All' && (
              <div className="glass-card p-5 mb-6 bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-pink-500/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 text-8xl opacity-10 p-4">💎</div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 24px rgba(0,210,255,0.4)' }}>
                    💎
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-700 px-2 py-0.5 rounded-full mb-1 inline-block"
                      style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                      🔴 LIVE NOW · 2.4M playing
                    </span>
                    <h3 className="text-xl font-800 text-slate-100">Diamond Clash</h3>
                    <p className="text-slate-400 text-sm">Epic 100-player battle royale</p>
                  </div>
                  <button className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
                    <Icon name="PlayIcon" size={16} />
                    Play Now
                  </button>
                </div>
              </div>
            )}

            {/* Games grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {filtered.map(game => (
                <div key={game.id} className="glass-card-hover cursor-pointer overflow-hidden">
                  {/* Game cover */}
                  <div className={`h-28 bg-gradient-to-br ${game.gradient} relative flex items-center justify-center`}>
                    <span className="text-5xl">{game.icon}</span>
                    {game.live && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-700 flex items-center gap-1"
                        style={{ background: 'rgba(239,68,68,0.9)', color: 'white' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />LIVE
                      </div>
                    )}
                    {game.featured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-700"
                        style={{ background: 'rgba(0,210,255,0.9)', color: '#050508' }}>
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-slate-100 font-700 text-sm mb-0.5">{game.name}</h3>
                    <p className="text-slate-500 text-xs mb-2">{game.genre}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="text-slate-300 text-xs font-600">{game.rating}</span>
                        <span className="text-slate-600 text-xs">· {game.players}</span>
                      </div>
                      <button className="px-3 py-1 rounded-xl text-xs font-700 transition-all duration-200 hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
                        Play
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'leaderboard' && (
          <div className="max-w-2xl">
            <div className="glass-card p-5 mb-4" style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.05), rgba(155,89,255,0.05))' }}>
              <h3 className="font-700 text-slate-200 text-base mb-4">🏆 Global Diamond League</h3>
              <div className="space-y-3">
                {leaderboard.map(player => (
                  <div key={player.rank} className={`flex items-center gap-4 p-3 rounded-2xl transition-all duration-200 ${player.rank === 1 ? 'glass-card' : 'hover:bg-white/04'}`}
                    style={player.rank === 1 ? { borderColor: 'rgba(0,210,255,0.3)' } : {}}>
                    <span className="text-xl w-8 text-center">{player.badge}</span>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-700"
                      style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                      {player.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-200 font-600 text-sm">{player.name}</p>
                      <p className="text-slate-500 text-xs">Rank #{player.rank}</p>
                    </div>
                    <span className="font-700 text-sm" style={{ color: player.rank === 1 ? '#00d2ff' : '#94a3b8' }}>
                      {player.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Diamond Clash World Cup', prize: '$50,000', players: '1,024', starts: 'In 2 days', game: '💎', gradient: 'from-cyan-500/20 to-violet-500/20' },
              { name: 'Neon Racer Championship', prize: '$25,000', players: '512', starts: 'In 5 days', game: '🏎️', gradient: 'from-orange-500/20 to-red-500/20' },
              { name: 'Crystal Puzzle Masters', prize: '$10,000', players: '256', starts: 'Live Now!', game: '🔮', gradient: 'from-pink-500/20 to-rose-500/20' },
              { name: 'Beat Diamond Finals', prize: '$15,000', players: '128', starts: 'In 1 week', game: '🎵', gradient: 'from-fuchsia-500/20 to-pink-500/20' },
            ].map(t => (
              <div key={t.name} className={`glass-card-hover p-5 bg-gradient-to-br ${t.gradient}`}>
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{t.game}</span>
                  <div>
                    <h3 className="text-slate-100 font-700 text-sm">{t.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: t.starts === 'Live Now!' ? '#22c55e' : '#94a3b8' }}>
                      {t.starts === 'Live Now!' ? '🔴 ' : '⏰ '}{t.starts}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-800" style={{ color: '#f59e0b' }}>🏆 {t.prize}</div>
                    <div className="text-slate-500 text-xs">👥 {t.players} players</div>
                  </div>
                  <button className="btn-primary text-xs px-4 py-2">Register</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
