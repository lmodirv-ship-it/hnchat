-- Marketplace Products Table
-- Migration: 20260422115314_marketplace_products.sql

CREATE TABLE IF NOT EXISTS public.marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT '',
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    original_price NUMERIC(10,2),
    image_url TEXT DEFAULT '',
    image_alt TEXT DEFAULT '',
    category TEXT DEFAULT 'cat-digital',
    badge TEXT DEFAULT '',
    rating NUMERIC(3,2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    sold_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_id ON public.marketplace_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON public.marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_created_at ON public.marketplace_products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_is_active ON public.marketplace_products(is_active);

-- Auto-update updated_at
CREATE TRIGGER IF NOT EXISTS marketplace_products_updated_at
    BEFORE UPDATE ON public.marketplace_products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_products_select" ON public.marketplace_products;
CREATE POLICY "marketplace_products_select"
    ON public.marketplace_products FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "marketplace_products_insert" ON public.marketplace_products;
CREATE POLICY "marketplace_products_insert"
    ON public.marketplace_products FOR INSERT
    WITH CHECK (auth.uid() = seller_id);

DROP POLICY IF EXISTS "marketplace_products_update" ON public.marketplace_products;
CREATE POLICY "marketplace_products_update"
    ON public.marketplace_products FOR UPDATE
    USING (auth.uid() = seller_id);

DROP POLICY IF EXISTS "marketplace_products_delete" ON public.marketplace_products;
CREATE POLICY "marketplace_products_delete"
    ON public.marketplace_products FOR DELETE
    USING (auth.uid() = seller_id);

-- Seed sample products (only if table is empty)
DO $$
DECLARE
    v_seller_id UUID;
BEGIN
    SELECT id INTO v_seller_id FROM public.user_profiles LIMIT 1;

    IF v_seller_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.marketplace_products LIMIT 1) THEN
        INSERT INTO public.marketplace_products (seller_id, name, description, price, original_price, image_url, image_alt, category, badge, rating, reviews_count, sold_count) VALUES
        (v_seller_id, 'Neon Cityscape NFT Pack', 'Exclusive digital art collection featuring neon-lit futuristic cityscapes.', 120, NULL, 'https://picsum.photos/seed/prod1/400/400', 'Digital art product showing neon-lit futuristic cityscape with purple and blue tones', 'cat-digital', 'new', 4.9, 234, 12),
        (v_seller_id, 'Wireless Noise-Cancelling Headphones', 'Premium wireless headphones with active noise cancellation.', 189, 249, 'https://picsum.photos/seed/prod2/400/400', 'Product photo of premium wireless headphones in matte black with silver accents', 'cat-tech', 'sale', 4.7, 1892, 4231),
        (v_seller_id, 'Indie Album — Signals Digital Download', 'Full digital album download with 12 original tracks.', 12, NULL, 'https://picsum.photos/seed/prod3/400/400', 'Album cover art for Signals featuring abstract sound wave visualization', 'cat-music', 'trending', 4.8, 567, 3102),
        (v_seller_id, 'Mechanical Keyboard RGB Compact 65%', 'Compact mechanical keyboard with full RGB lighting.', 145, 180, 'https://picsum.photos/seed/prod4/400/400', 'Product photo of compact mechanical keyboard with RGB lighting in dark gaming setup', 'cat-tech', 'sale', 4.6, 3421, 8764),
        (v_seller_id, 'Abstract Minds Art Bundle', 'Collection of 20 high-resolution abstract digital artworks.', 35, NULL, 'https://picsum.photos/seed/prod5/400/400', 'Digital art bundle product featuring collection of abstract mind visualization artworks', 'cat-digital', 'new', 5.0, 89, 234),
        (v_seller_id, 'Gourmet Coffee Subscription Box', 'Monthly curated selection of premium single-origin coffees.', 44, 55, 'https://picsum.photos/seed/prod6/400/400', 'Product photo of artisan coffee subscription box with premium single-origin coffee bags', 'cat-food', 'sale', 4.5, 712, 2891),
        (v_seller_id, 'The Creator Playbook eBook', 'Comprehensive guide to building your creator brand online.', 19, NULL, 'https://picsum.photos/seed/prod7/400/400', 'Digital book cover for The Creator Playbook with minimalist design and bold typography', 'cat-books', 'trending', 4.8, 2134, 11203),
        (v_seller_id, 'Gaming Controller Pro Edition', 'Professional gaming controller with precision analog sticks.', 89, 110, 'https://picsum.photos/seed/prod8/400/400', 'Product photo of professional gaming controller in black with textured grip and LED indicators', 'cat-gaming', 'sale', 4.4, 891, 5432),
        (v_seller_id, 'Vintage Oversized Hoodie Midnight', 'Premium quality oversized hoodie in midnight black.', 68, NULL, 'https://picsum.photos/seed/prod9/400/400', 'Fashion product photo of oversized dark hoodie on model against minimalist background', 'cat-fashion', 'new', 4.6, 445, 1876),
        (v_seller_id, 'AI Prompt Engineering Course', 'Master AI prompt engineering with 40+ hours of content.', 99, 149, 'https://picsum.photos/seed/prod10/400/400', 'Digital course product cover for AI prompt engineering with futuristic neural network visualization', 'cat-digital', 'trending', 4.9, 3782, 14502);
    END IF;
END;
$$;
