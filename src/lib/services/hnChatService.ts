'use client';

import { createClient } from '@/lib/supabase/client';

function isSchemaError(error: any): boolean {
  if (!error) return false;
  if (error.code && typeof error.code === 'string') {
    const errorClass = error.code.substring(0, 2);
    if (errorClass === '42') return true;
    if (errorClass === '23') return false;
    if (errorClass === '08') return true;
  }
  if (error.message) {
    const schemaErrorPatterns = [
      /relation.*does not exist/i,
      /column.*does not exist/i,
      /function.*does not exist/i,
      /syntax error/i,
      /type.*does not exist/i,
    ];
    return schemaErrorPatterns.some((p) => p.test(error.message));
  }
  return false;
}

// ─── POSTS ────────────────────────────────────────────────────────────────────

export const postService = {
  async getFeed(limit = 20) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user_profiles (
            id, username, full_name, avatar_url, is_verified
          )
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (isSchemaError(error)) throw error;
        console.log('Feed fetch error:', error.message);
        return [];
      }
      return data || [];
    } catch (err: any) {
      console.log('postService.getFeed error:', err.message);
      return [];
    }
  },

  async getTrending(limit = 20) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .rpc('get_trending_posts', { limit_count: limit });

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      if (!data || data.length === 0) return [];
      const userIds = [...new Set(data.map((p: any) => p.user_id))];
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url, is_verified')
        .in('id', userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      return data.map((p: any) => ({ ...p, user_profiles: profileMap[p.user_id] || null }));
    } catch (err: any) {
      console.log('postService.getTrending error:', err.message);
      return [];
    }
  },

  async createPost(content: string, imageUrl?: string, imageAlt?: string, tag?: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content,
          post_type: imageUrl ? 'image' : 'text',
          image_url: imageUrl || '',
          image_alt: imageAlt || '',
          tag: tag || '',
          tag_color: '#00d2ff',
        })
        .select(`*, user_profiles(id, username, full_name, avatar_url, is_verified)`)
        .single();

      if (error) {
        if (isSchemaError(error)) throw error;
        console.log('createPost error:', error.message);
        return null;
      }
      return data;
    } catch (err: any) {
      console.log('postService.createPost error:', err.message);
      throw err;
    }
  },

  async likePost(postId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('likes')
        .insert({ user_id: user.id, post_id: postId });

      if (!error) {
        await supabase.rpc('increment_post_likes', { post_uuid: postId });
      }
      return !error;
    } catch (err: any) {
      console.log('postService.likePost error:', err.message);
      return false;
    }
  },

  async unlikePost(postId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (!error) {
        await supabase.rpc('decrement_post_likes', { post_uuid: postId });
      }
      return !error;
    } catch (err: any) {
      console.log('postService.unlikePost error:', err.message);
      return false;
    }
  },

  async getUserLikes(postIds: string[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || postIds.length === 0) return new Set<string>();

    try {
      const { data } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      return new Set((data || []).map((l: any) => l.post_id));
    } catch {
      return new Set<string>();
    }
  },

  async bookmarkPost(postId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, post_id: postId });
      return !error;
    } catch {
      return false;
    }
  },

  async unbookmarkPost(postId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);
      return !error;
    } catch {
      return false;
    }
  },

  async getUserBookmarks(postIds: string[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || postIds.length === 0) return new Set<string>();

    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      return new Set((data || []).map((b: any) => b.post_id));
    } catch {
      return new Set<string>();
    }
  },

  async getComments(postId: string) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`*, user_profiles(id, username, full_name, avatar_url, is_verified)`)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  async addComment(postId: string, content: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, user_id: user.id, content })
        .select(`*, user_profiles(id, username, full_name, avatar_url, is_verified)`)
        .single();

      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }

      // Increment comments count using raw SQL via RPC-style update
      await supabase
        .from('posts')
        .update({ comments_count: (await supabase.from('posts').select('comments_count').eq('id', postId).single()).data?.comments_count + 1 || 1 })
        .eq('id', postId);

      return data;
    } catch (err: any) {
      console.log('postService.addComment error:', err.message);
      return null;
    }
  },
};

// ─── VIDEOS ───────────────────────────────────────────────────────────────────

