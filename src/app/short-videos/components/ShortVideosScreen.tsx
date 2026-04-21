'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import { videoService } from '@/lib/services/hnChatService';
import { useAuth } from '@/contexts/AuthContext';

interface VideoItem {
  id: string;
  user_profiles?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
    is_verified: boolean;
  };
  caption: string;
  tag: string;
  duration: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  thumbnail_url: string;
  feed_type?: string;
}

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

// Loading skeleton for video
function VideoSkeleton() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-pulse">
      <div className="w-full h-full rounded-none lg:rounded-3xl"
        style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.06), rgba(155,89,255,0.06))' }}>
        <div className="absolute bottom-24 left-4 right-16 space-y-2">
          <div className="h-3 rounded-full w-24" style={{ background: 'rgba(255,255,255,0.1)' }} />
          <div className="h-4 rounded-full w-48" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-3 rounded-full w-36" style={{ background: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </div>
  );
}

export default function ShortVideosScreen() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState(0);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const watchStartRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadVideos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await videoService.getPersonalizedFeed(user?.id ?? null, 20);
      setVideos(data);
      if (data.length > 0 && user) {
        const ids = data.map((v: any) => v.id);
        const likedSet = await videoService.getUserVideoLikes(ids);
        setLiked(likedSet as Set<string>);
      }
    } catch (err: any) {
      setError('Failed to load videos. Pull to refresh.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  useEffect(() => {
    if (videos.length === 0) return;
    const currentVideo = videos[activeVideo];
    if (!currentVideo) return;
    watchStartRef.current = Date.now();
    return () => {
      if (watchStartRef.current && currentVideo) {
        const elapsed = Math.round((Date.now() - watchStartRef.current) / 1000);
        watchStartRef.current = null;
        if (elapsed >= 1) {
          const completed = currentVideo.duration > 0 && elapsed >= currentVideo.duration * 0.8;
          videoService.trackEngagement(currentVideo.id, elapsed, completed);
        }
      }
    };
  }, [activeVideo, videos]);

  const toggleLike = async (videoId: string) => {
    if (!user) return;
    const isLiked = liked.has(videoId);
    setLiked(prev => { const n = new Set(prev); isLiked ? n.delete(videoId) : n.add(videoId); return n; });
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, likes_count: v.likes_count + (isLiked ? -1 : 1) } : v));
    if (isLiked) { await videoService.unlikeVideo(videoId); await videoService.trackEngagementLiked(videoId, false); }
    else { await videoService.likeVideo(videoId); await videoService.trackEngagementLiked(videoId, true); }
  };

  const toggleSave = (videoId: string) => {
    setSaved(prev => { const n = new Set(prev); n.has(videoId) ? n.delete(videoId) : n.add(videoId); return n; });
  };

  const toggleFollow = (userId: string) => {
    setFollowing(prev => { const n = new Set(prev); n.has(userId) ? n.delete(userId) : n.add(userId); return n; });
  };

  const handleVideoChange = async (newIndex: number) => {
    if (newIndex < 0 || newIndex >= videos.length) return;
    const currentVideo = videos[activeVideo];
    if (currentVideo && watchStartRef.current) {
      const elapsed = Math.round((Date.now() - watchStartRef.current) / 1000);
      if (elapsed >= 1) {
        const completed = currentVideo.duration > 0 && elapsed >= currentVideo.duration * 0.8;
        await videoService.trackEngagement(currentVideo.id, elapsed, completed);
      }
    }
    watchStartRef.current = Date.now();
    await videoService.trackView(videos[newIndex]?.id);
    setActiveVideo(newIndex);
    setSwipeOffset(0);
  };

  // Touch swipe handlers for TikTok-like vertical scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
    setTouchEnd(null);
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const current = e.targetTouches[0].clientY;
    setTouchEnd(current);
    const diff = touchStart - current;
    // Resistance at edges
    if ((diff > 0 && activeVideo === videos.length - 1) || (diff < 0 && activeVideo === 0)) {
      setSwipeOffset(diff * 0.2);
    } else {
      setSwipeOffset(diff * 0.4);
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
    setSwipeOffset(0);
    if (touchStart === null || touchEnd === null) return;
    const diff = touchStart - touchEnd;
    const minSwipe = 60;
    if (diff > minSwipe) handleVideoChange(activeVideo + 1);
    else if (diff < -minSwipe) handleVideoChange(activeVideo - 1);
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (loading) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full bg-black items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)' }}>
            <Icon name="ExclamationTriangleIcon" size={28} className="text-red-400" />
          </div>
          <p className="text-slate-300 font-600">{error}</p>
          <button onClick={loadVideos}
            className="px-6 py-3 rounded-2xl font-600 text-sm transition-all duration-200 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-full bg-black items-center justify-center px-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)' }}>
            <Icon name="FilmIcon" size={28} className="text-cyan-400" />
          </div>
          <p className="text-white font-700 text-lg">No videos yet</p>
          <p className="text-slate-500 text-sm">Be the first to upload a video!</p>
          <button className="px-6 py-3 rounded-2xl font-600 text-sm"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
            Upload Video
          </button>
        </div>
      </div>
    );
  }

  const video = videos[activeVideo];
  const profile = video?.user_profiles;
  const feedLabel = video?.feed_type === 'trending' ? '🔥 Trending' : video?.feed_type === 'explore' ? '✨ Explore' : '💎 For You';

  return (
    <div className="flex h-full bg-black overflow-hidden">
      {/* ===== MOBILE: Full-screen TikTok layout ===== */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ touchAction: 'none' }}
      >
        {/* Full-screen video background */}
        <div
          className="absolute inset-0 transition-transform"
          style={{
            transform: `translateY(${-swipeOffset}px)`,
            transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
        >
          {/* Gradient background simulating video */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-950 via-blue-950 to-violet-950" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 40%, rgba(0,210,255,0.12) 0%, transparent 60%)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 60%, rgba(155,89,255,0.12) 0%, transparent 60%)' }} />

          {/* Video placeholder center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-800"
                style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.3), rgba(155,89,255,0.3))', border: '2px solid rgba(0,210,255,0.4)' }}>
                {profile?.full_name?.[0] || 'V'}
              </div>
              <button className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 mx-auto"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '2px solid rgba(255,255,255,0.3)' }}>
                <Icon name="PlayIcon" size={28} className="text-white ml-1" />
              </button>
            </div>
          </div>

          {/* Top gradient overlay */}
          <div className="absolute top-0 left-0 right-0 h-32"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-64"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="text-xs font-600 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.5)', color: '#00d2ff', backdropFilter: 'blur(8px)', border: '1px solid rgba(0,210,255,0.2)' }}>
              {feedLabel}
            </span>
            {video.duration > 0 && (
              <span className="text-xs font-600 px-2 py-1 rounded-lg text-white"
                style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
                {formatDuration(video.duration)}
              </span>
            )}
          </div>

          {/* Right action bar — TikTok style */}
          <div className="absolute right-3 bottom-28 lg:bottom-24 flex flex-col gap-5 z-20">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-700 relative"
                style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', border: '2px solid white' }}>
                {profile?.full_name?.[0] || 'U'}
                {profile?.id && (
                  <button onClick={() => toggleFollow(profile.id)}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: following.has(profile.id) ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #00d2ff, #9b59ff)', border: '1.5px solid white' }}>
                    <Icon name={following.has(profile.id) ? 'CheckIcon' : 'PlusIcon'} size={10} className="text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Like */}
            <button onClick={() => toggleLike(video.id)} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
                style={{ background: liked.has(video.id) ? 'rgba(255,77,109,0.3)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                <Icon name="HeartIcon" size={26} className={liked.has(video.id) ? 'text-red-400' : 'text-white'} />
              </div>
              <span className="text-white text-xs font-700">{formatNum(video.likes_count || 0)}</span>
            </button>

            {/* Comment */}
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                <Icon name="ChatBubbleOvalLeftIcon" size={26} className="text-white" />
              </div>
              <span className="text-white text-xs font-700">{formatNum(video.comments_count || 0)}</span>
            </button>

            {/* Save */}
            <button onClick={() => toggleSave(video.id)} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
                style={{ background: saved.has(video.id) ? 'rgba(0,210,255,0.3)' : 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                <Icon name="BookmarkIcon" size={26} className={saved.has(video.id) ? 'text-cyan-400' : 'text-white'} />
              </div>
              <span className="text-white text-xs font-700">Save</span>
            </button>

            {/* Share */}
            <button className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                <Icon name="ShareIcon" size={26} className="text-white" />
              </div>
              <span className="text-white text-xs font-700">Share</span>
            </button>
          </div>

          {/* Bottom info — TikTok style */}
          <div className="absolute bottom-20 lg:bottom-16 left-4 right-16 z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-700 text-sm">{profile?.full_name || 'Creator'}</span>
              {profile?.is_verified && <Icon name="CheckBadgeIcon" size={14} className="text-cyan-400" />}
              <span className="text-white/50 text-xs">@{profile?.username || 'user'}</span>
            </div>
            <p className="text-white/90 text-sm leading-relaxed mb-2 line-clamp-2">{video.caption}</p>
            {video.tag && (
              <span className="text-sm font-600" style={{ color: '#00d2ff' }}>#{video.tag}</span>
            )}
          </div>

          {/* Swipe hint dots */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
            {videos.slice(Math.max(0, activeVideo - 2), Math.min(videos.length, activeVideo + 3)).map((_, i) => {
              const realIndex = Math.max(0, activeVideo - 2) + i;
              return (
                <div key={realIndex}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: realIndex === activeVideo ? 3 : 2,
                    height: realIndex === activeVideo ? 16 : 6,
                    background: realIndex === activeVideo ? '#00d2ff' : 'rgba(255,255,255,0.3)',
                  }} />
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== DESKTOP: Right Panel — Video List ===== */}
      <div className="hidden xl:flex flex-col w-72 border-l overflow-y-auto" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(5,5,8,0.95)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h2 className="font-700 gradient-text text-lg">🎬 Short Videos</h2>
          <p className="text-slate-500 text-xs mt-0.5">Personalized · {videos.length} videos</p>
        </div>
        <div className="p-3">
          <button className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
            <Icon name="PlusCircleIcon" size={16} />
            Upload Video
          </button>
        </div>
        <div className="flex-1 p-3 space-y-2">
          {videos.map((v, i) => (
            <button key={v.id} onClick={() => handleVideoChange(i)}
              className={`w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-200 text-left ${activeVideo === i ? 'glass-card' : 'hover:bg-white/04'}`}>
              <div className="w-12 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-700 bg-gradient-to-br from-cyan-900 to-violet-950">
                {v.user_profiles?.full_name?.[0] || 'V'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-xs font-600 truncate">{v.user_profiles?.full_name || 'Creator'}</p>
                <p className="text-slate-500 text-xs truncate mt-0.5">{v.caption?.slice(0, 40)}...</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs" style={{ color: '#00d2ff' }}>❤ {formatNum(v.likes_count || 0)}</span>
                  {v.duration > 0 && <span className="text-slate-600 text-xs">{formatDuration(v.duration)}</span>}
                  {v.feed_type === 'trending' && <span className="text-xs">🔥</span>}
                </div>
              </div>
              {activeVideo === i && (
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#00d2ff', boxShadow: '0 0 6px #00d2ff' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
