-- Add is_admin column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create reports table for content moderation
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reported_user_id uuid REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reported_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE,
  reported_video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  reason text NOT NULL DEFAULT '',
  description text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Reports policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Users can create reports'
  ) THEN
    CREATE POLICY "Users can create reports" ON public.reports
      FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Admins can view all reports'
  ) THEN
    CREATE POLICY "Admins can view all reports" ON public.reports
      FOR SELECT TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Admins can update reports'
  ) THEN
    CREATE POLICY "Admins can update reports" ON public.reports
      FOR UPDATE TO authenticated USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;

-- Admin policy for user_profiles: admins can view all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Admins can view all profiles'
  ) THEN
    CREATE POLICY "Admins can view all profiles" ON public.user_profiles
      FOR SELECT TO authenticated USING (
        id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Admins can update any profile'
  ) THEN
    CREATE POLICY "Admins can update any profile" ON public.user_profiles
      FOR UPDATE TO authenticated USING (
        id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.id = auth.uid() AND up.is_admin = true
        )
      );
  END IF;
END $$;

-- Admin policy for posts: admins can delete any post
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname = 'Admins can delete any post'
  ) THEN
    CREATE POLICY "Admins can delete any post" ON public.posts
      FOR DELETE TO authenticated USING (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;

-- Admin policy for videos: admins can delete any video
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'videos' AND policyname = 'Admins can delete any video'
  ) THEN
    CREATE POLICY "Admins can delete any video" ON public.videos
      FOR DELETE TO authenticated USING (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.user_profiles
          WHERE id = auth.uid() AND is_admin = true
        )
      );
  END IF;
END $$;

-- Function to get admin analytics
CREATE OR REPLACE FUNCTION public.get_admin_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.user_profiles),
    'active_users', (SELECT COUNT(*) FROM public.user_profiles WHERE is_active = true),
    'total_posts', (SELECT COUNT(*) FROM public.posts),
    'total_videos', (SELECT COUNT(*) FROM public.videos),
    'total_messages', (SELECT COUNT(*) FROM public.messages),
    'pending_reports', (SELECT COUNT(*) FROM public.reports WHERE status = 'pending'),
    'new_users_today', (SELECT COUNT(*) FROM public.user_profiles WHERE created_at >= CURRENT_DATE),
    'new_posts_today', (SELECT COUNT(*) FROM public.posts WHERE created_at >= CURRENT_DATE)
  ) INTO result;
  RETURN result;
END;
$$;
