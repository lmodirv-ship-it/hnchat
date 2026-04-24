-- hnChat Growth & Monetization System Migration
-- Referrals, Points, Live Gifts, Marketplace Commission, AI Premium

-- ============================================================
-- 1. TABLES
-- ============================================================

-- Referral tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_granted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- User points balance
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Point transactions log
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Live stream gift transactions
CREATE TABLE IF NOT EXISTS public.live_stream_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  stream_id TEXT,
  gift_emoji TEXT NOT NULL,
  gift_name TEXT NOT NULL DEFAULT 'Gift',
  points_cost INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Marketplace order commissions
CREATE TABLE IF NOT EXISTS public.marketplace_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  seller_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  product_id UUID,
  sale_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  seller_earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Premium usage tracking
CREATE TABLE IF NOT EXISTS public.ai_premium_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT 'gpt-4',
  tokens_used INTEGER NOT NULL DEFAULT 0,
  is_premium_request BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON public.point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_gifts_sender ON public.live_stream_gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_live_stream_gifts_receiver ON public.live_stream_gifts(receiver_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_commissions_seller ON public.marketplace_commissions(seller_id);
CREATE INDEX IF NOT EXISTS idx_ai_premium_usage_user ON public.ai_premium_usage(user_id);

-- ============================================================
-- 3. FUNCTIONS
-- ============================================================

-- Award points to a user
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_reason TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Upsert user_points row
  INSERT INTO public.user_points (user_id, balance, total_earned, updated_at)
  VALUES (p_user_id, p_amount, p_amount, now())
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.user_points.balance + p_amount,
        total_earned = public.user_points.total_earned + p_amount,
        updated_at = now();

  -- Log transaction
  INSERT INTO public.point_transactions (user_id, amount, type, reason, reference_id)
  VALUES (p_user_id, p_amount, p_type, p_reason, p_reference_id);
END;
$$;

-- Spend points from a user
CREATE OR REPLACE FUNCTION public.spend_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_reason TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_balance INTEGER;
BEGIN
  SELECT balance INTO current_balance FROM public.user_points WHERE user_id = p_user_id;
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN false;
  END IF;

  UPDATE public.user_points
  SET balance = balance - p_amount,
      total_spent = total_spent + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  INSERT INTO public.point_transactions (user_id, amount, type, reason, reference_id)
  VALUES (p_user_id, -p_amount, p_type, p_reason, p_reference_id);

  RETURN true;
END;
$$;

-- ============================================================
-- 4. RLS
-- ============================================================
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_premium_usage ENABLE ROW LEVEL SECURITY;

-- Referrals
DROP POLICY IF EXISTS "referrals_referrer_access" ON public.referrals;
CREATE POLICY "referrals_referrer_access" ON public.referrals
FOR ALL TO authenticated
USING (referrer_id = auth.uid())
WITH CHECK (referrer_id = auth.uid());

DROP POLICY IF EXISTS "referrals_referred_read" ON public.referrals;
CREATE POLICY "referrals_referred_read" ON public.referrals
FOR SELECT TO authenticated
USING (referred_id = auth.uid());

-- User points
DROP POLICY IF EXISTS "user_points_own_access" ON public.user_points;
CREATE POLICY "user_points_own_access" ON public.user_points
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Point transactions
DROP POLICY IF EXISTS "point_transactions_own_read" ON public.point_transactions;
CREATE POLICY "point_transactions_own_read" ON public.point_transactions
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Live stream gifts
DROP POLICY IF EXISTS "gifts_sender_access" ON public.live_stream_gifts;
CREATE POLICY "gifts_sender_access" ON public.live_stream_gifts
FOR ALL TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

DROP POLICY IF EXISTS "gifts_receiver_read" ON public.live_stream_gifts;
CREATE POLICY "gifts_receiver_read" ON public.live_stream_gifts
FOR SELECT TO authenticated
USING (receiver_id = auth.uid());

-- Marketplace commissions
DROP POLICY IF EXISTS "commissions_seller_read" ON public.marketplace_commissions;
CREATE POLICY "commissions_seller_read" ON public.marketplace_commissions
FOR SELECT TO authenticated
USING (seller_id = auth.uid());

-- AI premium usage
DROP POLICY IF EXISTS "ai_usage_own_access" ON public.ai_premium_usage;
CREATE POLICY "ai_usage_own_access" ON public.ai_premium_usage
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
