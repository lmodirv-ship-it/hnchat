-- Push Strategy: scheduled notifications and user behavior tracking

-- Push strategy rules table (per-user overrides)
CREATE TABLE IF NOT EXISTS public.push_strategy_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id text NOT NULL,
  enabled boolean DEFAULT true,
  smart_timing boolean DEFAULT true,
  cooldown_hours integer DEFAULT 24,
  last_fired_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, rule_id)
);

-- User behavior profiles for smart timing
CREATE TABLE IF NOT EXISTS public.user_behavior_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  last_active_at timestamptz DEFAULT now(),
  preferred_hours integer[] DEFAULT ARRAY[20, 21],
  total_sessions integer DEFAULT 0,
  avg_session_duration integer DEFAULT 0,
  notifications_clicked integer DEFAULT 0,
  notifications_dismissed integer DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Push notification delivery log
CREATE TABLE IF NOT EXISTS public.push_notification_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_id text,
  notification_type text NOT NULL,
  title text,
  body text,
  sent_at timestamptz DEFAULT now(),
  clicked_at timestamptz,
  dismissed_at timestamptz,
  hour_sent integer
);

CREATE OR REPLACE FUNCTION update_hour_sent()
RETURNS TRIGGER AS $$
BEGIN
   NEW.hour_sent := EXTRACT(HOUR FROM (NEW.sent_at AT TIME ZONE 'UTC'))::integer;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hour_sent_trigger
BEFORE INSERT OR UPDATE ON public.push_notification_log
FOR EACH ROW
EXECUTE PROCEDURE update_hour_sent();

-- RLS Policies
ALTER TABLE public.push_strategy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notification_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_strategy_rules' AND policyname = 'Users manage own strategy rules') THEN
    CREATE POLICY "Users manage own strategy rules" ON public.push_strategy_rules
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_behavior_profiles' AND policyname = 'Users manage own behavior profile') THEN
    CREATE POLICY "Users manage own behavior profile" ON public.user_behavior_profiles
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'push_notification_log' AND policyname = 'Users view own notification log') THEN
    CREATE POLICY "Users view own notification log" ON public.push_notification_log
      FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_strategy_rules_user ON public.push_strategy_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_push_notification_log_user ON public.push_notification_log(user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_behavior_user ON public.user_behavior_profiles(user_id);
