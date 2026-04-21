'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface Conversation {
  id: string;
  user: string;
  username: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  verified: boolean;
  pinned: boolean;
  isGroup?: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'groups'>('all');

  const filtered = conversations.filter((c) => {
    const matchSearch = c.user.toLowerCase().includes(search.toLowerCase()) || c.lastMessage.toLowerCase().includes(search.toLowerCase());
    if (filter === 'unread') return matchSearch && c.unread > 0;
    if (filter === 'groups') return matchSearch && c.isGroup;
    return matchSearch;
  });

  const pinned = filtered.filter((c) => c.pinned);
  const others = filtered.filter((c) => !c.pinned);

  const renderConv = (c: Conversation) => {
    const isActive = c.id === activeId;
    return (
      <button
        key={c.id}
        onClick={() => onSelect(c.id)}
        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left ${
          isActive
            ? 'bg-cyan-glow/08 border border-cyan-glow/15' :'hover:bg-white/04 border border-transparent'
        }`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {c.avatar ? (
            <div className="w-11 h-11 rounded-full overflow-hidden">
              <AppImage
                src={c.avatar}
                alt={`${c.user} conversation profile picture`}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-700 text-ice-black"
              style={{ background: c.isGroup ? 'linear-gradient(135deg, #a78bfa, #6ee7f7)' : 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }}
            >
              {c.isGroup ? <Icon name="UserGroupIcon" size={20} className="text-ice-black" /> : c.user[0]}
            </div>
          )}
          {c.online && !c.isGroup && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full status-online border-2 border-ice-black" />
          )}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1 min-w-0">
              <span className={`text-sm font-600 truncate ${isActive ? 'text-cyan-glow' : 'text-slate-200'}`}>
                {c.user}
              </span>
              {c.verified && <Icon name="CheckBadgeIcon" size={13} className="text-cyan-glow flex-shrink-0" />}
              {c.pinned && <Icon name="MapPinIcon" size={12} className="text-slate-500 flex-shrink-0" />}
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{c.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 truncate">{c.lastMessage}</p>
            {c.unread > 0 && (
              <span
                className="ml-2 flex-shrink-0 text-xs font-700 w-5 h-5 rounded-full flex items-center justify-center tabular-nums text-ice-black"
                style={{ background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }}
              >
                {c.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div
      className="w-72 xl:w-80 flex-shrink-0 flex flex-col border-r border-white/06 overflow-hidden"
      style={{ background: 'rgba(10,10,15,0.6)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/06">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-700 text-slate-200">Messages</h2>
          <button className="p-1.5 rounded-lg hover:bg-white/08 transition-all duration-150">
            <Icon name="PencilSquareIcon" size={18} className="text-slate-400" />
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Icon name="MagnifyingGlassIcon" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="input-glass pl-8 py-2 text-xs"
          />
        </div>
        {/* Filter tabs */}
        <div className="flex gap-1 mt-3">
          {(['all', 'unread', 'groups'] as const).map((f) => (
            <button
              key={`filter-${f}`}
              onClick={() => setFilter(f)}
              className={`flex-1 py-1.5 text-xs font-600 rounded-lg transition-all duration-150 capitalize ${
                filter === f
                  ? 'text-ice-black' :'text-slate-500 hover:text-slate-300 hover:bg-white/05'
              }`}
              style={filter === f ? { background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' } : {}}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {pinned.length > 0 && (
          <>
            <p className="text-xs font-600 uppercase tracking-widest text-slate-600 px-3 py-2">Pinned</p>
            {pinned.map(renderConv)}
            <div className="my-2 border-t border-white/05" />
          </>
        )}
        {others.length > 0 && (
          <>
            <p className="text-xs font-600 uppercase tracking-widest text-slate-600 px-3 py-2">Recent</p>
            {others.map(renderConv)}
          </>
        )}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icon name="ChatBubbleLeftRightIcon" size={28} className="text-slate-600 mb-2" />
            <p className="text-sm text-slate-500">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}