'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

const stories = [
  { id: 'story-001', user: 'You', avatar: '', initials: 'A', seen: false, isOwn: true, color: 'linear-gradient(135deg, #00d2ff, #9b59ff)' },
  { id: 'story-002', user: 'Sara Nova', avatar: 'https://i.pravatar.cc/80?img=47', initials: 'SN', seen: false, isOwn: false, color: '' },
  { id: 'story-003', user: 'James Orbit', avatar: 'https://i.pravatar.cc/80?img=12', initials: 'JO', seen: false, isOwn: false, color: '' },
  { id: 'story-004', user: 'Lena Kova', avatar: 'https://i.pravatar.cc/80?img=32', initials: 'LK', seen: true, isOwn: false, color: '' },
  { id: 'story-005', user: 'Marco V.', avatar: 'https://i.pravatar.cc/80?img=8', initials: 'MV', seen: false, isOwn: false, color: '' },
  { id: 'story-006', user: 'Zara Moon', avatar: 'https://i.pravatar.cc/80?img=56', initials: 'ZM', seen: true, isOwn: false, color: '' },
  { id: 'story-007', user: 'Kai Renn', avatar: 'https://i.pravatar.cc/80?img=25', initials: 'KR', seen: false, isOwn: false, color: '' },
  { id: 'story-008', user: 'Nora Flux', avatar: 'https://i.pravatar.cc/80?img=44', initials: 'NF', seen: false, isOwn: false, color: '' },
];

export default function StoriesBar() {
  const [viewed, setViewed] = useState<Set<string>>(new Set(['story-004', 'story-006']));

  return (
    <div
      className="glass-card diamond-shimmer p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(0,210,255,0.03) 0%, rgba(255,255,255,0.025) 50%, rgba(155,89,255,0.03) 100%)',
      }}
    >
      <div className="flex gap-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {stories?.map((story, idx) => {
          const isSeen = viewed?.has(story?.id) || story?.seen;
          return (
            <button
              key={story?.id}
              onClick={() => setViewed((prev) => new Set([...prev, story.id]))}
              className="flex flex-col items-center gap-2 flex-shrink-0 group animate-fade-in"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              {/* Story ring */}
              <div
                className="relative rounded-full p-0.5"
                style={{
                  background: isSeen
                    ? 'rgba(255,255,255,0.1)'
                    : 'linear-gradient(135deg, #00d2ff, #9b59ff, #e879f9)',
                  boxShadow: isSeen ? 'none' : '0 0 12px rgba(0,210,255,0.3), 0 0 24px rgba(155,89,255,0.15)',
                  padding: 2.5,
                }}
              >
                {story?.isOwn ? (
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-base font-700 text-ice-black"
                      style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
                    >
                      A
                    </div>
                    <div
                      className="absolute bottom-0 right-0 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #00d2ff, #9b59ff)',
                        boxShadow: '0 0 8px rgba(0,210,255,0.5)',
                      }}
                    >
                      <Icon name="PlusIcon" size={11} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-800">
                    {story?.avatar ? (
                      <AppImage
                        src={story?.avatar}
                        alt={`${story?.user}'s story`}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-sm font-700 text-ice-black"
                        style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
                      >
                        {story?.initials}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span
                className="text-xs font-500 transition-colors duration-150 max-w-[60px] truncate"
                style={{ color: isSeen ? 'rgba(148,163,184,0.5)' : 'rgba(148,163,184,0.85)' }}
              >
                {story?.isOwn ? 'Add Story' : story?.user?.split(' ')?.[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}