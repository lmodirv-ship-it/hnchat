-- hnChat Production Functions Migration
-- Migration: 20260422160000_production_functions.sql

-- ============================================================
-- 1. FIX comments.parent_id default (should be NULL, not random UUID)
-- ============================================================
ALTER TABLE public.comments ALTER COLUMN parent_id SET DEFAULT NULL;

-- ============================================================
-- 2. create_notification function (used by service layer)
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_actor_id UUID,
    p_type TEXT,
    p_post_id UUID DEFAULT NULL,
    p_comment_id UUID DEFAULT NULL,
    p_message TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Don't notify yourself
    IF p_user_id = p_actor_id THEN
        RETURN;
    END IF;

    INSERT INTO public.notifications (
        user_id,
        actor_id,
        notification_type,
        post_id,
        comment_id,
        message
    ) VALUES (
        p_user_id,
        p_actor_id,
        p_type::public.notification_type,
        p_post_id,
        p_comment_id,
        p_message
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'create_notification failed: %', SQLERRM;
END;
$$;

-- ============================================================
-- 3. increment_follow_counts function
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_follow_counts(
    p_follower_id UUID,
    p_following_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles
    SET following_count = following_count + 1
    WHERE id = p_follower_id;

    UPDATE public.user_profiles
    SET followers_count = followers_count + 1
    WHERE id = p_following_id;
END;
$$;

-- ============================================================
-- 4. decrement_follow_counts function
-- ============================================================
CREATE OR REPLACE FUNCTION public.decrement_follow_counts(
    p_follower_id UUID,
    p_following_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.user_profiles
    SET following_count = GREATEST(following_count - 1, 0)
    WHERE id = p_follower_id;

    UPDATE public.user_profiles
    SET followers_count = GREATEST(followers_count - 1, 0)
    WHERE id = p_following_id;
END;
$$;

-- ============================================================
-- 5. increment_post_comments function
-- ============================================================
CREATE OR REPLACE FUNCTION public.increment_post_comments(post_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = post_uuid;
END;
$$;

-- ============================================================
-- 6. get_user_conversations - returns latest message per conversation
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_user_conversations(p_user_id UUID)
RETURNS TABLE(
    conversation_id TEXT,
    other_user_id UUID,
    other_username TEXT,
    other_full_name TEXT,
    other_avatar_url TEXT,
    other_is_verified BOOLEAN,
    last_message TEXT,
    last_message_at TIMESTAMPTZ,
    unread_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH ranked_messages AS (
        SELECT
            m.conversation_id,
            m.content,
            m.created_at,
            m.sender_id,
            m.receiver_id,
            ROW_NUMBER() OVER (PARTITION BY m.conversation_id ORDER BY m.created_at DESC) AS rn
        FROM public.messages m
        WHERE (m.sender_id = p_user_id OR m.receiver_id = p_user_id)
          AND m.is_deleted = false
    ),
    latest AS (
        SELECT * FROM ranked_messages WHERE rn = 1
    )
    SELECT
        l.conversation_id,
        CASE WHEN l.sender_id = p_user_id THEN l.receiver_id ELSE l.sender_id END AS other_user_id,
        up.username AS other_username,
        up.full_name AS other_full_name,
        up.avatar_url AS other_avatar_url,
        up.is_verified AS other_is_verified,
        l.content AS last_message,
        l.created_at AS last_message_at,
        (
            SELECT COUNT(*)
            FROM public.messages m2
            WHERE m2.conversation_id = l.conversation_id
              AND m2.receiver_id = p_user_id
              AND m2.msg_status != 'read'
              AND m2.is_deleted = false
        ) AS unread_count
    FROM latest l
    JOIN public.user_profiles up ON up.id = (
        CASE WHEN l.sender_id = p_user_id THEN l.receiver_id ELSE l.sender_id END
    )
    ORDER BY l.created_at DESC;
END;
$$;

-- ============================================================
-- 7. mark_messages_read function
-- ============================================================
CREATE OR REPLACE FUNCTION public.mark_messages_read(
    p_conversation_id TEXT,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.messages
    SET msg_status = 'read'::public.message_status
    WHERE conversation_id = p_conversation_id
      AND receiver_id = p_user_id
      AND msg_status != 'read';
END;
$$;

-- ============================================================
-- 8. Admin delete policy for user_profiles (if not exists)
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'user_profiles'
        AND policyname = 'Admins can delete any profile'
    ) THEN
        CREATE POLICY "Admins can delete any profile" ON public.user_profiles
        FOR DELETE TO authenticated USING (
            id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.user_profiles up
                WHERE up.id = auth.uid() AND up.is_admin = true
            )
        );
    END IF;
END $$;

-- ============================================================
-- 9. Allow authenticated users to insert notifications (for triggers)
-- ============================================================
DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;
CREATE POLICY "system_insert_notifications" ON public.notifications
FOR INSERT TO authenticated WITH CHECK (true);
