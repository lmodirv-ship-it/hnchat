-- hnChat Super App — Full Database Schema
-- Migration: 20260420185452_hnchat_full_schema.sql

-- ============================================================
-- 1. ENUM TYPES
-- ============================================================

DROP TYPE IF EXISTS public.post_type CASCADE;
CREATE TYPE public.post_type AS ENUM ('text', 'image', 'video', 'story');

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM ('like', 'comment', 'follow', 'mention', 'message', 'system');

DROP TYPE IF EXISTS public.message_status CASCADE;
CREATE TYPE public.message_status AS ENUM ('sent', 'delivered', 'read');

DROP TYPE IF EXISTS public.video_status CASCADE;
CREATE TYPE public.video_status AS ENUM ('processing', 'ready', 'failed');

-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- user_profiles: public profile data linked to auth.users
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    username TEXT UNIQUE,
    full_name TEXT NOT NULL DEFAULT '',
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    website TEXT DEFAULT '',
    location TEXT DEFAULT '',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    followers_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    posts_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- posts
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    post_type public.post_type DEFAULT 'text'::public.post_type,
    image_url TEXT DEFAULT '',
    image_alt TEXT DEFAULT '',
    tag TEXT DEFAULT '',
    tag_color TEXT DEFAULT '#00d2ff',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    bookmarks_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- comments
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- likes (polymorphic: post or comment)
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- followers
CREATE TABLE IF NOT EXISTS public.followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    conversation_id TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    image_url TEXT DEFAULT '',
    msg_status public.message_status DEFAULT 'sent'::public.message_status,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- videos
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    caption TEXT DEFAULT '',
    video_url TEXT NOT NULL DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    thumbnail_alt TEXT DEFAULT '',
    duration INTEGER DEFAULT 0,
    tag TEXT DEFAULT '',
    video_status public.video_status DEFAULT 'ready'::public.video_status,
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- video_likes
CREATE TABLE IF NOT EXISTS public.video_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- video_views
CREATE TABLE IF NOT EXISTS public.video_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    video_id UUID NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    notification_type public.notification_type NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    message TEXT DEFAULT '',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_likes_count ON public.posts(likes_count DESC);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

CREATE INDEX IF NOT EXISTS idx_likes_user_id ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON public.likes(post_id);

CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON public.followers(following_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_videos_user_id ON public.videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON public.videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_views_count ON public.videos(views_count DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- Unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_post ON public.likes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_likes_unique_comment ON public.likes(user_id, comment_id) WHERE comment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_followers_unique ON public.followers(follower_id, following_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_likes_unique ON public.video_likes(user_id, video_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique_post ON public.bookmarks(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookmarks_unique_video ON public.bookmarks(user_id, video_id) WHERE video_id IS NOT NULL;

-- ============================================================
-- 4. FUNCTIONS (before RLS policies)
-- ============================================================

-- Auto-create user_profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, username, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Increment post likes count
CREATE OR REPLACE FUNCTION public.increment_post_likes(post_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = post_uuid;
END;
$$;

-- Decrement post likes count
CREATE OR REPLACE FUNCTION public.decrement_post_likes(post_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_uuid;
END;
$$;

-- Increment video likes count
CREATE OR REPLACE FUNCTION public.increment_video_likes(video_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.videos SET likes_count = likes_count + 1 WHERE id = video_uuid;
END;
$$;

-- Decrement video likes count
CREATE OR REPLACE FUNCTION public.decrement_video_likes(video_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.videos SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = video_uuid;
END;
$$;

-- Get trending posts (recommendation algorithm)
CREATE OR REPLACE FUNCTION public.get_trending_posts(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
    id UUID,
    user_id UUID,
    content TEXT,
    post_type TEXT,
    image_url TEXT,
    image_alt TEXT,
    tag TEXT,
    tag_color TEXT,
    likes_count INTEGER,
    comments_count INTEGER,
    shares_count INTEGER,
    bookmarks_count INTEGER,
    created_at TIMESTAMPTZ,
    score FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.user_id,
        p.content,
        p.post_type::TEXT,
        p.image_url,
        p.image_alt,
        p.tag,
        p.tag_color,
        p.likes_count,
        p.comments_count,
        p.shares_count,
        p.bookmarks_count,
        p.created_at,
        (
            p.likes_count * 3.0 +
            p.comments_count * 5.0 +
            p.shares_count * 4.0 +
            p.bookmarks_count * 2.0 +
            EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p.created_at)) / -3600.0
        )::FLOAT AS score
    FROM public.posts p
    WHERE p.is_published = true
    ORDER BY score DESC
    LIMIT limit_count;
END;
$$;

-- Get conversation_id between two users (deterministic)
CREATE OR REPLACE FUNCTION public.get_conversation_id(user_a UUID, user_b UUID)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    IF user_a < user_b THEN
        RETURN user_a::TEXT || '_' || user_b::TEXT;
    ELSE
        RETURN user_b::TEXT || '_' || user_a::TEXT;
    END IF;
END;
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- user_profiles
DROP POLICY IF EXISTS "users_view_all_profiles" ON public.user_profiles;
CREATE POLICY "users_view_all_profiles" ON public.user_profiles
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile" ON public.user_profiles
FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- posts
DROP POLICY IF EXISTS "public_read_posts" ON public.posts;
CREATE POLICY "public_read_posts" ON public.posts
FOR SELECT TO public USING (is_published = true);

DROP POLICY IF EXISTS "users_manage_own_posts" ON public.posts;
CREATE POLICY "users_manage_own_posts" ON public.posts
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- comments
DROP POLICY IF EXISTS "public_read_comments" ON public.comments;
CREATE POLICY "public_read_comments" ON public.comments
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_comments" ON public.comments;
CREATE POLICY "users_manage_own_comments" ON public.comments
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- likes
DROP POLICY IF EXISTS "public_read_likes" ON public.likes;
CREATE POLICY "public_read_likes" ON public.likes
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_likes" ON public.likes;
CREATE POLICY "users_manage_own_likes" ON public.likes
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- followers
DROP POLICY IF EXISTS "public_read_followers" ON public.followers;
CREATE POLICY "public_read_followers" ON public.followers
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_follows" ON public.followers;
CREATE POLICY "users_manage_own_follows" ON public.followers
FOR ALL TO authenticated USING (follower_id = auth.uid()) WITH CHECK (follower_id = auth.uid());

-- messages
DROP POLICY IF EXISTS "users_read_own_messages" ON public.messages;
CREATE POLICY "users_read_own_messages" ON public.messages
FOR SELECT TO authenticated USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "users_send_messages" ON public.messages;
CREATE POLICY "users_send_messages" ON public.messages
FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_messages" ON public.messages;
CREATE POLICY "users_update_own_messages" ON public.messages
FOR UPDATE TO authenticated USING (sender_id = auth.uid()) WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "users_delete_own_messages" ON public.messages;
CREATE POLICY "users_delete_own_messages" ON public.messages
FOR DELETE TO authenticated USING (sender_id = auth.uid());

-- videos
DROP POLICY IF EXISTS "public_read_videos" ON public.videos;
CREATE POLICY "public_read_videos" ON public.videos
FOR SELECT TO public USING (is_published = true);

DROP POLICY IF EXISTS "users_manage_own_videos" ON public.videos;
CREATE POLICY "users_manage_own_videos" ON public.videos
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- video_likes
DROP POLICY IF EXISTS "public_read_video_likes" ON public.video_likes;
CREATE POLICY "public_read_video_likes" ON public.video_likes
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "users_manage_own_video_likes" ON public.video_likes;
CREATE POLICY "users_manage_own_video_likes" ON public.video_likes
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- video_views
DROP POLICY IF EXISTS "public_insert_video_views" ON public.video_views;
CREATE POLICY "public_insert_video_views" ON public.video_views
FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "public_read_video_views" ON public.video_views;
CREATE POLICY "public_read_video_views" ON public.video_views
FOR SELECT TO public USING (true);

-- notifications
DROP POLICY IF EXISTS "users_read_own_notifications" ON public.notifications;
CREATE POLICY "users_read_own_notifications" ON public.notifications
FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_update_own_notifications" ON public.notifications;
CREATE POLICY "users_update_own_notifications" ON public.notifications
FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;
CREATE POLICY "system_insert_notifications" ON public.notifications
FOR INSERT TO authenticated WITH CHECK (true);

-- bookmarks
DROP POLICY IF EXISTS "users_manage_own_bookmarks" ON public.bookmarks;
CREATE POLICY "users_manage_own_bookmarks" ON public.bookmarks
FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_posts_updated_at ON public.posts;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_messages_updated_at ON public.messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
CREATE TRIGGER update_videos_updated_at
    BEFORE UPDATE ON public.videos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 8. MOCK DATA
-- ============================================================

DO $$
DECLARE
    user1_uuid UUID := gen_random_uuid();
    user2_uuid UUID := gen_random_uuid();
    user3_uuid UUID := gen_random_uuid();
    user4_uuid UUID := gen_random_uuid();
    post1_uuid UUID := gen_random_uuid();
    post2_uuid UUID := gen_random_uuid();
    post3_uuid UUID := gen_random_uuid();
    post4_uuid UUID := gen_random_uuid();
    video1_uuid UUID := gen_random_uuid();
    video2_uuid UUID := gen_random_uuid();
    video3_uuid UUID := gen_random_uuid();
    conv1_id TEXT;
BEGIN
    -- Create auth users (trigger auto-creates user_profiles)
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (user1_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'sara.nova@hnchat.io', crypt('Creator@2026', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Sara Nova', 'username', 'saranvoa', 'avatar_url', 'https://i.pravatar.cc/80?img=47'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user2_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'james.orbit@hnchat.io', crypt('Shop@2026!', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'James Orbit', 'username', 'jamesorbit', 'avatar_url', 'https://i.pravatar.cc/80?img=12'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user3_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'lena.kova@hnchat.io', crypt('Lena@2026!', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Lena Kova', 'username', 'lenakova', 'avatar_url', 'https://i.pravatar.cc/80?img=32'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user4_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@hnchat.io', crypt('HnAdmin#26', gen_salt('bf', 10)), now(), now(), now(),
         jsonb_build_object('full_name', 'Marco Vega', 'username', 'marcov', 'avatar_url', 'https://i.pravatar.cc/80?img=8'),
         jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null)
    ON CONFLICT (id) DO NOTHING;

    -- Update profiles with extra data (trigger may have already created them)
    UPDATE public.user_profiles SET
        bio = 'Digital artist & NFT creator. Turning imagination into pixels ✨',
        is_verified = true,
        followers_count = 12400,
        following_count = 340,
        posts_count = 4
    WHERE id = user1_uuid;

    UPDATE public.user_profiles SET
        bio = 'Tech enthusiast & developer. Building the future one commit at a time 🚀',
        is_verified = false,
        followers_count = 3200,
        following_count = 890,
        posts_count = 3
    WHERE id = user2_uuid;

    UPDATE public.user_profiles SET
        bio = 'Adventure seeker & travel photographer 🏔️ 60+ countries explored',
        is_verified = true,
        followers_count = 28900,
        following_count = 210,
        posts_count = 2
    WHERE id = user3_uuid;

    UPDATE public.user_profiles SET
        bio = 'Full-stack developer & open source contributor. Coffee-powered ☕',
        is_verified = false,
        followers_count = 5600,
        following_count = 1200,
        posts_count = 2
    WHERE id = user4_uuid;

    -- Posts
    INSERT INTO public.posts (id, user_id, content, post_type, image_url, image_alt, tag, tag_color, likes_count, comments_count, shares_count, bookmarks_count)
    VALUES
        (post1_uuid, user1_uuid,
         'Just launched my new digital art collection on hnMarket! 🎨 Each piece is one-of-a-kind. Drop a comment if you want early access.',
         'image'::public.post_type,
         'https://picsum.photos/seed/art001/800/500',
         'Digital art collection featuring vibrant abstract geometric shapes in neon colors on dark background',
         'Art & Design', '#00d2ff', 1247, 89, 34, 156),
        (post2_uuid, user2_uuid,
         'The new hnChat video editor is 🔥🔥 Just edited a 4K reel in under 2 minutes on mobile. The AI auto-cut feature is insane.',
         'text'::public.post_type,
         '', '', 'Tech', '#9b59ff', 432, 67, 112, 44),
        (post3_uuid, user3_uuid,
         'Golden hour hits different from 3,000m above sea level. Planning my next hike — drop your recommendations below 👇',
         'image'::public.post_type,
         'https://picsum.photos/seed/hike003/800/500',
         'Breathtaking mountain landscape at golden hour with orange sky and misty valleys below',
         'Travel', '#e879f9', 3891, 213, 78, 502),
        (post4_uuid, user4_uuid,
         'POV: You shipped a feature that users actually asked for and the feedback is overwhelming 😭 Thank you all for the support!',
         'image'::public.post_type,
         'https://picsum.photos/seed/dev004/800/420',
         'Developer workspace with multiple monitors showing code and analytics dashboards',
         'Dev Life', '#f59e0b', 887, 144, 56, 23)
    ON CONFLICT (id) DO NOTHING;

    -- Comments
    INSERT INTO public.comments (post_id, user_id, content, likes_count)
    VALUES
        (post1_uuid, user2_uuid, 'This is absolutely stunning! The color palette is perfect 🎨', 45),
        (post1_uuid, user3_uuid, 'I want early access! How do I get it?', 12),
        (post3_uuid, user1_uuid, 'Incredible shot! Which mountain range is this?', 89),
        (post3_uuid, user4_uuid, 'The lighting is perfect. What camera do you use?', 34),
        (post2_uuid, user3_uuid, 'The AI auto-cut feature saved me so much time too!', 28)
    ON CONFLICT (id) DO NOTHING;

    -- Followers
    INSERT INTO public.followers (follower_id, following_id)
    VALUES
        (user2_uuid, user1_uuid),
        (user3_uuid, user1_uuid),
        (user4_uuid, user1_uuid),
        (user1_uuid, user3_uuid),
        (user2_uuid, user3_uuid),
        (user4_uuid, user3_uuid),
        (user1_uuid, user2_uuid),
        (user3_uuid, user4_uuid)
    ON CONFLICT DO NOTHING;

    -- Videos
    INSERT INTO public.videos (id, user_id, title, caption, video_url, thumbnail_url, thumbnail_alt, duration, tag, views_count, likes_count, comments_count, shares_count)
    VALUES
        (video1_uuid, user1_uuid,
         'Creating my next NFT collection',
         'Creating my next NFT collection in real-time ✨ The process is meditative 🎨',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
         'https://picsum.photos/seed/reel1/360/640',
         'Video thumbnail showing vibrant digital art creation process with colorful brush strokes',
         47, '#DigitalArt', 2400000, 184000, 3200, 12100),
        (video2_uuid, user3_uuid,
         'Above the clouds at 4200m',
         'Above the clouds, everything makes sense 🏔️☁️ Altitude: 4,200m',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
         'https://picsum.photos/seed/reel5/360/640',
         'Video thumbnail of hiker standing on mountain summit with panoramic aerial view below',
         58, '#Adventure', 5200000, 447000, 9300, 62800),
        (video3_uuid, user2_uuid,
         'Built a full SaaS in 72 hours',
         'Built a full SaaS in 72 hours using hnChat APIs. Here is the breakdown 👨‍💻',
         'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
         'https://picsum.photos/seed/reel4/360/640',
         'Video thumbnail of developer coding on multiple monitors in dark room with neon lighting',
         154, '#TechTips', 3600000, 298000, 8700, 44200)
    ON CONFLICT (id) DO NOTHING;

    -- Messages
    conv1_id := public.get_conversation_id(user1_uuid, user2_uuid);

    INSERT INTO public.messages (sender_id, receiver_id, conversation_id, content)
    VALUES
        (user2_uuid, user1_uuid, conv1_id, 'Hey! Did you see the new hnChat update? The video editor is insane 🔥'),
        (user1_uuid, user2_uuid, conv1_id, 'Yes! I tried it this morning. The AI auto-cut feature saved me like 30 minutes on my last reel 😭'),
        (user2_uuid, user1_uuid, conv1_id, 'Same! I published 3 reels yesterday with it. Check the new artwork I uploaded to the marketplace btw 🎨'),
        (user1_uuid, user2_uuid, conv1_id, 'Just saw it — the gradient series is absolutely stunning. Are you planning a limited drop?'),
        (user2_uuid, user1_uuid, conv1_id, 'Yes! Only 12 pieces. First 12 buyers get an exclusive NFT badge on their profile 👀')
    ON CONFLICT (id) DO NOTHING;

    -- Notifications
    INSERT INTO public.notifications (user_id, actor_id, notification_type, post_id, message)
    VALUES
        (user1_uuid, user2_uuid, 'like'::public.notification_type, post1_uuid, 'James Orbit liked your post'),
        (user1_uuid, user3_uuid, 'comment'::public.notification_type, post1_uuid, 'Lena Kova commented on your post'),
        (user1_uuid, user4_uuid, 'follow'::public.notification_type, NULL, 'Marco Vega started following you'),
        (user3_uuid, user1_uuid, 'like'::public.notification_type, post3_uuid, 'Sara Nova liked your post')
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;
