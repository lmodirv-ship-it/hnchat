'use client';
import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface ProfileHeaderProps {
  onEdit: () => void;
}

function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n?.toString() || '0';
}

export default function ProfileHeader({ onEdit }: ProfileHeaderProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const supabase = createClient();
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
        setLoading(false);
      });
  }, [user]);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const username = profile?.username || user?.email?.split('@')[0] || 'user';
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || '';
  const bio = profile?.bio || '';
  const website = profile?.website || '';
  const location = profile?.location || '';
  const isVerified = profile?.is_verified || false;
  const followersCount = profile?.followers_count || 0;
  const followingCount = profile?.following_count || 0;
  const postsCount = profile?.posts_count || 0;

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  const stats = [
    { label: 'Posts', value: formatNum(postsCount) },
    { label: 'Followers', value: formatNum(followersCount) },
    { label: 'Following', value: formatNum(followingCount) },
    { label: 'Likes', value: '0' },
  ];

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
                {loading ? (
                  <div className="w-full h-full animate-pulse" style={{ background: 'rgba(255,255,255,0.08)' }} />
                ) : avatarUrl ? (
                  <AppImage
                    src={avatarUrl}
                    alt={`${displayName} profile picture`}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-3xl font-700 text-ice-black"
                    style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
                  >
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
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
              {loading ? (
                <div className="space-y-2 animate-pulse">
                  <div className="h-6 w-40 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <div className="h-4 w-28 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl md:text-2xl font-700 text-slate-200">{displayName}</h1>
                    {isVerified && <Icon name="CheckBadgeIcon" size={20} className="text-cyan-glow" />}
                    <Badge variant="premium">✦ Premium</Badge>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">@{username}{joinedDate ? ` · Joined ${joinedDate}` : ''}</p>
                  {bio && (
                    <p className="text-sm text-slate-400 mt-1 max-w-md">{bio}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {location && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Icon name="MapPinIcon" size={13} />
                        {location}
                      </span>
                    )}
                    {website && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Icon name="LinkIcon" size={13} />
                        <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-cyan-glow hover:underline">{website}</a>
                      </span>
                    )}
                    {joinedDate && (
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Icon name="CalendarIcon" size={13} />
                        Joined {joinedDate}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => { setFollowed(!followed); toast.success(followed ? 'Unfollowed' : `Following ${displayName}!`); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-600 transition-all duration-150 ${
                followed
                  ? 'border border-cyan-glow/30 text-cyan-glow bg-cyan-glow/08' : 'text-ice-black'
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
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`stat-skel-${i}`} className="glass-card p-4 text-center animate-pulse">
                <div className="h-7 w-16 mx-auto rounded-lg mb-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-3 w-12 mx-auto rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }} />
              </div>
            ))
          ) : (
            stats.map((s) => (
              <div
                key={`stat-${s.label}`}
                className="glass-card p-4 text-center hover:border-cyan-glow/20 transition-all duration-150 cursor-pointer"
              >
                <p className="text-2xl font-700 gradient-text tabular-nums">{s.value}</p>
                <p className="text-xs font-500 text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}