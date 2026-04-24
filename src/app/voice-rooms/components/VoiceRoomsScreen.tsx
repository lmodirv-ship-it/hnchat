'use client';
import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Room {
  id: string;
  name: string;
  topic: string;
  speakers: string[];
  listeners: number;
  live: boolean;
  gradient: string;
  category: string;
}

interface Contact {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  lastSeen?: string;
}

export default function VoiceRoomsScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [activeTab, setActiveTab] = useState<'rooms' | 'calls'>('rooms');
  const [muted, setMuted] = useState(false);
  const [inRoom, setInRoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
    fetchContacts();
  }, []);

  const fetchRooms = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .select('*, voice_room_speakers(user_id, user_profiles(full_name))')
        .order('listener_count', { ascending: false });

      if (error) { console.log('Rooms fetch error:', error.message); return; }

      const mapped: Room[] = (data || []).map(r => ({
        id: r.id,
        name: r.name,
        topic: r.topic,
        speakers: (r.voice_room_speakers || []).map((s: any) =>
          s.user_profiles?.full_name?.slice(0, 2).toUpperCase() || 'US'
        ),
        listeners: r.listener_count,
        live: r.is_live,
        gradient: r.gradient,
        category: r.category,
      }));
      setRooms(mapped);
    } catch (e) {
      console.log('Rooms fetch failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, username')
        .limit(10);

      if (error) { console.log('Contacts fetch error:', error.message); return; }

      const mapped: Contact[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.full_name || u.username || 'User',
        avatar: (u.full_name || u.username || 'US').slice(0, 2).toUpperCase(),
        status: 'online' as const,
      }));
      setContacts(mapped);
    } catch (e) {
      console.log('Contacts fetch failed');
    }
  };

  const handleCreateRoom = async () => {
    if (!user) return;
    setCreating(true);
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('voice_rooms')
        .insert({
          name: '🎙️ New Room',
          topic: 'Open discussion',
          category: 'General',
          gradient: 'from-cyan-500/20 to-violet-500/20',
          is_live: true,
          listener_count: 1,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) { console.log('Create room error:', error.message); return; }
      await fetchRooms();
      if (data) {
        setActiveRoom({
          id: data.id, name: data.name, topic: data.topic,
          speakers: [], listeners: 1, live: true,
          gradient: data.gradient, category: data.category,
        });
      }
    } catch (e) {
      console.log('Create room failed');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async (room: Room) => {
    if (!user) return;
    const supabase = createClient();
    try {
      await supabase.from('voice_room_speakers').upsert(
        { room_id: room.id, user_id: user.id, is_muted: false },
        { onConflict: 'room_id,user_id' }
      );
      await supabase.from('voice_rooms').update({ listener_count: room.listeners + 1 }).eq('id', room.id);
      setInRoom(true);
    } catch (e) {
      console.log('Join room failed');
    }
  };

  const handleLeaveRoom = async () => {
    if (!user || !activeRoom) return;
    const supabase = createClient();
    try {
      await supabase.from('voice_room_speakers').delete().eq('room_id', activeRoom.id).eq('user_id', user.id);
      await supabase.from('voice_rooms').update({ listener_count: Math.max(0, activeRoom.listeners - 1) }).eq('id', activeRoom.id);
      setInRoom(false);
    } catch (e) {
      console.log('Leave room failed');
    }
  };

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
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              ))}
            </div>
          ) : activeTab === 'rooms' ? rooms.map(room => (
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
                  {room.speakers.slice(0, 3).map((s, idx) => (
                    <div key={idx} className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 border border-ice-black"
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
          <button onClick={handleCreateRoom} disabled={creating || !user}
            className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-50">
            <Icon name="MicrophoneIcon" size={16} />
            {creating ? 'Creating...' : 'Create Room'}
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
                    <div key={i} className="flex flex-col items-center gap-2">
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
                    <div key={i} className="w-1.5 rounded-full"
                      style={{
                        height: `${30 + (i % 5) * 15}%`,
                        background: 'linear-gradient(to top, #00d2ff, #9b59ff)',
                        opacity: 0.7,
                        animation: `pulse-live ${0.5 + (i % 3) * 0.3}s infinite alternate`,
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
                    <Icon name="MicrophoneIcon" size={22} style={{ color: muted ? '#ef4444' : '#00d2ff' }} />
                  </button>
                  <button onClick={handleLeaveRoom}
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
                  <button onClick={() => handleJoinRoom(activeRoom)} className="btn-primary flex items-center gap-2 px-8 py-3">
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
