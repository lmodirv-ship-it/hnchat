-- hnChat SaaS Enhancements Migration
-- Adds notification triggers, report policies, and admin analytics

-- ============================================================
-- 1. ENSURE RLS + POLICIES FOR REPORTS
-- ============================================================
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_create_reports" ON public.reports;
CREATE POLICY "users_can_create_reports"
ON public.reports FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "users_can_view_own_reports" ON public.reports;
CREATE POLICY "users_can_view_own_reports"
ON public.reports FOR SELECT TO authenticated
USING (reporter_id = auth.uid());

DROP POLICY IF EXISTS "admin_manage_reports" ON public.reports;
CREATE POLICY "admin_manage_reports"
ON public.reports FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- ============================================================
-- 2. ENSURE RLS + POLICIES FOR NOTIFICATIONS
-- ============================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_notifications" ON public.notifications;
CREATE POLICY "users_manage_own_notifications"
ON public.notifications FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "system_insert_notifications" ON public.notifications;
CREATE POLICY "system_insert_notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);

-- ============================================================
-- 3. FUNCTION: CREATE NOTIFICATION
-- ============================================================
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type notification_type,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_message TEXT DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Don't notify yourself
  IF p_user_id = p_actor_id THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (user_id, actor_id, notification_type, post_id, comment_id, message)
  VALUES (p_user_id, p_actor_id, p_type, p_post_id, p_comment_id, p_message);
END;
$$;

-- ============================================================
-- 4. FUNCTION: GET ADMIN ANALYTICS (updated with reports)
-- ============================================================
DROP FUNCTION IF EXISTS public.get_admin_analytics();
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM public.user_profiles),
    'active_users', (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true),
    'total_posts', (SELECT COUNT(*) FROM public.posts WHERE is_published = true),
    'total_videos', (SELECT COUNT(*) FROM public.videos WHERE is_published = true),
    'total_messages', (SELECT COUNT(*) FROM public.messages WHERE is_deleted = false),
    'pending_reports', (SELECT COUNT(*) FROM public.reports WHERE status = 'pending'),
    'new_users_today', (SELECT COUNT(*) FROM public.user_profiles WHERE created_at >= CURRENT_DATE),
    'new_posts_today', (SELECT COUNT(*) FROM public.posts WHERE created_at >= CURRENT_DATE AND is_published = true)
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_likes_user_post ON public.likes(user_id, post_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower ON public.followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following ON public.followers(following_id);
