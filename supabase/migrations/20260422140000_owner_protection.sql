-- Owner Protection Migration
-- Adds is_owner flag and DB-level protection for the site owner

-- 1. Add is_owner column to user_profiles
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT false;

-- 2. Create index for owner lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_owner ON public.user_profiles(is_owner);

-- 3. Function to check if current user is owner (safe, no recursion)
CREATE OR REPLACE FUNCTION public.is_site_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
  SELECT 1 FROM auth.users au
  WHERE au.id = auth.uid()
  AND au.email = 'lmodirv@gmail.com'
)
$$;

-- 4. Function to prevent owner deletion via trigger
CREATE OR REPLACE FUNCTION public.prevent_owner_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.is_owner = true THEN
    RAISE EXCEPTION 'Cannot delete the site owner account.';
  END IF;
  RETURN OLD;
END;
$$;

-- 5. Trigger on user_profiles to block owner deletion
DROP TRIGGER IF EXISTS protect_owner_from_deletion ON public.user_profiles;
CREATE TRIGGER protect_owner_from_deletion
  BEFORE DELETE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_owner_deletion();

-- 6. Function to prevent owner deactivation/demotion
CREATE OR REPLACE FUNCTION public.prevent_owner_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.is_owner = true THEN
    -- Preserve owner-critical fields
    NEW.is_owner := true;
    NEW.is_admin := true;
    NEW.is_active := true;
  END IF;
  RETURN NEW;
END;
$$;

-- 7. Trigger on user_profiles to block owner modification
DROP TRIGGER IF EXISTS protect_owner_from_modification ON public.user_profiles;
CREATE TRIGGER protect_owner_from_modification
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_owner_modification();

-- 8. Set the owner flag for lmodirv@gmail.com if they exist
DO $$
DECLARE
  owner_profile_id UUID;
BEGIN
  SELECT id INTO owner_profile_id
  FROM public.user_profiles
  WHERE email = 'lmodirv@gmail.com'
  LIMIT 1;

  IF owner_profile_id IS NOT NULL THEN
    UPDATE public.user_profiles
    SET is_owner = true, is_admin = true, is_active = true
    WHERE id = owner_profile_id;
    RAISE NOTICE 'Owner flag set for lmodirv@gmail.com';
  ELSE
    RAISE NOTICE 'Owner account lmodirv@gmail.com not found yet. Flag will be set on first login.';
  END IF;
END $$;
