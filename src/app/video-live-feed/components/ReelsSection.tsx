'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { videoService } from '@/lib/services/hnChatService';
import { useAuth } from '@/contexts/AuthContext';

function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n?.toString() || '0';
}

function formatDuration(secs: number) {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface ReelsSectionProps {
  trending?: boolean;
}

export default function ReelsSection({ trending: isTrending }: ReelsSectionProps) {
  const { user } = useAuth();
  const [videos, setVideos] = useState<any[]>([]);
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [bookmarkedVideos, setBookmarkedVideos] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Watch time tracking
  const watchStartRef = useRef<Record<string, number>>({});

  const loadVideos = useCallback(async () => {
    setLoading(true);
    try {
      let data: any[];
      if (isTrending) {
        data = await videoService.getTrending(20);
      } else {
        // Use personalized feed for non-trending view
        data = await videoService.getPersonalizedFeed(user?.id ?? null, 20);
      }
      setVideos(data);
      if (data.length > 0 && user) {
        const ids = data.map((v: any) => v.id);
        const liked = await videoService.getUserVideoLikes(ids);
        setLikedVideos(liked as Set<string>);
      }
    } catch (err: any) {
      console.log('Videos load error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isTrending, user]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  // Start tracking watch time when user hovers/clicks a video
  const handleWatchStart = (videoId: string) => {
    if (!watchStartRef.current[videoId]) {
      watchStartRef.current[videoId] = Date.now();
    }
  };

  // Stop tracking and save engagement
  const handleWatchEnd = async (videoId: string, videoDuration: number) => {
    const startTime = watchStartRef.current[videoId];
    if (!startTime) return;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    delete watchStartRef.current[videoId];
    if (elapsed < 1) return;
    const completed = videoDuration > 0 && elapsed >= videoDuration * 0.8;
    await videoService.trackEngagement(videoId, elapsed, completed);
  };

  const toggleLike = async (videoId: string) => {
    if (!user) { toast.error('Sign in to like videos'); return; }
    const isLiked = likedVideos.has(videoId);
    setLikedVideos((prev) => {
      const next = new Set(prev);
      isLiked ? next.delete(videoId) : next.add(videoId);
      return next;
    });
    setVideos((prev) => prev.map((v) =>
      v.id === videoId ? { ...v, likes_count: v.likes_count + (isLiked ? -1 : 1) } : v
    ));
    try {
      if (isLiked) {
        await videoService.unlikeVideo(videoId);
        await videoService.trackEngagementLiked(videoId, false);
      } else {
        await videoService.likeVideo(videoId);
        await videoService.trackEngagementLiked(videoId, true);
      }
    } catch {
      setLikedVideos((prev) => {
        const next = new Set(prev);
        isLiked ? next.add(videoId) : next.delete(videoId);
        return next;
      });
    }
  };

  const toggleBookmark = (videoId: string) => {
    setBookmarkedVideos((prev) => {
      const next = new Set(prev);
      next.has(videoId) ? next.delete(videoId) : next.add(videoId);
      return next;
    });
    toast.success('Saved to bookmarks');
  };

  const handleVideoClick = async (videoId: string, duration: number) => {
    handleWatchStart(videoId);
    await videoService.trackView(videoId);
    setVideos((prev) => prev.map((v) =>
      v.id === videoId ? { ...v, views_count: v.views_count + 1 } : v
    ));
    // Simulate watch end after a short delay for click-based tracking
    setTimeout(() => handleWatchEnd(videoId, duration), 3000);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={`skel-${i}`}
            className="rounded-2xl bg-white/04 animate-pulse"
            style={{ aspectRatio: '9/16' }}
          />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="glass-card p-12 text-center space-y-3">
        <Icon name="FilmIcon" size={40} className="text-slate-600 mx-auto" />
        <p className="text-slate-400 font-500">No videos yet</p>
        <p className="text-slate-600 text-sm">Be the first to upload a reel!</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
        {videos.map((video) => {
          const isLiked = likedVideos.has(video.id);
          const isBookmarked = bookmarkedVideos.has(video.id);
          const profile = video.user_profiles;
          const feedBadge = video.feed_type === 'interests'
            ? null
            : video.feed_type === 'trending' ?'🔥'
            : video.feed_type === 'explore' ?'✨'
            : null;

          return (
            <div
              key={video.id}
              className="group relative rounded-2xl overflow-hidden cursor-pointer"
              style={{ aspectRatio: '9/16', background: '#111118' }}
              onMouseEnter={() => handleWatchStart(video.id)}
              onMouseLeave={() => handleWatchEnd(video.id, video.duration)}
              onClick={() => handleVideoClick(video.id, video.duration)}
            >
              {/* Thumbnail */}
              {video.thumbnail_url ? (
                <AppImage
                  src={video.thumbnail_url}
                  alt={video.thumbnail_alt || video.caption || 'Video thumbnail'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)' }}
                >
                  <Icon name="FilmIcon" size={40} className="text-slate-600" />
                </div>
              )}

              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.1) 100%)' }}
              />

              {/* Top badges */}
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <div className="flex items-center gap-1">
                  {video.tag && (
                    <span
                      className="text-xs font-600 px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(110,231,247,0.15)', color: '#6ee7f7', backdropFilter: 'blur(8px)', border: '1px solid rgba(110,231,247,0.2)' }}
                    >
                      {video.tag}
                    </span>
                  )}
                  {feedBadge && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
                    >
                      {feedBadge}
                    </span>
                  )}
                </div>
                {video.duration > 0 && (
                  <span
                    className="text-xs font-600 px-2 py-0.5 rounded-full ml-auto"
                    style={{ background: 'rgba(0,0,0,0.5)', color: '#e2e8f0', backdropFilter: 'blur(8px)' }}
                  >
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>

              {/* Play button on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(110,231,247,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(110,231,247,0.4)' }}
                >
                  <Icon name="PlayIcon" size={24} className="text-cyan-glow" variant="solid" />
                </div>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2">
                {/* Creator */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 border border-white/20">
                    {profile?.avatar_url ? (
                      <AppImage
                        src={profile.avatar_url}
                        alt={`${profile.full_name} reel creator avatar`}
                        width={28}
                        height={28}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xs font-700 text-ice-black"
                        style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
                      >
                        {profile?.full_name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-xs font-600 text-white truncate">{profile?.full_name || 'Creator'}</span>
                    {profile?.is_verified && <Icon name="CheckBadgeIcon" size={12} className="text-cyan-glow flex-shrink-0" />}
                  </div>
                </div>

                {/* Caption */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{video.caption}</p>

                {/* Stats + Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-xs text-slate-300">
                      <Icon name="EyeIcon" size={12} />
                      {formatNum(video.views_count || 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(video.id); }}
                      className={`p-1.5 rounded-lg transition-all duration-150 ${isLiked ? 'text-red-400' : 'text-white/70 hover:text-white'}`}
                    >
                      <Icon name="HeartIcon" size={16} variant={isLiked ? 'solid' : 'outline'} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(video.id); }}
                      className={`p-1.5 rounded-lg transition-all duration-150 ${isBookmarked ? 'text-cyan-glow' : 'text-white/70 hover:text-white'}`}
                    >
                      <Icon name="BookmarkIcon" size={16} variant={isBookmarked ? 'solid' : 'outline'} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toast.success('Link copied!'); }}
                      className="p-1.5 rounded-lg text-white/70 hover:text-white transition-all duration-150"
                    >
                      <Icon name="ArrowUpTrayIcon" size={16} />
                    </button>
                  </div>
                </div>

                {/* Engagement bar */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Icon name="HeartIcon" size={11} />
                    {formatNum(video.likes_count || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="ChatBubbleOvalLeftIcon" size={11} />
                    {formatNum(video.comments_count || 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="ArrowUpTrayIcon" size={11} />
                    {formatNum(video.shares_count || 0)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}