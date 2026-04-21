'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

const liveStreams = [
  {
    id: 'live-001',
    creator: 'Sara Nova',
    username: 'saranvoa',
    avatar: 'https://i.pravatar.cc/80?img=47',
    thumbnail: 'https://picsum.photos/seed/live1/640/360',
    thumbnailAlt: 'Live stream thumbnail showing artist painting on digital canvas with colorful abstract art in progress',
    title: 'Digital Art Workshop — Creating NFT Collection Live',
    category: 'Art & Design',
    viewers: 4218,
    duration: '1h 23m',
    verified: true,
    tags: ['#DigitalArt', '#NFT', '#Tutorial'],
  },
  {
    id: 'live-002',
    creator: 'Marco Vega',
    username: 'marcov',
    avatar: 'https://i.pravatar.cc/80?img=8',
    thumbnail: 'https://picsum.photos/seed/live2/640/360',
    thumbnailAlt: 'Live stream thumbnail of developer with multiple monitors showing code review session',
    title: 'Open Source Code Review — Building hnChat Clone',
    category: 'Tech & Dev',
    viewers: 1834,
    duration: '42m',
    verified: false,
    tags: ['#OpenSource', '#React', '#NextJS'],
  },
  {
    id: 'live-003',
    creator: 'Zara Moon',
    username: 'zaramoon',
    avatar: 'https://i.pravatar.cc/80?img=56',
    thumbnail: 'https://picsum.photos/seed/live3/640/360',
    thumbnailAlt: 'Live stream thumbnail of musician playing acoustic guitar in softly lit studio',
    title: 'Acoustic Session — New Album Preview 🎵',
    category: 'Music',
    viewers: 8921,
    duration: '2h 07m',
    verified: true,
    tags: ['#Music', '#Acoustic', '#LivePerformance'],
  },
  {
    id: 'live-004',
    creator: 'Kai Renn',
    username: 'kairenn',
    avatar: 'https://i.pravatar.cc/80?img=25',
    thumbnail: 'https://picsum.photos/seed/live4/640/360',
    thumbnailAlt: 'Live stream thumbnail showing extreme sports athlete on mountain bike trail in forest',
    title: 'Trail Riding — Red Mountain Loop Challenge',
    category: 'Sports',
    viewers: 3102,
    duration: '55m',
    verified: false,
    tags: ['#MTB', '#Extreme', '#Sports'],
  },
  {
    id: 'live-005',
    creator: 'Nora Flux',
    username: 'noraflux',
    avatar: 'https://i.pravatar.cc/80?img=44',
    thumbnail: 'https://picsum.photos/seed/live5/640/360',
    thumbnailAlt: 'Live stream thumbnail of chef in professional kitchen preparing elaborate multi-course meal',
    title: 'Fine Dining at Home — 5-Course Tasting Menu',
    category: 'Food & Cooking',
    viewers: 2277,
    duration: '1h 11m',
    verified: true,
    tags: ['#Cooking', '#FineDining', '#Recipe'],
  },
  {
    id: 'live-006',
    creator: 'Dex Volta',
    username: 'dexvolta',
    avatar: 'https://i.pravatar.cc/80?img=15',
    thumbnail: 'https://picsum.photos/seed/live6/640/360',
    thumbnailAlt: 'Live stream thumbnail of person playing competitive video game with dramatic lighting',
    title: 'Ranked Grind — Road to Global Elite 🎮',
    category: 'Gaming',
    viewers: 6544,
    duration: '3h 28m',
    verified: false,
    tags: ['#Gaming', '#Esports', '#Ranked'],
  },
];

