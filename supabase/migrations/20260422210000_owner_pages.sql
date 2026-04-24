-- Owner Pages Migration
-- Creates owner_site_settings table for site-wide configuration
-- Migration: 20260422210000_owner_pages.sql

-- ============================================================
-- 1. owner_site_settings table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.owner_site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT NOT NULL DEFAULT 'hnChat',
  site_description TEXT DEFAULT 'The next-generation social platform',
  maintenance_mode BOOLEAN DEFAULT false,
  registration_enabled BOOLEAN DEFAULT true,
  max_post_length INTEGER DEFAULT 2000,
  max_bio_length INTEGER DEFAULT 300,
  allow_guest_view BOOLEAN DEFAULT true,
  require_email_verification BOOLEAN DEFAULT false,
  default_user_role TEXT DEFAULT 'user',
  contact_email TEXT DEFAULT 'lmodirv@gmail.com',
  support_url TEXT DEFAULT 'https://hnchat.net',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. Index
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_owner_site_settings_id ON public.owner_site_settings(id);

-- ============================================================
-- 3. Enable RLS
-- ============================================================
ALTER TABLE public.owner_site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RLS Policies — only owner can read/write
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_site_settings" ON public.owner_site_settings;
CREATE POLICY "owner_full_access_site_settings"
ON public.owner_site_settings
FOR ALL
TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- Allow public read for non-sensitive fields (maintenance_mode, registration_enabled)
DROP POLICY IF EXISTS "public_read_site_settings" ON public.owner_site_settings;
CREATE POLICY "public_read_site_settings"
ON public.owner_site_settings
FOR SELECT
TO public
USING (true);

-- ============================================================
-- 5. Seed default settings row
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.owner_site_settings LIMIT 1) THEN
    INSERT INTO public.owner_site_settings (
      site_name,
      site_description,
      maintenance_mode,
      registration_enabled,
      max_post_length,
      max_bio_length,
      allow_guest_view,
      require_email_verification,
      default_user_role,
      contact_email,
      support_url
    ) VALUES (
      'hnChat',
      'The next-generation social platform',
      false,
      true,
      2000,
      300,
      true,
      false,
      'user',
      'lmodirv@gmail.com',
      'https://hnchat.net'
    );
    RAISE NOTICE 'Default site settings created';
  ELSE
    RAISE NOTICE 'Site settings already exist, skipping seed';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Failed to seed site settings: %', SQLERRM;
END $$;
