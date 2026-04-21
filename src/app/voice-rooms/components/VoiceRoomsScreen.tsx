'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface Room {
  id: number;
  name: string;
  topic: string;
  speakers: string[];
  listeners: number;
  live: boolean;
  gradient: string;
  category: string;
}

interface Contact {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  lastSeen?: string;
}

const rooms: Room[] = [
  { id: 1, name: '💎 Diamond Lounge', topic: 'Future of AI & Super Apps', speakers: ['NS', 'ZF', 'KN'], listeners: 1247, live: true, gradient: 'from-cyan-500/20 to-violet-500/20', category: 'Tech' },
  { id: 2, name: '🎵 Music Vibes', topic: 'Lo-fi beats & chill conversations', speakers: ['LP', 'OB'], listeners: 892, live: true, gradient: 'from-pink-500/20 to-rose-500/20', category: 'Music' },
  { id: 3, name: '🚀 Startup Founders', topic: 'Scaling from 0 to 1M users', speakers: ['AM', 'RK', 'SL', 'JD'], listeners: 2341, live: true, gradient: 'from-emerald-500/20 to-teal-500/20', category: 'Business' },
  { id: 4, name: '🎮 Gaming Arena', topic: 'Pro tips & tournament prep', speakers: ['GX', 'NV'], listeners: 567, live: false, gradient: 'from-orange-500/20 to-amber-500/20', category: 'Gaming' },
  { id: 5, name: '🌍 World News', topic: 'Breaking: Tech giants merge', speakers: ['WN', 'TK', 'PL'], listeners: 4892, live: true, gradient: 'from-blue-500/20 to-indigo-500/20', category: 'News' },
];

const contacts: Contact[] = [
  { id: 1, name: 'Nova Stellar', avatar: 'NS', status: 'online' },
  { id: 2, name: 'Zara Flux', avatar: 'ZF', status: 'busy', lastSeen: 'In a call' },
  { id: 3, name: 'Kai Nexus', avatar: 'KN', status: 'online' },
  { id: 4, name: 'Luna Prism', avatar: 'LP', status: 'offline', lastSeen: '2h ago' },
  { id: 5, name: 'Orion Byte', avatar: 'OB', status: 'online' },
];