function formatViewers(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export default function LiveSection() {
  const [joined, setJoined] = useState<Set<string>>(new Set());

  const handleJoin = (id: string, creator: string) => {
    setJoined((prev) => new Set([...prev, id]));
    toast.success(`Joined ${creator}'s live stream!`);
  };

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      {/* Featured live */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="live">● LIVE</Badge>
          <span className="text-sm font-600 text-slate-300">Featured Stream</span>
        </div>
        <div
          className="relative rounded-2xl overflow-hidden cursor-pointer group"
          style={{ aspectRatio: '16/7' }}
        >
          <AppImage
            src={liveStreams[2].thumbnail}
            alt={liveStreams[2].thumbnailAlt}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-500"
            priority
            sizes="(max-width: 1200px) 100vw, 80vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)' }}
          />
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge variant="live">● LIVE</Badge>
            <span
              className="text-xs font-600 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#e2e8f0', backdropFilter: 'blur(8px)' }}
            >
              <Icon name="EyeIcon" size={12} className="inline mr-1" />
              {formatViewers(liveStreams[2].viewers)} watching
            </span>
          </div>
          <div className="absolute bottom-6 left-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-cyan-glow/50">
                <AppImage
                  src={liveStreams[2].avatar}
                  alt={`${liveStreams[2].creator} featured live stream host`}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-700 text-white">{liveStreams[2].creator}</span>
                  <Icon name="CheckBadgeIcon" size={16} className="text-cyan-glow" />
                </div>
                <p className="text-sm text-slate-300">{liveStreams[2].category} · {liveStreams[2].duration}</p>
              </div>
            </div>
            <h3 className="text-xl font-700 text-white max-w-lg">{liveStreams[2].title}</h3>
            <div className="flex items-center gap-2">
              {liveStreams[2].tags.map((tag) => (
                <span
                  key={`feat-tag-${tag}`}
                  className="text-xs font-500 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(110,231,247,0.15)', color: '#6ee7f7', backdropFilter: 'blur(8px)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <button
              onClick={() => handleJoin(liveStreams[2].id, liveStreams[2].creator)}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Icon name="PlayIcon" size={16} variant="solid" />
              {joined.has(liveStreams[2].id) ? 'Watching Now' : 'Join Stream'}
            </button>
          </div>
        </div>
      </div>

      {/* All live streams grid */}
      <div>
        <h3 className="text-base font-600 text-slate-300 mb-4">All Live Streams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {liveStreams.map((stream) => (
            <div
              key={stream.id}
              className="glass-card-hover overflow-hidden group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative" style={{ aspectRatio: '16/9' }}>
                <AppImage
                  src={stream.thumbnail}
                  alt={stream.thumbnailAlt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                  <Badge variant="live">● LIVE</Badge>
                </div>
                <div
                  className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-600 text-white"
                  style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                >
                  <Icon name="EyeIcon" size={11} />
                  {formatViewers(stream.viewers)}
                </div>
                <div className="absolute bottom-2 right-2">
                  <span
                    className="text-xs font-500 px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#94a3b8', backdropFilter: 'blur(8px)' }}
                  >
                    {stream.duration}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full overflow-hidden">
                      <AppImage
                        src={stream.avatar}
                        alt={`${stream.creator} live stream host avatar`}
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full live-badge border border-ice-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-slate-200 line-clamp-2 leading-snug">{stream.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-slate-500">{stream.creator}</span>
                      {stream.verified && <Icon name="CheckBadgeIcon" size={12} className="text-cyan-glow" />}
                      <span className="text-xs text-slate-600">·</span>
                      <span className="text-xs text-slate-500">{stream.category}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleJoin(stream.id, stream.creator)}
                  className={`w-full py-2 rounded-xl text-sm font-600 transition-all duration-150 flex items-center justify-center gap-2 ${
                    joined.has(stream.id)
                      ? 'text-cyan-glow border border-cyan-glow/30 bg-cyan-glow/08' :'text-ice-black'
                  }`}
                  style={!joined.has(stream.id) ? { background: 'linear-gradient(135deg, #6ee7f7, #a78bfa)' } : {}}
                >
                  <Icon name={joined.has(stream.id) ? 'CheckIcon' : 'PlayIcon'} size={14} variant="solid" />
                  {joined.has(stream.id) ? 'Watching' : 'Join Live'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}