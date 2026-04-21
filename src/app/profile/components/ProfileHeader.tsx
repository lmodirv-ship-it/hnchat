'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import Link from 'next/link';

const stats = [
  { label: 'Posts', value: '1,284' },
  { label: 'Followers', value: '2.4M' },
  { label: 'Following', value: '847' },
  { label: 'Likes', value: '18.7M' },
];

interface ProfileHeaderProps {
  onEdit: () => void;
}

export default function ProfileHeader({ onEdit }: ProfileHeaderProps) {
  const [followed, setFollowed] = useState(false);

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      {/* Cover image */}
      <div className="relative h-52 md:h-72 overflow-hidden">
        <AppImage
          src="https://picsum.photos/seed/cover001/1400/400"
          alt="Profile cover photo showing abstract futuristic cityscape with neon lights and dark sky"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(10,10,15,0.9) 100%)' }}
        />
        <button
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-600 transition-all duration-150"
          style={{ background: 'rgba(0,0,0,0.5)', color: '#e2e8f0', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Icon name="CameraIcon" size={14} />
          Edit Cover
        </button>
      </div>

      {/* Profile info */}
      <div className="px-4 lg:px-8 xl:px-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-16 mb-6 relative z-10">
          {/* Avatar + name */}
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4"
                style={{ borderColor: '#0a0a0f', boxShadow: '0 0 24px rgba(110,231,247,0.3)' }}
              >
                <AppImage
                  src="https://i.pravatar.cc/200?img=47"
                  alt="Alex Mercer profile picture, creator and hnChat power user with verified badge"
                  width={112}
                  height={112}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' }}
              >
                <Icon name="CameraIcon" size={14} className="text-ice-black" />
              </button>
            </div>

            {/* Name & meta */}
            <div className="pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-700 text-slate-200">Alex Mercer</h1>
                <Icon name="CheckBadgeIcon" size={20} className="text-cyan-glow" />
                <Badge variant="premium">✦ Premium</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">@alexm · Joined March 2024</p>
              <p className="text-sm text-slate-400 mt-1 max-w-md">
                Digital creator, tech enthusiast & coffee addict ☕ Building the future one pixel at a time. 🌐 hnchat.io/alexm
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="MapPinIcon" size={13} />
                  San Francisco, CA
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="LinkIcon" size={13} />
                  <a href="#" className="text-cyan-glow hover:underline">hnchat.io/alexm</a>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Icon name="CalendarIcon" size={13} />
                  Joined Mar 2024
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setFollowed(!followed); toast.success(followed ? 'Unfollowed' : 'Following Alex Mercer!'); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-600 transition-all duration-150 ${
                followed
                  ? 'border border-cyan-glow/30 text-cyan-glow bg-cyan-glow/08' :'text-ice-black'
              }`}
              style={!followed ? { background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' } : {}}
            >
              <Icon name={followed ? 'CheckIcon' : 'UserPlusIcon'} size={16} />
              {followed ? 'Following' : 'Follow'}
            </button>
            <Link href="/chats-messaging">
              <button className="btn-glass flex items-center gap-2 text-sm">
                <Icon name="ChatBubbleLeftRightIcon" size={16} />
                Message
              </button>
            </Link>
            <button
              onClick={() => toast.success('Profile link copied!')}
              className="p-2.5 rounded-xl hover:bg-white/08 transition-all duration-150 border border-white/08"
            >
              <Icon name="ShareIcon" size={18} className="text-slate-400" />
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 transition-all duration-150 border border-white/08 hover:bg-white/08 text-slate-300"
            >
              <Icon name="PencilSquareIcon" size={16} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div
              key={`stat-${s.label}`}
              className="glass-card p-4 text-center hover:border-cyan-glow/20 transition-all duration-150 cursor-pointer"
            >
              <p className="text-2xl font-700 gradient-text tabular-nums">{s.value}</p>
              <p className="text-xs font-500 text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}