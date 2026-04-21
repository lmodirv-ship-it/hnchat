'use client';
import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Link from 'next/link';

interface Conversation {
  id: string;
  user: string;
  username: string;
  avatar: string;
  online: boolean;
  verified: boolean;
  isGroup?: boolean;
}

const sharedMedia = [
  { id: 'media-001', src: 'https://picsum.photos/seed/media1/120/120', alt: 'Shared digital art piece with abstract colorful patterns' },
  { id: 'media-002', src: 'https://picsum.photos/seed/media2/120/120', alt: 'Shared photo of mountain landscape at sunset' },
  { id: 'media-003', src: 'https://picsum.photos/seed/media3/120/120', alt: 'Shared screenshot of code editor with colorful syntax highlighting' },
  { id: 'media-004', src: 'https://picsum.photos/seed/media4/120/120', alt: 'Shared infographic about social media statistics' },
  { id: 'media-005', src: 'https://picsum.photos/seed/media5/120/120', alt: 'Shared photo of city skyline at night with lights' },
  { id: 'media-006', src: 'https://picsum.photos/seed/media6/120/120', alt: 'Shared illustration of futuristic technology concept' },
];

export default function UserInfoPanel({ conversation, onClose }: { conversation: Conversation; onClose: () => void }) {
  return (
    <div
      className="hidden xl:flex w-72 flex-shrink-0 flex-col border-l border-white/06 overflow-y-auto animate-slide-in-right"
      style={{ background: 'rgba(10,10,15,0.6)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/06">
        <span className="text-sm font-600 text-slate-300">Info</span>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/08 transition-all duration-150">
          <Icon name="XMarkIcon" size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* Profile */}
        <div className="flex flex-col items-center text-center gap-3">
          {conversation.avatar ? (
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              <AppImage
                src={conversation.avatar}
                alt={`${conversation.user} detailed profile picture in info panel`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-700 text-ice-black"
              style={{ background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }}
            >
              {conversation.user[0]}
            </div>
          )}
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-base font-700 text-slate-200">{conversation.user}</span>
              {conversation.verified && <Icon name="CheckBadgeIcon" size={16} className="text-cyan-glow" />}
            </div>
            <p className="text-sm text-slate-500">@{conversation.username}</p>
            <p className="text-xs mt-1">
              {conversation.online ? (
                <span className="text-emerald-400 font-500">● Active now</span>
              ) : (
                <span className="text-slate-500">Last seen 2h ago</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/profile">
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-600 transition-all duration-150"
                style={{ background: 'rgba(110,231,247,0.1)', color: '#6ee7f7', border: '1px solid rgba(110,231,247,0.2)' }}
              >
                <Icon name="UserIcon" size={14} />
                Profile
              </button>
            </Link>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-600 transition-all duration-150 hover:bg-white/08"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Icon name="BellSlashIcon" size={14} />
              Mute
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-3 gap-2 rounded-xl p-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { label: 'Posts', value: '1.2K' },
            { label: 'Followers', value: '1.2M' },
            { label: 'Following', value: '847' },
          ].map((s) => (
            <div key={`info-stat-${s.label}`} className="text-center">
              <p className="text-sm font-700 gradient-text tabular-nums">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Shared media */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-600 text-slate-300">Shared Media</span>
            <button className="text-xs text-cyan-glow hover:underline font-500">See all</button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {sharedMedia.map((m) => (
              <div key={m.id} className="aspect-square rounded-lg overflow-hidden">
                <AppImage
                  src={m.src}
                  alt={m.alt}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-1">
          {[
            { icon: 'BellSlashIcon', label: 'Mute notifications', danger: false },
            { icon: 'NoSymbolIcon', label: 'Block user', danger: false },
            { icon: 'TrashIcon', label: 'Delete conversation', danger: true },
          ].map((a) => (
            <button
              key={`info-action-${a.label}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-500 transition-all duration-150 ${
                a.danger
                  ? 'text-red-400 hover:bg-red-400/08' :'text-slate-400 hover:bg-white/05 hover:text-slate-200'
              }`}
            >
              <Icon name={a.icon as any} size={16} />
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}