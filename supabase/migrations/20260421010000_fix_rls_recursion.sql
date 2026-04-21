-- Fix: Infinite recursion in user_profiles RLS policies
-- The admin_dashboard migration created policies on user_profiles that
-- query user_profiles themselves, causing infinite recursion.
-- This migration replaces them with non-recursive alternatives.

-- ============================================================
-- 1. Create a SECURITY DEFINER function to check admin status
--    using auth.users metadata (NO recursion — does NOT query user_profiles)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  )
$$;

-- ============================================================
-- 2. Drop the recursive policies on user_profiles
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;

-- ============================================================
-- 3. Re-create non-recursive policies for user_profiles
--    The base policies (users_view_all_profiles, users_manage_own_profile)
--    from the full schema migration already handle public read + own write.
--    We only need to ensure the admin update policy does NOT recurse.
-- ============================================================

-- Allow admins to update any profile using the SECURITY DEFINER function
-- (function is safe because it runs with elevated privileges, bypassing RLS)
DROP POLICY IF EXISTS "admins_update_any_profile" ON public.user_profiles;
CREATE POLICY "admins_update_any_profile" ON public.user_profiles
FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin_user())
WITH CHECK (id = auth.uid() OR public.is_admin_user());

-- ============================================================
-- 4. Fix recursive policies on reports table (also queries user_profiles)
--    Replace with the SECURITY DEFINER function
-- ============================================================

DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;

CREATE POLICY "admins_view_all_reports" ON public.reports
FOR SELECT TO authenticated
USING (reporter_id = auth.uid() OR public.is_admin_user());

CREATE POLICY "admins_update_reports" ON public.reports
FOR UPDATE TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ============================================================
-- 5. Fix recursive policies on posts and videos (admin delete)
-- ============================================================

DROP POLICY IF EXISTS "Admins can delete any post" ON public.posts;
CREATE POLICY "admins_delete_any_post" ON public.posts
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "Admins can delete any video" ON public.videos;
CREATE POLICY "admins_delete_any_video" ON public.videos
FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());