export default function VoiceRoomsScreen() {
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'calls'>('rooms');
  const [muted, setMuted] = useState(false);
  const [inRoom, setInRoom] = useState(false);

  const statusColor = (s: Contact['status']) => s === 'online' ? '#22c55e' : s === 'busy' ? '#f59e0b' : '#64748b';

  return (
    <div className="flex h-full bg-ice-black">
      {/* Left Panel */}
      <div className="w-80 flex-shrink-0 border-r flex flex-col" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-700 gradient-text text-lg">🎙️ Voice Rooms & Calls</h2>
          <p className="text-slate-500 text-xs mt-0.5">Live audio · Video calls · Conferences</p>
        </div>
        {/* Tabs */}
        <div className="flex p-3 gap-2">
          {(['rooms', 'calls'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-xl text-sm font-600 capitalize transition-all duration-200"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }
                : { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tab === 'rooms' ? '🎙️ Rooms' : '📞 Calls'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {activeTab === 'rooms' ? rooms.map(room => (
            <button key={room.id} onClick={() => { setActiveRoom(room); setInRoom(false); }}
              className={`w-full p-3 rounded-2xl transition-all duration-200 text-left ${activeRoom?.id === room.id ? 'glass-card' : 'hover:bg-white/04'}`}
              style={{ border: activeRoom?.id === room.id ? '1px solid rgba(0,210,255,0.2)' : '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-slate-200 font-600 text-sm">{room.name}</span>
                {room.live && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-700 flex items-center gap-1"
                    style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />LIVE
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs mb-2 truncate">{room.topic}</p>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-1">
                  {room.speakers.slice(0, 3).map(s => (
                    <div key={s} className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 border border-ice-black"
                      style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                      {s[0]}
                    </div>
                  ))}
                </div>
                <span className="text-slate-500 text-xs">🎧 {room.listeners.toLocaleString()}</span>
              </div>
            </button>
          )) : contacts.map(contact => (
            <div key={contact.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/04 transition-all duration-200 cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-700"
                  style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}>
                  {contact.avatar}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ice-black"
                  style={{ background: statusColor(contact.status) }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-600">{contact.name}</p>
                <p className="text-xs" style={{ color: statusColor(contact.status) }}>
                  {contact.status === 'online' ? 'Online' : contact.lastSeen}
                </p>
              </div>
              <div className="flex gap-1">
                <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.2)' }}>
                  <Icon name="PhoneIcon" size={14} style={{ color: '#00d2ff' }} />
                </button>
                <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: 'rgba(155,89,255,0.1)', border: '1px solid rgba(155,89,255,0.2)' }}>
                  <Icon name="VideoCameraIcon" size={14} style={{ color: '#9b59ff' }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Room */}
        <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <button className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
            <Icon name="MicrophoneIcon" size={16} />
            Create Room
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <>
            {/* Room Header */}
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.8)' }}>
              <div className="flex-1">
                <h3 className="font-700 text-slate-100 text-base">{activeRoom.name}</h3>
                <p className="text-slate-500 text-xs">{activeRoom.topic}</p>
              </div>
              {activeRoom.live && (
                <span className="px-3 py-1 rounded-full text-xs font-700 flex items-center gap-1.5"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />LIVE · {activeRoom.listeners.toLocaleString()} listeners
                </span>
              )}
            </div>

            {/* Room Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className={`glass-card p-6 mb-6 bg-gradient-to-br ${activeRoom.gradient}`}>
                {/* Speakers */}
                <p className="text-xs font-600 uppercase tracking-widest mb-4" style={{ color: 'rgba(0,210,255,0.6)' }}>
                  🎙️ Speakers ({activeRoom.speakers.length})
                </p>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {activeRoom.speakers.map((s, i) => (
                    <div key={s} className="flex flex-col items-center gap-2">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-700"
                          style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: i === 0 ? '0 0 0 3px rgba(0,210,255,0.4), 0 0 20px rgba(0,210,255,0.3)' : 'none' }}>
                          {s}
                        </div>
                        {i === 0 && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: '#22c55e', border: '2px solid #050508' }}>
                            <Icon name="MicrophoneIcon" size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                      <span className="text-slate-400 text-xs font-500">Speaker {i + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Audio visualizer */}
                <div className="flex items-end justify-center gap-1 h-12 mb-4">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-1.5 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.random() * 100}%`,
                        background: `linear-gradient(to top, #00d2ff, #9b59ff)`,
                        opacity: 0.6 + Math.random() * 0.4,
                        animation: `pulse-live ${0.5 + Math.random() * 1}s infinite alternate`,
                      }} />
                  ))}
                </div>

                <p className="text-slate-400 text-sm text-center">🎧 {activeRoom.listeners.toLocaleString()} people listening</p>
              </div>

              {/* Controls */}
              {inRoom ? (
                <div className="flex items-center justify-center gap-4">
                  <button onClick={() => setMuted(!muted)}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                    style={muted
                      ? { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }
                      : { background: 'rgba(0,210,255,0.1)', border: '1px solid rgba(0,210,255,0.3)' }}>
                    <Icon name={muted ? 'MicrophoneIcon' : 'MicrophoneIcon'} size={22} style={{ color: muted ? '#ef4444' : '#00d2ff' }} />
                  </button>
                  <button onClick={() => setInRoom(false)}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 20px rgba(239,68,68,0.4)' }}>
                    <Icon name="PhoneXMarkIcon" size={26} className="text-white" />
                  </button>
                  <button className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
                    style={{ background: 'rgba(155,89,255,0.1)', border: '1px solid rgba(155,89,255,0.3)' }}>
                    <Icon name="HandRaisedIcon" size={22} style={{ color: '#9b59ff' }} />
                  </button>
                </div>
              ) : (
                <div className="flex justify-center">
                  <button onClick={() => setInRoom(true)} className="btn-primary flex items-center gap-2 px-8 py-3">
                    <Icon name="MicrophoneIcon" size={18} />
                    Join Room
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl"
                style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.15), rgba(155,89,255,0.15))', border: '1px solid rgba(0,210,255,0.2)' }}>
                🎙️
              </div>
              <h3 className="text-xl font-700 gradient-text mb-2">Voice Rooms & Calls</h3>
              <p className="text-slate-500 text-sm">Select a room to join or start a call</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
