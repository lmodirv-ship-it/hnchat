-- ─── Error Logs Table for Real-Time Monitoring ────────────────────────────────
-- Migration: 20260421020000_error_logs_realtime.sql

CREATE TABLE IF NOT EXISTS public.error_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_type    TEXT NOT NULL,
  message       TEXT NOT NULL,
  path          TEXT,
  stack         TEXT,
  severity      TEXT NOT NULL DEFAULT 'error',
  user_id       UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  user_agent    TEXT,
  resolved      BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at   TIMESTAMPTZ,
  metadata      JSONB DEFAULT '{}'::JSONB
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at  ON public.error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity    ON public.error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved    ON public.error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id     ON public.error_logs(user_id);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Admins (via auth metadata) can read all logs
DROP POLICY IF EXISTS "admins_read_error_logs" ON public.error_logs;
CREATE POLICY "admins_read_error_logs"
ON public.error_logs
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'role' = 'service_role')
  OR (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  OR (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);

-- Any authenticated user can insert error logs (for client-side error reporting)
DROP POLICY IF EXISTS "authenticated_insert_error_logs" ON public.error_logs;
CREATE POLICY "authenticated_insert_error_logs"
ON public.error_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Service role (API routes) can insert without restriction
DROP POLICY IF EXISTS "service_insert_error_logs" ON public.error_logs;
CREATE POLICY "service_insert_error_logs"
ON public.error_logs
FOR INSERT
TO anon
WITH CHECK (true);

-- Service role can update (mark resolved)
DROP POLICY IF EXISTS "admins_update_error_logs" ON public.error_logs;
CREATE POLICY "admins_update_error_logs"
ON public.error_logs
FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  OR (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
  OR (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin')
);

-- Enable real-time for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.error_logs;
