-- User Preferences Migration
-- Adds user_preferences table for notification, content filter, and privacy settings

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    -- Notification preferences
    notif_likes BOOLEAN DEFAULT true,
    notif_comments BOOLEAN DEFAULT true,
    notif_follows BOOLEAN DEFAULT true,
    notif_messages BOOLEAN DEFAULT true,
    notif_trending BOOLEAN DEFAULT true,
    notif_fomo BOOLEAN DEFAULT false,
    notif_frequency TEXT DEFAULT 'realtime' CHECK (notif_frequency IN ('realtime', 'hourly', 'daily', 'weekly', 'never')),
    notif_quiet_hours_start INTEGER DEFAULT 23 CHECK (notif_quiet_hours_start >= 0 AND notif_quiet_hours_start <= 23),
    notif_quiet_hours_end INTEGER DEFAULT 8 CHECK (notif_quiet_hours_end >= 0 AND notif_quiet_hours_end <= 23),
    -- Content filter preferences
    filter_nsfw BOOLEAN DEFAULT true,
    filter_violence BOOLEAN DEFAULT true,
    filter_spam BOOLEAN DEFAULT true,
    content_language TEXT DEFAULT 'all',
    content_categories TEXT[] DEFAULT ARRAY['videos', 'posts', 'stories', 'live']::TEXT[],
    show_trending BOOLEAN DEFAULT true,
    show_suggested_users BOOLEAN DEFAULT true,
    -- Privacy settings
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'followers', 'private')),
    show_online_status BOOLEAN DEFAULT true,
    show_read_receipts BOOLEAN DEFAULT true,
    allow_messages_from TEXT DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'followers', 'nobody')),
    allow_tags_from TEXT DEFAULT 'everyone' CHECK (allow_tags_from IN ('everyone', 'followers', 'nobody')),
    data_analytics BOOLEAN DEFAULT true,
    personalized_ads BOOLEAN DEFAULT true,
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_preferences_updated_at();

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_manage_own_preferences" ON public.user_preferences;
CREATE POLICY "users_manage_own_preferences"
ON public.user_preferences
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
