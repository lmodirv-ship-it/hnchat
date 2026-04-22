-- Add storage bucket for payment receipts
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-receipts',
  'payment-receipts',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS for storage
DROP POLICY IF EXISTS "users_upload_own_receipts" ON storage.objects;
CREATE POLICY "users_upload_own_receipts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'payment-receipts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "users_view_own_receipts" ON storage.objects;
CREATE POLICY "users_view_own_receipts"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'payment-receipts' AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND (is_admin = true OR is_owner = true)
    )
  )
);

DROP POLICY IF EXISTS "admin_manage_receipts_storage" ON storage.objects;
CREATE POLICY "admin_manage_receipts_storage"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'payment-receipts' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR is_owner = true)
  )
)
WITH CHECK (
  bucket_id = 'payment-receipts' AND
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR is_owner = true)
  )
);
