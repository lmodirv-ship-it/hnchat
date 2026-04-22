-- hnChat Morocco Payment System Migration
-- Bank Transfer (manual) + PayPal (international)

-- ============================================================
-- 1. ENUMS
-- ============================================================
DROP TYPE IF EXISTS public.payment_method_type CASCADE;
CREATE TYPE public.payment_method_type AS ENUM ('bank_transfer', 'paypal');

DROP TYPE IF EXISTS public.payment_status CASCADE;
CREATE TYPE public.payment_status AS ENUM ('pending', 'pending_verification', 'approved', 'rejected', 'expired');

DROP TYPE IF EXISTS public.subscription_plan CASCADE;
CREATE TYPE public.subscription_plan AS ENUM ('free', 'basic', 'pro', 'business');

-- ============================================================
-- 2. TABLES
-- ============================================================

-- Subscription plans config (owner-managed)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name public.subscription_plan NOT NULL DEFAULT 'free'::public.subscription_plan,
  display_name TEXT NOT NULL,
  price_mad NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  plan_name public.subscription_plan NOT NULL DEFAULT 'free'::public.subscription_plan,
  status public.payment_status NOT NULL DEFAULT 'pending'::public.payment_status,
  payment_method public.payment_method_type,
  amount_mad NUMERIC(10,2),
  amount_usd NUMERIC(10,2),
  paypal_order_id TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment receipts (for bank transfer uploads)
CREATE TABLE IF NOT EXISTS public.payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  receipt_url TEXT NOT NULL,
  receipt_filename TEXT,
  transfer_reference TEXT,
  notes TEXT,
  status public.payment_status NOT NULL DEFAULT 'pending_verification'::public.payment_status,
  reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bank transfer details (owner-configured)
CREATE TABLE IF NOT EXISTS public.bank_transfer_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_holder TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  rib TEXT,
  iban TEXT,
  swift_code TEXT,
  currency TEXT NOT NULL DEFAULT 'MAD',
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_user_id ON public.payment_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_status ON public.payment_receipts(status);
CREATE INDEX IF NOT EXISTS idx_payment_receipts_subscription_id ON public.payment_receipts(subscription_id);

-- ============================================================
-- 4. FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND (is_admin = true OR is_owner = true)
  )
$$;

CREATE OR REPLACE FUNCTION public.update_subscription_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- 5. ENABLE RLS
-- ============================================================
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transfer_details ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. RLS POLICIES
-- ============================================================

-- subscription_plans: public read, admin write
DROP POLICY IF EXISTS "public_read_subscription_plans" ON public.subscription_plans;
CREATE POLICY "public_read_subscription_plans"
ON public.subscription_plans FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "admin_manage_subscription_plans" ON public.subscription_plans;
CREATE POLICY "admin_manage_subscription_plans"
ON public.subscription_plans FOR ALL TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- subscriptions: users see own, admins see all
DROP POLICY IF EXISTS "users_view_own_subscriptions" ON public.subscriptions;
CREATE POLICY "users_view_own_subscriptions"
ON public.subscriptions FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user());

DROP POLICY IF EXISTS "users_create_own_subscriptions" ON public.subscriptions;
CREATE POLICY "users_create_own_subscriptions"
ON public.subscriptions FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "admin_update_subscriptions" ON public.subscriptions;
CREATE POLICY "admin_update_subscriptions"
ON public.subscriptions FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user())
WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

-- payment_receipts: users see own, admins see all
DROP POLICY IF EXISTS "users_manage_own_receipts" ON public.payment_receipts;
CREATE POLICY "users_manage_own_receipts"
ON public.payment_receipts FOR ALL TO authenticated
USING (user_id = auth.uid() OR public.is_admin_user())
WITH CHECK (user_id = auth.uid() OR public.is_admin_user());

-- bank_transfer_details: public read (so users can see transfer info), admin write
DROP POLICY IF EXISTS "public_read_bank_details" ON public.bank_transfer_details;
CREATE POLICY "public_read_bank_details"
ON public.bank_transfer_details FOR SELECT TO public USING (is_active = true);

DROP POLICY IF EXISTS "admin_manage_bank_details" ON public.bank_transfer_details;
CREATE POLICY "admin_manage_bank_details"
ON public.bank_transfer_details FOR ALL TO authenticated
USING (public.is_admin_user())
WITH CHECK (public.is_admin_user());

-- ============================================================
-- 7. TRIGGERS
-- ============================================================
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.update_subscription_updated_at();

-- ============================================================
-- 8. SEED DATA
-- ============================================================
INSERT INTO public.subscription_plans (name, display_name, price_mad, price_usd, duration_days, features)
VALUES
  ('free', 'مجاني', 0, 0, 0, '["وصول أساسي", "10 منشورات/يوم", "دردشة محدودة"]'::jsonb),
  ('basic', 'أساسي', 49, 5, 30, '["كل مزايا المجاني", "منشورات غير محدودة", "دعم بريد إلكتروني"]'::jsonb),
  ('pro', 'احترافي', 99, 10, 30, '["كل مزايا الأساسي", "AI مساعد", "تحليلات متقدمة", "شارة موثق"]'::jsonb),
  ('business', 'أعمال', 199, 20, 30, '["كل مزايا الاحترافي", "API وصول", "دعم أولوية", "لوحة تحكم خاصة"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.bank_transfer_details (account_holder, bank_name, account_number, rib, currency, instructions)
VALUES (
  'hnChat Platform',
  'Attijariwafa Bank',
  '007 780 0123456789012 34',
  '007780012345678901234',
  'MAD',
  'يرجى تحويل المبلغ وإرفاق إيصال التحويل مع ذكر اسم المستخدم في خانة الملاحظات'
)
ON CONFLICT (id) DO NOTHING;
