'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import { postService } from '@/lib/services/hnChatService';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { trackFunnelStep } from '@/lib/analytics';

function formatNum(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n?.toString() || '0';
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} days ago`;
}

// Lazy-loaded post image with blur-up effect
function LazyPostImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className="relative w-full rounded-xl overflow-hidden" style={{ aspectRatio: '16/9', background: 'rgba(255,255,255,0.04)' }}>
      {inView && (
        <AppImage
          src={src}
          alt={alt}
          fill
          className="object-cover transition-opacity duration-500"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          sizes="(max-width: 768px) 100vw, 600px"
        />
      )}
      {(!inView || !loaded) && (
        <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
      )}
    </div>
  );
}

// Post skeleton loader
function PostSkeleton() {
  return (
    <div className="glass-card p-4 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded-full w-32" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="h-2.5 rounded-full w-20" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-3 rounded-full w-4/5" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-3 rounded-full w-3/5" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
      <div className="h-40 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="flex gap-4">
        <div className="h-8 rounded-xl w-16" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-8 rounded-xl w-16" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-8 rounded-xl w-16" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function PostFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [feedError, setFeedError] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadFeed = useCallback(async (pageNum = 0, append = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);
    setFeedError(null);
    try {
      const data = await postService.getFeed(PAGE_SIZE * (pageNum + 1));
      const sliced = data.slice(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE);
      if (sliced.length < PAGE_SIZE) setHasMore(false);
      if (append) {
        setPosts((prev) => [...prev, ...sliced]);
      } else {
        setPosts(sliced);
        if (sliced.length > 0) {
          const ids = sliced.map((p: any) => p.id);
          const [liked, bookmarked] = await Promise.all([
            postService.getUserLikes(ids),
            postService.getUserBookmarks(ids),
          ]);
          setLikedPosts(liked as Set<string>);
          setBookmarkedPosts(bookmarked as Set<string>);
        }
      }
    } catch (err: any) {
      setFeedError('Failed to load feed. Tap to retry.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(0, false);
    const supabase = createClient();
    const channel = supabase
      .channel('posts_feed')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
        const { data } = await supabase
          .from('posts')
          .select(`*, user_profiles(id, username, full_name, avatar_url, is_verified)`)
          .eq('id', payload.new.id)
          .single();
        if (data) setPosts((prev) => [data, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadFeed]);

  // Infinite scroll observer
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadFeed(nextPage, true);
        }
      },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, loadFeed]);

  const toggleLike = async (postId: string) => {
    if (!user) { toast.error('Sign in to like posts'); return; }
    const isLiked = likedPosts.has(postId);
    setLikedPosts((prev) => { const next = new Set(prev); isLiked ? next.delete(postId) : next.add(postId); return next; });
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? -1 : 1) } : p));
    if (!isLiked) trackFunnelStep('like', { post_id: postId });
    try {
      if (isLiked) await postService.unlikePost(postId);
      else await postService.likePost(postId);
    } catch {
      setLikedPosts((prev) => { const next = new Set(prev); isLiked ? next.add(postId) : next.delete(postId); return next; });
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + (isLiked ? 1 : -1) } : p));
    }
  };

  const toggleBookmark = async (postId: string) => {
    if (!user) { toast.error('Sign in to bookmark posts'); return; }
    const isBookmarked = bookmarkedPosts.has(postId);
    setBookmarkedPosts((prev) => { const next = new Set(prev); isBookmarked ? next.delete(postId) : next.add(postId); return next; });
    try {
      if (isBookmarked) { await postService.unbookmarkPost(postId); toast.success('Removed from bookmarks'); }
      else { await postService.bookmarkPost(postId); toast.success('Post saved to bookmarks'); }
    } catch {
      setBookmarkedPosts((prev) => { const next = new Set(prev); isBookmarked ? next.add(postId) : next.delete(postId); return next; });
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    if (!user) { toast.error('Sign in to post'); return; }
    setPublishing(true);
    try {
      const created = await postService.createPost(newPost.trim());
      if (created) { setPosts((prev) => [created, ...prev]); setNewPost(''); toast.success('Post published successfully!'); }
    } catch (err: any) {
      toast.error(err.message || 'Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  const handleComment = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;
    if (!user) { toast.error('Sign in to comment'); return; }
    try {
      await postService.addComment(postId, content);
      setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
      toast.success('Comment added!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add comment');
    }
  };

  const currentUserInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <Toaster position="bottom-right" theme="dark" />

      {/* Create post */}
      <div
        className="glass-card diamond-shimmer p-4 lg:p-5 space-y-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,210,255,0.04) 0%, rgba(255,255,255,0.03) 50%, rgba(155,89,255,0.04) 100%)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl flex items-center justify-center text-sm font-700 text-ice-black flex-shrink-0 mt-0.5"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', boxShadow: '0 0 16px rgba(0,210,255,0.35)' }}
          >
            {currentUserInitial}
          </div>
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something extraordinary..."
            rows={2}
            className="input-glass flex-1 resize-none text-sm"
            style={{ borderRadius: 14, minHeight: 64 }}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {[
              { icon: 'PhotoIcon', label: 'Photo' },
              { icon: 'VideoCameraIcon', label: 'Video' },
              { icon: 'FaceSmileIcon', label: 'Emoji' },
            ].map((action) => (
              <button
                key={action.label}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-500 text-slate-500 hover:text-slate-300 transition-colors hover:bg-white/04"
              >
                <Icon name={action.icon as any} size={15} />
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handlePost}
            disabled={!newPost.trim() || publishing}
            className="btn-primary text-xs px-4 py-2 disabled:opacity-40 flex items-center gap-1.5"
          >
            {publishing ? (
              <><div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />Posting...</>
            ) : (
              <><Icon name="PaperAirplaneIcon" size={13} />Post</>
            )}
          </button>
        </div>
      </div>

      {/* Feed error state */}
      {feedError && (
        <div className="glass-card p-5 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.2)' }}>
            <Icon name="ExclamationTriangleIcon" size={22} className="text-red-400" />
          </div>
          <p className="text-slate-400 text-sm">{feedError}</p>
          <button onClick={() => loadFeed(0, false)}
            className="px-5 py-2.5 rounded-xl font-600 text-sm transition-all duration-200 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !feedError && posts.length === 0 && (
        <div className="glass-card p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(0,210,255,0.08)', border: '1px solid rgba(0,210,255,0.15)' }}>
            <Icon name="NewspaperIcon" size={28} className="text-cyan-400" />
          </div>
          <div>
            <p className="text-white font-700 text-lg">Your feed is empty</p>
            <p className="text-slate-500 text-sm mt-1">Follow creators or be the first to post something!</p>
          </div>
          <button className="px-6 py-3 rounded-2xl font-600 text-sm"
            style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)', color: '#050508' }}>
            Discover Creators
          </button>
        </div>
      )}

      {/* Posts */}
      {!loading && posts.map((post) => {
        const profile = post.user_profiles;
        const isLiked = likedPosts.has(post.id);
        const isBookmarked = bookmarkedPosts.has(post.id);
        const commentsOpen = showComments[post.id];

        return (
          <article
            key={post.id}
            className="glass-card overflow-hidden transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            {/* Post header */}
            <div className="flex items-start gap-3 p-4 lg:p-5">
              <div
                className="w-9 h-9 lg:w-10 lg:h-10 rounded-2xl flex items-center justify-center text-sm font-700 text-ice-black flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
              >
                {profile?.full_name?.[0] || profile?.username?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-700 text-slate-200 truncate">{profile?.full_name || 'Anonymous'}</span>
                  {profile?.is_verified && (
                    <Icon name="CheckBadgeIcon" size={14} className="text-cyan-400 flex-shrink-0" />
                  )}
                  <span className="text-xs text-slate-600 truncate">@{profile?.username || 'user'}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{post.created_at ? timeAgo(post.created_at) : ''}</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-white/05 transition-colors flex-shrink-0">
                <Icon name="EllipsisHorizontalIcon" size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Post content */}
            <div className="px-4 lg:px-5 pb-3">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post image */}
            {post.image_url && (
              <div className="px-4 lg:px-5 pb-3">
                <LazyPostImage src={post.image_url} alt={`Post by ${profile?.full_name || 'user'}`} />
              </div>
            )}

            {/* Post actions */}
            <div className="flex items-center gap-1 px-3 lg:px-4 pb-3 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-600 transition-all duration-200 active:scale-95 ${isLiked ? 'text-red-400' : 'text-slate-500 hover:text-slate-300'}`}
                style={isLiked ? { background: 'rgba(255,77,109,0.1)' } : { background: 'transparent' }}
              >
                <Icon name="HeartIcon" size={15} />
                <span>{formatNum(post.likes_count || 0)}</span>
              </button>
              <button
                onClick={() => setShowComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }))}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-600 text-slate-500 hover:text-slate-300 transition-all duration-200"
              >
                <Icon name="ChatBubbleOvalLeftIcon" size={15} />
                <span>{formatNum(post.comments_count || 0)}</span>
              </button>
              <button
                onClick={() => toggleBookmark(post.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-600 transition-all duration-200 active:scale-95 ${isBookmarked ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                style={isBookmarked ? { background: 'rgba(0,210,255,0.08)' } : {}}
              >
                <Icon name="BookmarkIcon" size={15} />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-600 text-slate-500 hover:text-slate-300 transition-all duration-200 ml-auto">
                <Icon name="ShareIcon" size={15} />
              </button>
            </div>

            {/* Comment input */}
            {commentsOpen && (
              <div className="px-4 lg:px-5 pb-4 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleComment(post.id); }}
                    placeholder="Write a comment..."
                    className="input-glass flex-1 text-xs py-2.5"
                    style={{ borderRadius: 12 }}
                  />
                  <button
                    onClick={() => handleComment(post.id)}
                    disabled={!commentInputs[post.id]?.trim()}
                    className="p-2.5 rounded-xl transition-all duration-200 disabled:opacity-40 active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #00d2ff, #9b59ff)' }}
                  >
                    <Icon name="PaperAirplaneIcon" size={14} className="text-black" />
                  </button>
                </div>
              </div>
            )}
          </article>
        );
      })}

      {/* Load more trigger */}
      <div ref={loaderRef} className="py-4 flex justify-center">
        {loadingMore && (
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            Loading more...
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-slate-600 text-xs">You've seen everything 🎉</p>
        )}
      </div>
    </>
  );
}