export const videoService = {
  async getReels(limit = 20) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`*, user_profiles(id, username, full_name, avatar_url, is_verified)`)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  async getTrending(limit = 20) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`*, user_profiles(id, username, full_name, avatar_url, is_verified)`)
        .eq('is_published', true)
        .order('views_count', { ascending: false })
        .limit(limit);

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  // Personalized feed: 70% interests + 20% trending + 10% explore
  async getPersonalizedFeed(userId: string | null, limit = 20) {
    const supabase = createClient();
    try {
      if (userId) {
        const { data, error } = await supabase
          .rpc('get_personalized_feed', { p_user_id: userId, p_limit: limit });

        if (!error && data && data.length > 0) {
          const videoIds = data.map((v: any) => v.id);
          const { data: profiles } = await supabase
            .from('videos')
            .select('id, user_profiles(id, username, full_name, avatar_url, is_verified)')
            .in('id', videoIds);

          const profileMap = Object.fromEntries(
            (profiles || []).map((v: any) => [v.id, v.user_profiles])
          );

          return data.map((v: any) => ({
            ...v,
            user_profiles: profileMap[v.id] || null,
          }));
        }
      }

      // Fallback: scored feed for anonymous or when personalized returns empty
      const { data: scoredData, error: scoredError } = await supabase
        .rpc('get_scored_feed', { p_limit: limit });

      if (!scoredError && scoredData && scoredData.length > 0) {
        const videoIds = scoredData.map((v: any) => v.id);
        const { data: profiles } = await supabase
          .from('videos')
          .select('id, user_profiles(id, username, full_name, avatar_url, is_verified)')
          .in('id', videoIds);

        const profileMap = Object.fromEntries(
          (profiles || []).map((v: any) => [v.id, v.user_profiles])
        );

        return scoredData.map((v: any) => ({
          ...v,
          user_profiles: profileMap[v.id] || null,
        }));
      }

      // Final fallback: plain fetch
      return await videoService.getReels(limit);
    } catch (err: any) {
      console.log('videoService.getPersonalizedFeed error:', err.message);
      return await videoService.getReels(limit);
    }
  },

  // Track engagement: watch time + completion
  async trackEngagement(videoId: string, watchTime: number, completed = false) {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('upsert_video_engagement', {
        p_user_id: user.id,
        p_video_id: videoId,
        p_watch_time: watchTime,
        p_liked: false,
        p_completed: completed,
      });
    } catch {
      // Silent fail
    }
  },

  // Track engagement with liked flag
  async trackEngagementLiked(videoId: string, liked: boolean) {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.rpc('upsert_video_engagement', {
        p_user_id: user.id,
        p_video_id: videoId,
        p_watch_time: 0,
        p_liked: liked,
        p_completed: false,
      });
    } catch {
      // Silent fail
    }
  },

  async likeVideo(videoId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('video_likes')
        .insert({ user_id: user.id, video_id: videoId });

      if (!error) {
        await supabase.rpc('increment_video_likes', { video_uuid: videoId });
      }
      return !error;
    } catch {
      return false;
    }
  },

  async unlikeVideo(videoId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { error } = await supabase
        .from('video_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('video_id', videoId);

      if (!error) {
        await supabase.rpc('decrement_video_likes', { video_uuid: videoId });
      }
      return !error;
    } catch {
      return false;
    }
  },

  async getUserVideoLikes(videoIds: string[]) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || videoIds.length === 0) return new Set<string>();

    try {
      const { data } = await supabase
        .from('video_likes')
        .select('video_id')
        .eq('user_id', user.id)
        .in('video_id', videoIds);

      return new Set((data || []).map((l: any) => l.video_id));
    } catch {
      return new Set<string>();
    }
  },

  async trackView(videoId: string) {
    const supabase = createClient();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('video_views').insert({
        video_id: videoId,
        user_id: user?.id || null,
      });
      // Increment views_count directly
      const { data: vid } = await supabase
        .from('videos')
        .select('views_count')
        .eq('id', videoId)
        .single();
      if (vid) {
        await supabase
          .from('videos')
          .update({ views_count: (vid.views_count || 0) + 1 })
          .eq('id', videoId);
      }
    } catch {
      // Silent fail for view tracking
    }
  },

  async uploadVideo(file: File, metadata: {
    title: string;
    caption: string;
    tag: string;
    thumbnailUrl?: string;
    thumbnailAlt?: string;
  }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName);

      const { data, error } = await supabase
        .from('videos')
        .insert({
          user_id: user.id,
          title: metadata.title,
          caption: metadata.caption,
          video_url: publicUrl,
          thumbnail_url: metadata.thumbnailUrl || '',
          thumbnail_alt: metadata.thumbnailAlt || '',
          tag: metadata.tag,
          video_status: 'ready',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.log('videoService.uploadVideo error:', err.message);
      throw err;
    }
  },
};

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

export const messageService = {
  async getConversations() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, conversation_id, content, created_at, sender_id, receiver_id,
          sender:user_profiles!messages_sender_id_fkey(id, username, full_name, avatar_url, is_verified),
          receiver:user_profiles!messages_receiver_id_fkey(id, username, full_name, avatar_url, is_verified)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }

      const convMap = new Map<string, any>();
      for (const msg of (data || [])) {
        if (!convMap.has(msg.conversation_id)) {
          convMap.set(msg.conversation_id, msg);
        }
      }
      return Array.from(convMap.values());
    } catch (err: any) {
      console.log('messageService.getConversations error:', err.message);
      return [];
    }
  },

  async getMessages(conversationId: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  async sendMessage(receiverId: string, content: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const { data: convIdData } = await supabase
        .rpc('get_conversation_id', { user_a: user.id, user_b: receiverId });

      const conversationId = convIdData as string;

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          conversation_id: conversationId,
          content,
        })
        .select(`
          *,
          sender:user_profiles!messages_sender_id_fkey(id, username, full_name, avatar_url)
        `)
        .single();

      if (error) {
        if (isSchemaError(error)) throw error;
        return null;
      }
      return data;
    } catch (err: any) {
      console.log('messageService.sendMessage error:', err.message);
      throw err;
    }
  },

  subscribeToConversation(conversationId: string, onMessage: (msg: any) => void) {
    const supabase = createClient();
    const channel = supabase
      .channel(`conv_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => onMessage(payload.new)
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

export const notificationService = {
  async getNotifications() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:user_profiles!notifications_actor_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        if (isSchemaError(error)) throw error;
        return [];
      }
      return data || [];
    } catch {
      return [];
    }
  },

  async markAllRead() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
  },
};
