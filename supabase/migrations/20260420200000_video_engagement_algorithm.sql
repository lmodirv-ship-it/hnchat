-- hnChat — Video Engagement & Personalized Feed Algorithm
-- Migration: 20260420200000_video_engagement_algorithm.sql

-- ============================================================
-- 1. video_engagement TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.video_engagement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    watch_time INTEGER DEFAULT 0,
    liked BOOLEAN DEFAULT false,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_video_engagement_user_id ON public.video_engagement(user_id);
CREATE INDEX IF NOT EXISTS idx_video_engagement_video_id ON public.video_engagement(video_id);
CREATE INDEX IF NOT EXISTS idx_video_engagement_watch_time ON public.video_engagement(watch_time DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_engagement_unique ON public.video_engagement(user_id, video_id);

-- ============================================================
-- 3. FUNCTIONS
-- ============================================================

-- Calculate video score based on engagement metrics
-- score = (views * 1) + (likes * 3) + (comments * 5) + (shares * 4) + (avg_watch_time * 6)
CREATE OR REPLACE FUNCTION public.calculate_video_score(
    p_views INTEGER,
    p_likes INTEGER,
    p_comments INTEGER,
    p_shares INTEGER,
    p_avg_watch_time FLOAT
)
RETURNS FLOAT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN (p_views * 1.0)
         + (p_likes * 3.0)
         + (p_comments * 5.0)
         + (p_shares * 4.0)
         + (p_avg_watch_time * 6.0);
END;
$$;

-- Upsert engagement record (track watch time + completion)
CREATE OR REPLACE FUNCTION public.upsert_video_engagement(
    p_user_id UUID,
    p_video_id UUID,
    p_watch_time INTEGER,
    p_liked BOOLEAN DEFAULT false,
    p_completed BOOLEAN DEFAULT false
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.video_engagement (user_id, video_id, watch_time, liked, completed, updated_at)
    VALUES (p_user_id, p_video_id, p_watch_time, p_liked, p_completed, CURRENT_TIMESTAMP)
    ON CONFLICT (user_id, video_id)
    DO UPDATE SET
        watch_time = GREATEST(public.video_engagement.watch_time, EXCLUDED.watch_time),
        liked = EXCLUDED.liked OR public.video_engagement.liked,
        completed = EXCLUDED.completed OR public.video_engagement.completed,
        updated_at = CURRENT_TIMESTAMP;
END;
$$;

-- Get personalized feed for a user
-- Mix: 70% interests + 20% trending + 10% new/explore
CREATE OR REPLACE FUNCTION public.get_personalized_feed(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    title TEXT,
    caption TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    thumbnail_alt TEXT,
    duration INTEGER,
    tag TEXT,
    views_count INTEGER,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    is_published BOOLEAN,
    created_at TIMESTAMPTZ,
    score FLOAT,
    feed_type TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_interest_limit INTEGER;
    v_trending_limit INTEGER;
    v_explore_limit INTEGER;
BEGIN
    v_interest_limit := GREATEST(1, ROUND(p_limit * 0.7)::INTEGER);
    v_trending_limit := GREATEST(1, ROUND(p_limit * 0.2)::INTEGER);
    v_explore_limit  := GREATEST(1, p_limit - v_interest_limit - v_trending_limit);

    RETURN QUERY

    -- 70%: Interest-based (tags from liked/completed videos + followed creators)
    SELECT * FROM (
        SELECT DISTINCT ON (v.id)
            v.id, v.user_id, v.title, v.caption, v.video_url,
            v.thumbnail_url, v.thumbnail_alt, v.duration, v.tag,
            v.views_count, v.likes_count, v.comments_count, v.shares_count,
            v.is_published, v.created_at,
            public.calculate_video_score(
                v.views_count, v.likes_count, v.comments_count, v.shares_count,
                COALESCE((SELECT AVG(ve2.watch_time) FROM public.video_engagement ve2 WHERE ve2.video_id = v.id), 0)
            ) AS score,
            'interests'::TEXT AS feed_type
        FROM public.videos v
        WHERE v.is_published = true
          AND v.id NOT IN (
              SELECT ve.video_id FROM public.video_engagement ve
              WHERE ve.user_id = p_user_id AND ve.watch_time > 5
          )
          AND (
              v.tag IN (
                  SELECT DISTINCT v2.tag
                  FROM public.video_engagement ve
                  JOIN public.videos v2 ON ve.video_id = v2.id
                  WHERE ve.user_id = p_user_id
                    AND (ve.liked = true OR ve.completed = true)
                    AND v2.tag IS NOT NULL AND v2.tag != ''
              )
              OR v.user_id IN (
                  SELECT f.following_id FROM public.followers f
                  WHERE f.follower_id = p_user_id
              )
          )
        ORDER BY v.id, public.calculate_video_score(
            v.views_count, v.likes_count, v.comments_count, v.shares_count,
            COALESCE((SELECT AVG(ve2.watch_time) FROM public.video_engagement ve2 WHERE ve2.video_id = v.id), 0)
        ) DESC
        LIMIT v_interest_limit
    ) interests_sub

    UNION ALL

    -- 20%: Trending (highest score in last 7 days)
    SELECT * FROM (
        SELECT DISTINCT ON (v.id)
            v.id, v.user_id, v.title, v.caption, v.video_url,
            v.thumbnail_url, v.thumbnail_alt, v.duration, v.tag,
            v.views_count, v.likes_count, v.comments_count, v.shares_count,
            v.is_published, v.created_at,
            public.calculate_video_score(
                v.views_count, v.likes_count, v.comments_count, v.shares_count,
                COALESCE((SELECT AVG(ve2.watch_time) FROM public.video_engagement ve2 WHERE ve2.video_id = v.id), 0)
            ) AS score,
            'trending'::TEXT AS feed_type
        FROM public.videos v
        WHERE v.is_published = true
          AND v.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY v.id, public.calculate_video_score(
            v.views_count, v.likes_count, v.comments_count, v.shares_count,
            COALESCE((SELECT AVG(ve2.watch_time) FROM public.video_engagement ve2 WHERE ve2.video_id = v.id), 0)
        ) DESC
        LIMIT v_trending_limit
    ) trending_sub

    UNION ALL

    -- 10%: New/Explore (newest videos not yet seen)
    SELECT * FROM (
        SELECT DISTINCT ON (v.id)
            v.id, v.user_id, v.title, v.caption, v.video_url,
            v.thumbnail_url, v.thumbnail_alt, v.duration, v.tag,
            v.views_count, v.likes_count, v.comments_count, v.shares_count,
            v.is_published, v.created_at,
            public.calculate_video_score(
                v.views_count, v.likes_count, v.comments_count, v.shares_count,
                0
            ) AS score,
            'explore'::TEXT AS feed_type
        FROM public.videos v
        WHERE v.is_published = true
          AND v.id NOT IN (
              SELECT ve.video_id FROM public.video_engagement ve
              WHERE ve.user_id = p_user_id
          )
        ORDER BY v.id, v.created_at DESC
        LIMIT v_explore_limit
    ) explore_sub;
END;
$$;

-- Fallback: get scored feed for anonymous users (no personalization)
CREATE OR REPLACE FUNCTION public.get_scored_feed(
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    title TEXT,
    caption TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    thumbnail_alt TEXT,
    duration INTEGER,
    tag TEXT,
    views_count INTEGER,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    is_published BOOLEAN,
    created_at TIMESTAMPTZ,
    score FLOAT,
    feed_type TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        v.id, v.user_id, v.title, v.caption, v.video_url,
        v.thumbnail_url, v.thumbnail_alt, v.duration, v.tag,
        v.views_count, v.likes_count, v.comments_count, v.shares_count,
        v.is_published, v.created_at,
        public.calculate_video_score(
            v.views_count, v.likes_count, v.comments_count, v.shares_count,
            COALESCE((SELECT AVG(ve.watch_time) FROM public.video_engagement ve WHERE ve.video_id = v.id), 0)
        ) AS score,
        'trending'::TEXT AS feed_type
    FROM public.videos v
    WHERE v.is_published = true
    ORDER BY score DESC
    LIMIT p_limit;
END;
$$;

-- ============================================================
-- 4. RLS
-- ============================================================

ALTER TABLE public.video_engagement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_video_engagement" ON public.video_engagement;
CREATE POLICY "users_manage_own_video_engagement"
ON public.video_engagement
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
