-- Push Strategy Upgrade: Adaptive Learning, Fatigue Detection, A/B Testing, Personalized Timing

-- ─── 1. Rule Performance Tracking (Adaptive Learning) ────────────────────────

CREATE TABLE IF NOT EXISTS public.push_rule_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now(),
  clicked BOOLEAN DEFAULT false,
  dismissed BOOLEAN DEFAULT false,
  ctr_window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_rule_perf_user ON public.push_rule_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_push_rule_perf_rule ON public.push_rule_performance(rule_id);
CREATE INDEX IF NOT EXISTS idx_push_rule_perf_sent ON public.push_rule_performance(sent_at);

-- ─── 2. User Fatigue State ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_user_fatigue (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  total_sent INTEGER DEFAULT 0,
  total_ignored INTEGER DEFAULT 0,
  ignore_rate NUMERIC(5,2) DEFAULT 0,
  fatigue_level TEXT DEFAULT 'normal', -- normal | elevated | high | suppressed
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  suppressed_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 3. Personalized Send Time ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_user_timing (
  user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  active_hours INTEGER[] DEFAULT ARRAY[20, 21]::INTEGER[],
  best_hour INTEGER DEFAULT 20,
  timezone TEXT DEFAULT 'UTC',
  last_computed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. A/B Test Variants ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id TEXT NOT NULL,
  variant_name TEXT NOT NULL, -- 'A' | 'B'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  emoji TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT true,
  sent_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  ctr NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_ab_rule ON public.push_ab_tests(rule_id);

-- ─── 5. Deep Link Registry ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_deep_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'video' | 'comment' | 'message' | 'profile' | 'page'
  target_id TEXT,
  target_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_deep_links_notif ON public.push_deep_links(notification_id);

-- ─── 6. Adaptive Rule Config (per-user overrides) ────────────────────────────

CREATE TABLE IF NOT EXISTS public.push_rule_config (
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  priority_multiplier NUMERIC(4,2) DEFAULT 1.0, -- adaptive: 0.5 to 2.0
  frequency_multiplier NUMERIC(4,2) DEFAULT 1.0,
  auto_adjusted BOOLEAN DEFAULT false,
  last_adjusted_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, rule_id)
);

-- ─── 7. Enable RLS ────────────────────────────────────────────────────────────

ALTER TABLE public.push_rule_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_user_fatigue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_user_timing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_deep_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_rule_config ENABLE ROW LEVEL SECURITY;

-- ─── 8. RLS Policies ─────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users_manage_own_push_rule_performance" ON public.push_rule_performance;
CREATE POLICY "users_manage_own_push_rule_performance"
ON public.push_rule_performance FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_push_user_fatigue" ON public.push_user_fatigue;
CREATE POLICY "users_manage_own_push_user_fatigue"
ON public.push_user_fatigue FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_manage_own_push_user_timing" ON public.push_user_timing;
CREATE POLICY "users_manage_own_push_user_timing"
ON public.push_user_timing FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "public_read_push_ab_tests" ON public.push_ab_tests;
CREATE POLICY "public_read_push_ab_tests"
ON public.push_ab_tests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_push_deep_links" ON public.push_deep_links;
CREATE POLICY "public_read_push_deep_links"
ON public.push_deep_links FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "users_manage_own_push_rule_config" ON public.push_rule_config;
CREATE POLICY "users_manage_own_push_rule_config"
ON public.push_rule_config FOR ALL TO authenticated
USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── 9. Fatigue Update Function ───────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_push_fatigue(p_user_id UUID, p_ignored BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_sent INTEGER;
  v_total_ignored INTEGER;
  v_ignore_rate NUMERIC(5,2);
  v_fatigue_level TEXT;
  v_suppressed_until TIMESTAMPTZ;
BEGIN
  INSERT INTO public.push_user_fatigue (user_id, total_sent, total_ignored)
  VALUES (p_user_id, 1, CASE WHEN p_ignored THEN 1 ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE SET
    total_sent = public.push_user_fatigue.total_sent + 1,
    total_ignored = public.push_user_fatigue.total_ignored + CASE WHEN p_ignored THEN 1 ELSE 0 END,
    last_interaction_at = CASE WHEN NOT p_ignored THEN now() ELSE public.push_user_fatigue.last_interaction_at END,
    updated_at = now();

  SELECT total_sent, total_ignored
  INTO v_total_sent, v_total_ignored
  FROM public.push_user_fatigue
  WHERE user_id = p_user_id;

  IF v_total_sent > 0 THEN
    v_ignore_rate := (v_total_ignored::NUMERIC / v_total_sent::NUMERIC) * 100;
  ELSE
    v_ignore_rate := 0;
  END IF;

  IF v_ignore_rate >= 80 THEN
    v_fatigue_level := 'suppressed';
    v_suppressed_until := now() + INTERVAL '48 hours';
  ELSIF v_ignore_rate >= 70 THEN
    v_fatigue_level := 'high';
    v_suppressed_until := now() + INTERVAL '24 hours';
  ELSIF v_ignore_rate >= 50 THEN
    v_fatigue_level := 'elevated';
    v_suppressed_until := NULL;
  ELSE
    v_fatigue_level := 'normal';
    v_suppressed_until := NULL;
  END IF;

  UPDATE public.push_user_fatigue SET
    ignore_rate = v_ignore_rate,
    fatigue_level = v_fatigue_level,
    suppressed_until = v_suppressed_until,
    updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;

-- ─── 10. Seed A/B Test Variants ───────────────────────────────────────────────

INSERT INTO public.push_ab_tests (rule_id, variant_name, title, body, emoji)
VALUES
  ('trending_alert', 'A', 'هذا الفيديو طالع 🔥', 'المحتوى هذا كيتشار بسرعة — شوفه دابا!', '🔥'),
  ('trending_alert', 'B', 'غادي يعجبك هذا الفيديو 💎', 'اكتشف المحتوى الأكثر مشاهدة الآن', '💎'),
  ('inactive_24h', 'A', 'واش مزال هنا؟ 👋', 'عندك محتوى جديد ينتظرك — ارجع دابا!', '👋'),
  ('inactive_24h', 'B', 'اشتقنا ليك 💙', 'المحتوى الجديد جاهز — شوف شنو فاتك', '💙'),
  ('fomo_prime', 'A', 'الكل كيشوف هذا دابا 👀', 'لا تفوتك اللحظة — انضم للنقاش', '👀'),
  ('fomo_prime', 'B', 'الوقت المثالي للمشاركة ⚡', 'الآن هو أفضل وقت للتفاعل مع المجتمع', '⚡')
ON CONFLICT (id) DO NOTHING;
