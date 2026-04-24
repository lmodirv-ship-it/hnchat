-- ============================================================
-- Migration: Connect all remaining screens to Supabase
-- Covers: voice_rooms, geo_content, games, app_store,
--         pages_groups, crypto_portfolio, stories
-- ============================================================

-- ============================================================
-- 1. VOICE ROOMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.voice_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  topic TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  gradient TEXT NOT NULL DEFAULT 'from-cyan-500/20 to-violet-500/20',
  is_live BOOLEAN NOT NULL DEFAULT true,
  listener_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.voice_room_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  is_muted BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_voice_rooms_is_live ON public.voice_rooms(is_live);
CREATE INDEX IF NOT EXISTS idx_voice_rooms_created_by ON public.voice_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_voice_room_speakers_room_id ON public.voice_room_speakers(room_id);

ALTER TABLE public.voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_room_speakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_voice_rooms" ON public.voice_rooms;
CREATE POLICY "public_read_voice_rooms" ON public.voice_rooms
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_manage_voice_rooms" ON public.voice_rooms;
CREATE POLICY "auth_manage_voice_rooms" ON public.voice_rooms
  FOR ALL TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "public_read_voice_room_speakers" ON public.voice_room_speakers;
CREATE POLICY "public_read_voice_room_speakers" ON public.voice_room_speakers
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_manage_voice_room_speakers" ON public.voice_room_speakers;
CREATE POLICY "auth_manage_voice_room_speakers" ON public.voice_room_speakers
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 2. GEO CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.geo_regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  flag TEXT NOT NULL,
  language TEXT NOT NULL,
  timezone TEXT NOT NULL,
  weather_temp INTEGER NOT NULL DEFAULT 25,
  weather_condition TEXT NOT NULL DEFAULT 'Sunny',
  weather_icon TEXT NOT NULL DEFAULT '☀️',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.geo_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL REFERENCES public.geo_regions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  image_alt TEXT,
  published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.geo_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL REFERENCES public.geo_regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🔗',
  rating NUMERIC(3,1) NOT NULL DEFAULT 4.5,
  is_available BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.geo_trending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id TEXT NOT NULL REFERENCES public.geo_regions(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  post_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_geo_news_region_id ON public.geo_news(region_id);
CREATE INDEX IF NOT EXISTS idx_geo_services_region_id ON public.geo_services(region_id);
CREATE INDEX IF NOT EXISTS idx_geo_trending_region_id ON public.geo_trending(region_id);

ALTER TABLE public.geo_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_trending ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_geo_regions" ON public.geo_regions;
CREATE POLICY "public_read_geo_regions" ON public.geo_regions FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_geo_news" ON public.geo_news;
CREATE POLICY "public_read_geo_news" ON public.geo_news FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_geo_services" ON public.geo_services;
CREATE POLICY "public_read_geo_services" ON public.geo_services FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_geo_trending" ON public.geo_trending;
CREATE POLICY "public_read_geo_trending" ON public.geo_trending FOR SELECT TO public USING (true);

-- ============================================================
-- 3. GAMES HUB
-- ============================================================
CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '🎮',
  gradient TEXT NOT NULL DEFAULT 'from-cyan-500 to-violet-600',
  player_count TEXT NOT NULL DEFAULT '0',
  rating NUMERIC(3,1) NOT NULL DEFAULT 4.5,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_live BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.game_leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES public.games(id) ON DELETE CASCADE,
  score BIGINT NOT NULL DEFAULT 0,
  rank_position INTEGER,
  badge TEXT NOT NULL DEFAULT '⭐',
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, game_id)
);

CREATE TABLE IF NOT EXISTS public.game_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game_id UUID REFERENCES public.games(id) ON DELETE SET NULL,
  prize_pool TEXT NOT NULL DEFAULT '$0',
  max_players INTEGER NOT NULL DEFAULT 64,
  current_players INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_games_genre ON public.games(genre);
CREATE INDEX IF NOT EXISTS idx_games_is_featured ON public.games(is_featured);
CREATE INDEX IF NOT EXISTS idx_game_leaderboard_user_id ON public.game_leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_game_tournaments_status ON public.game_tournaments(status);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_tournaments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_games" ON public.games;
CREATE POLICY "public_read_games" ON public.games FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_game_leaderboard" ON public.game_leaderboard;
CREATE POLICY "public_read_game_leaderboard" ON public.game_leaderboard FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_manage_game_leaderboard" ON public.game_leaderboard;
CREATE POLICY "auth_manage_game_leaderboard" ON public.game_leaderboard
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "public_read_game_tournaments" ON public.game_tournaments;
CREATE POLICY "public_read_game_tournaments" ON public.game_tournaments FOR SELECT TO public USING (true);

-- ============================================================
-- 4. APP STORE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.store_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '📱',
  gradient TEXT NOT NULL DEFAULT 'from-cyan-500 to-violet-600',
  rating NUMERIC(3,1) NOT NULL DEFAULT 4.5,
  review_count TEXT NOT NULL DEFAULT '0',
  price TEXT NOT NULL DEFAULT 'Free',
  app_size TEXT NOT NULL DEFAULT '10 MB',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.user_installed_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES public.store_apps(id) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, app_id)
);

CREATE INDEX IF NOT EXISTS idx_store_apps_category ON public.store_apps(category);
CREATE INDEX IF NOT EXISTS idx_store_apps_is_featured ON public.store_apps(is_featured);
CREATE INDEX IF NOT EXISTS idx_user_installed_apps_user_id ON public.user_installed_apps(user_id);

ALTER TABLE public.store_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_installed_apps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_store_apps" ON public.store_apps;
CREATE POLICY "public_read_store_apps" ON public.store_apps FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_manage_user_installed_apps" ON public.user_installed_apps;
CREATE POLICY "auth_manage_user_installed_apps" ON public.user_installed_apps
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "public_read_user_installed_apps" ON public.user_installed_apps;
CREATE POLICY "public_read_user_installed_apps" ON public.user_installed_apps
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 5. PAGES & GROUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.community_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'PG',
  gradient TEXT NOT NULL DEFAULT 'from-cyan-500 to-violet-600',
  follower_count INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'GR',
  gradient TEXT NOT NULL DEFAULT 'from-cyan-500/30 to-violet-500/30',
  member_count INTEGER NOT NULL DEFAULT 0,
  privacy TEXT NOT NULL DEFAULT 'Public',
  activity_level TEXT NOT NULL DEFAULT 'Active',
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.page_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES public.community_pages(id) ON DELETE CASCADE,
  followed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, page_id)
);

CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.community_groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, group_id)
);

CREATE INDEX IF NOT EXISTS idx_community_pages_category ON public.community_pages(category);
CREATE INDEX IF NOT EXISTS idx_community_groups_privacy ON public.community_groups(privacy);
CREATE INDEX IF NOT EXISTS idx_page_follows_user_id ON public.page_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON public.group_memberships(user_id);

ALTER TABLE public.community_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_community_pages" ON public.community_pages;
CREATE POLICY "public_read_community_pages" ON public.community_pages FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "public_read_community_groups" ON public.community_groups;
CREATE POLICY "public_read_community_groups" ON public.community_groups FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_manage_page_follows" ON public.page_follows;
CREATE POLICY "auth_manage_page_follows" ON public.page_follows
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "public_read_page_follows" ON public.page_follows;
CREATE POLICY "public_read_page_follows" ON public.page_follows
  FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "auth_manage_group_memberships" ON public.group_memberships;
CREATE POLICY "auth_manage_group_memberships" ON public.group_memberships
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "public_read_group_memberships" ON public.group_memberships;
CREATE POLICY "public_read_group_memberships" ON public.group_memberships
  FOR SELECT TO public USING (true);

-- ============================================================
-- 6. CRYPTO PORTFOLIO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crypto_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  coin_name TEXT NOT NULL,
  amount NUMERIC(20,8) NOT NULL DEFAULT 0,
  avg_buy_price NUMERIC(20,8) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, coin_id)
);

CREATE TABLE IF NOT EXISTS public.crypto_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  coin_id TEXT NOT NULL,
  coin_symbol TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  amount NUMERIC(20,8) NOT NULL,
  price_at_trade NUMERIC(20,8) NOT NULL,
  total_usdt NUMERIC(20,8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_crypto_portfolio_user_id ON public.crypto_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_trades_user_id ON public.crypto_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_crypto_trades_created_at ON public.crypto_trades(created_at DESC);

ALTER TABLE public.crypto_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_trades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_manage_crypto_portfolio" ON public.crypto_portfolio;
CREATE POLICY "auth_manage_crypto_portfolio" ON public.crypto_portfolio
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_manage_crypto_trades" ON public.crypto_trades;
CREATE POLICY "auth_manage_crypto_trades" ON public.crypto_trades
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 7. STORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  media_url TEXT,
  media_type TEXT NOT NULL DEFAULT 'image',
  caption TEXT,
  filter_name TEXT NOT NULL DEFAULT 'None',
  sticker TEXT,
  gradient TEXT NOT NULL DEFAULT 'from-cyan-500 to-violet-600',
  emoji TEXT NOT NULL DEFAULT '✨',
  expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_stories" ON public.stories;
CREATE POLICY "public_read_stories" ON public.stories
  FOR SELECT TO public USING (expires_at > CURRENT_TIMESTAMP);

DROP POLICY IF EXISTS "auth_manage_stories" ON public.stories;
CREATE POLICY "auth_manage_stories" ON public.stories
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "auth_manage_story_views" ON public.story_views;
CREATE POLICY "auth_manage_story_views" ON public.story_views
  FOR ALL TO authenticated
  USING (viewer_id = auth.uid())
  WITH CHECK (viewer_id = auth.uid());

DROP POLICY IF EXISTS "public_read_story_views" ON public.story_views;
CREATE POLICY "public_read_story_views" ON public.story_views
  FOR SELECT TO public USING (true);

-- ============================================================
-- MOCK DATA
-- ============================================================
DO $$
DECLARE
  existing_user_id UUID;
  room1_id UUID := gen_random_uuid();
  room2_id UUID := gen_random_uuid();
  room3_id UUID := gen_random_uuid();
  game1_id UUID := gen_random_uuid();
  game2_id UUID := gen_random_uuid();
  game3_id UUID := gen_random_uuid();
  game4_id UUID := gen_random_uuid();
  game5_id UUID := gen_random_uuid();
  game6_id UUID := gen_random_uuid();
  game7_id UUID := gen_random_uuid();
  game8_id UUID := gen_random_uuid();
  app1_id UUID := gen_random_uuid();
  app2_id UUID := gen_random_uuid();
  app3_id UUID := gen_random_uuid();
  app4_id UUID := gen_random_uuid();
  app5_id UUID := gen_random_uuid();
  app6_id UUID := gen_random_uuid();
  app7_id UUID := gen_random_uuid();
  app8_id UUID := gen_random_uuid();
  page1_id UUID := gen_random_uuid();
  page2_id UUID := gen_random_uuid();
  page3_id UUID := gen_random_uuid();
  page4_id UUID := gen_random_uuid();
  page5_id UUID := gen_random_uuid();
  group1_id UUID := gen_random_uuid();
  group2_id UUID := gen_random_uuid();
  group3_id UUID := gen_random_uuid();
  group4_id UUID := gen_random_uuid();
  group5_id UUID := gen_random_uuid();
BEGIN
  SELECT id INTO existing_user_id FROM public.user_profiles LIMIT 1;

  -- Voice Rooms
  INSERT INTO public.voice_rooms (id, name, topic, category, gradient, is_live, listener_count, created_by)
  VALUES
    (room1_id, '💎 Diamond Lounge', 'Future of AI & Super Apps', 'Tech', 'from-cyan-500/20 to-violet-500/20', true, 1247, existing_user_id),
    (room2_id, '🎵 Music Vibes', 'Lo-fi beats & chill conversations', 'Music', 'from-pink-500/20 to-rose-500/20', true, 892, existing_user_id),
    (room3_id, '🚀 Startup Founders', 'Scaling from 0 to 1M users', 'Business', 'from-emerald-500/20 to-teal-500/20', true, 2341, existing_user_id),
    (gen_random_uuid(), '🎮 Gaming Arena', 'Pro tips & tournament prep', 'Gaming', 'from-orange-500/20 to-amber-500/20', false, 567, existing_user_id),
    (gen_random_uuid(), '🌍 World News', 'Breaking: Tech giants merge', 'News', 'from-blue-500/20 to-indigo-500/20', true, 4892, existing_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Geo Regions
  INSERT INTO public.geo_regions (id, name, flag, language, timezone, weather_temp, weather_condition, weather_icon, sort_order)
  VALUES
    ('me', 'Middle East', '🌙', 'Arabic / English', 'GMT+3', 38, 'Sunny', '☀️', 1),
    ('asia', 'Asia Pacific', '🌏', 'Multi-language', 'GMT+8', 28, 'Partly Cloudy', '⛅', 2),
    ('eu', 'Europe', '🇪🇺', 'Multi-language', 'GMT+1', 18, 'Cloudy', '🌥️', 3),
    ('us', 'Americas', '🌎', 'English / Spanish', 'GMT-5', 22, 'Clear', '🌤️', 4)
  ON CONFLICT (id) DO NOTHING;

  -- Geo News
  INSERT INTO public.geo_news (region_id, title, source, category, image_url, image_alt)
  VALUES
    ('me', 'دبي تطلق مبادرة الذكاء الاصطناعي للمدن الذكية', 'Gulf News', 'Tech', 'https://images.unsplash.com/photo-1708361089093-beef4c4584e7', 'Dubai skyline at night with smart city lights'),
    ('me', 'Saudi Vision 2030: New tech hub opens in Riyadh', 'Arab News', 'Business', 'https://img.rocket.new/generatedImages/rocket_gen_img_179839968-1776835752578.png', 'Modern business district in Riyadh'),
    ('me', 'hnChat يتصدر قائمة أفضل التطبيقات في المنطقة', 'hnChat News', 'Apps', 'https://img.rocket.new/generatedImages/rocket_gen_img_19812e607-1768895508683.png', 'Mobile app interface on smartphone'),
    ('asia', 'Japan launches world''s first quantum internet network', 'NHK World', 'Tech', 'https://images.unsplash.com/photo-1606291121612-52a61ff40095', 'Tokyo city skyline at night'),
    ('asia', 'South Korea''s K-Pop industry reaches $10B valuation', 'Korea Herald', 'Entertainment', 'https://img.rocket.new/generatedImages/rocket_gen_img_109e4c623-1772207010641.png', 'K-Pop concert with colorful lights'),
    ('asia', 'Singapore becomes Asia''s top crypto hub', 'Straits Times', 'Finance', 'https://images.unsplash.com/photo-1609220003033-bd006303936a', 'Singapore financial district skyline'),
    ('eu', 'EU passes landmark AI regulation framework', 'Euronews', 'Policy', 'https://img.rocket.new/generatedImages/rocket_gen_img_14388754d-1772075976784.png', 'European Parliament building in Brussels'),
    ('eu', 'Berlin becomes Europe''s top startup ecosystem', 'TechCrunch EU', 'Business', 'https://images.unsplash.com/photo-1586076020047-2ae9506fd8e1', 'Berlin city skyline with TV tower'),
    ('eu', 'Paris Fashion Week goes fully digital with AR', 'Vogue France', 'Fashion', 'https://images.unsplash.com/photo-1647201807036-47eca70336f2', 'Paris Eiffel Tower at dusk'),
    ('us', 'Silicon Valley''s AI boom creates 500K new jobs', 'TechCrunch', 'Tech', 'https://images.unsplash.com/photo-1472519275417-3f56f929bcd7', 'New York City skyline at sunset'),
    ('us', 'Brazil''s fintech sector surpasses $50B in funding', 'Bloomberg', 'Finance', 'https://images.unsplash.com/photo-1691362993953-0db83df599c0', 'Rio de Janeiro cityscape'),
    ('us', 'SpaceX launches first commercial moon mission', 'NASA', 'Space', 'https://images.unsplash.com/photo-1457364983758-510f8afa9f5f', 'Rocket launch with fire and smoke')
  ON CONFLICT DO NOTHING;

  -- Geo Services
  INSERT INTO public.geo_services (region_id, name, category, icon, rating, is_available)
  VALUES
    ('me', 'Careem', 'Transport', '🚗', 4.8, true),
    ('me', 'Noon', 'Shopping', '🛍️', 4.6, true),
    ('me', 'Talabat', 'Food', '🍔', 4.7, true),
    ('me', 'STC Pay', 'Finance', '💳', 4.5, true),
    ('asia', 'Grab', 'Transport', '🚗', 4.9, true),
    ('asia', 'Lazada', 'Shopping', '🛒', 4.5, true),
    ('asia', 'WeChat Pay', 'Finance', '💰', 4.8, true),
    ('asia', 'FoodPanda', 'Food', '🐼', 4.4, true),
    ('eu', 'Bolt', 'Transport', '⚡', 4.6, true),
    ('eu', 'Zalando', 'Shopping', '👗', 4.7, true),
    ('eu', 'Revolut', 'Finance', '💳', 4.8, true),
    ('eu', 'Deliveroo', 'Food', '🦘', 4.5, true),
    ('us', 'Uber', 'Transport', '🚗', 4.7, true),
    ('us', 'Amazon', 'Shopping', '📦', 4.8, true),
    ('us', 'Venmo', 'Finance', '💸', 4.6, true),
    ('us', 'DoorDash', 'Food', '🚪', 4.5, true)
  ON CONFLICT DO NOTHING;

  -- Geo Trending
  INSERT INTO public.geo_trending (region_id, tag, post_count, sort_order)
  VALUES
    ('me', '#رمضان_كريم', 45000, 1), ('me', '#Dubai_Expo', 32000, 2), ('me', '#hnChat_Arabia', 28000, 3), ('me', '#تقنية', 21000, 4), ('me', '#ريادة_الأعمال', 18000, 5),
    ('asia', '#Tokyo2026', 52000, 1), ('asia', '#KPop', 48000, 2), ('asia', '#TechAsia', 35000, 3), ('asia', '#Singapore', 22000, 4), ('asia', '#Anime', 19000, 5),
    ('eu', '#EuroTech', 41000, 1), ('eu', '#ClimateAction', 38000, 2), ('eu', '#UEFA2026', 33000, 3), ('eu', '#Berlin', 25000, 4), ('eu', '#Paris', 20000, 5),
    ('us', '#TechTuesday', 55000, 1), ('us', '#NBA2026', 49000, 2), ('us', '#SiliconValley', 42000, 3), ('us', '#LatinTech', 28000, 4), ('us', '#Innovation', 23000, 5)
  ON CONFLICT DO NOTHING;

  -- Games
  INSERT INTO public.games (id, name, genre, description, icon, gradient, player_count, rating, is_featured, is_live, sort_order)
  VALUES
    (game1_id, 'Diamond Clash', 'Battle Royale', 'Epic 100-player battle royale with diamond-grade graphics and crystal weapons.', '💎', 'from-cyan-500 to-violet-600', '2.4M', 4.9, true, true, 1),
    (game2_id, 'Neon Racer X', 'Racing', 'Futuristic racing through neon-lit crystal cities at hyperspeed.', '🏎️', 'from-orange-500 to-red-600', '1.2M', 4.7, true, false, 2),
    (game3_id, 'Quantum Chess', 'Strategy', 'Chess reimagined with quantum mechanics and AI opponents.', '♟️', 'from-violet-500 to-purple-600', '890K', 4.8, false, false, 3),
    (game4_id, 'Crystal Puzzle', 'Puzzle', 'Mind-bending 3D crystal puzzles with satisfying diamond shatters.', '🔮', 'from-pink-500 to-rose-600', '3.1M', 4.6, false, false, 4),
    (game5_id, 'Space Miners', 'Adventure', 'Mine rare crystals across the galaxy in this epic space adventure.', '🚀', 'from-blue-500 to-indigo-600', '567K', 4.5, false, true, 5),
    (game6_id, 'Prism Tower', 'Tower Defense', 'Defend your crystal tower against waves of shadow invaders.', '🏰', 'from-emerald-500 to-teal-600', '1.8M', 4.7, true, false, 6),
    (game7_id, 'AI Dungeon X', 'RPG', 'AI-generated infinite RPG adventures in a diamond fantasy world.', '⚔️', 'from-amber-500 to-orange-600', '2.2M', 4.9, false, false, 7),
    (game8_id, 'Beat Diamond', 'Rhythm', 'Rhythm game with diamond-shattering beats and crystal visuals.', '🎵', 'from-fuchsia-500 to-pink-600', '4.5M', 4.8, true, true, 8)
  ON CONFLICT (id) DO NOTHING;

  -- Game Tournaments
  INSERT INTO public.game_tournaments (name, game_id, prize_pool, max_players, current_players, starts_at, status)
  VALUES
    ('Diamond Clash World Cup', game1_id, '$50,000', 1024, 892, CURRENT_TIMESTAMP + INTERVAL '2 days', 'upcoming'),
    ('Neon Racer Championship', game2_id, '$25,000', 512, 341, CURRENT_TIMESTAMP + INTERVAL '5 days', 'upcoming'),
    ('Crystal Puzzle Masters', game4_id, '$10,000', 256, 256, CURRENT_TIMESTAMP - INTERVAL '1 hour', 'live'),
    ('Beat Diamond Finals', game8_id, '$15,000', 128, 98, CURRENT_TIMESTAMP + INTERVAL '7 days', 'upcoming')
  ON CONFLICT DO NOTHING;

  -- Leaderboard (only if user exists)
  IF existing_user_id IS NOT NULL THEN
    INSERT INTO public.game_leaderboard (user_id, game_id, score, rank_position, badge)
    VALUES
      (existing_user_id, game1_id, 9847200, 1, '💎')
    ON CONFLICT (user_id, game_id) DO NOTHING;
  END IF;

  -- Store Apps
  INSERT INTO public.store_apps (id, name, category, description, icon, gradient, rating, review_count, price, app_size, is_featured, sort_order)
  VALUES
    (app1_id, 'Diamond AI Studio', 'Productivity', 'Create stunning AI-generated art and content with diamond-grade quality.', '💎', 'from-cyan-500 to-violet-600', 4.9, '124K', 'Free', '48 MB', true, 1),
    (app2_id, 'Crystal Music', 'Music', 'Stream millions of songs with crystal-clear audio quality.', '🎵', 'from-pink-500 to-rose-600', 4.8, '89K', 'Free', '32 MB', true, 2),
    (app3_id, 'Nexus Games Hub', 'Games', 'Play hundreds of premium games without downloads.', '🎮', 'from-orange-500 to-amber-600', 4.7, '256K', 'Free', '128 MB', false, 3),
    (app4_id, 'Prism Photo Editor', 'Photo & Video', 'Professional photo editing with AI-powered filters and effects.', '🎨', 'from-violet-500 to-purple-600', 4.9, '67K', '$2.99', '56 MB', true, 4),
    (app5_id, 'Orbit Finance', 'Finance', 'Track your finances, investments, and crypto portfolio.', '💰', 'from-emerald-500 to-teal-600', 4.6, '43K', 'Free', '24 MB', false, 5),
    (app6_id, 'Nova Fitness', 'Health', 'AI-powered workout plans and nutrition tracking.', '💪', 'from-red-500 to-orange-600', 4.8, '91K', 'Free', '38 MB', false, 6),
    (app7_id, 'Stellar Maps', 'Navigation', 'Real-time navigation with AR overlay and diamond routing.', '🗺️', 'from-blue-500 to-indigo-600', 4.7, '178K', 'Free', '62 MB', false, 7),
    (app8_id, 'Quantum VPN', 'Utilities', 'Military-grade encryption for your digital privacy.', '🔐', 'from-slate-500 to-slate-700', 4.5, '34K', '$4.99/mo', '12 MB', false, 8)
  ON CONFLICT (id) DO NOTHING;

  -- Community Pages
  INSERT INTO public.community_pages (id, name, category, avatar, gradient, follower_count, is_verified, created_by)
  VALUES
    (page1_id, 'hnChat Official', 'Technology', 'HC', 'from-cyan-500 to-violet-600', 4200000, true, existing_user_id),
    (page2_id, 'Diamond Design Studio', 'Design & Art', 'DD', 'from-pink-500 to-rose-600', 892000, true, existing_user_id),
    (page3_id, 'Future Tech News', 'Media', 'FT', 'from-blue-500 to-indigo-600', 2100000, true, existing_user_id),
    (page4_id, 'AI Revolution', 'Science', 'AI', 'from-emerald-500 to-teal-600', 1500000, false, existing_user_id),
    (page5_id, 'Crystal Gaming', 'Gaming', 'CG', 'from-orange-500 to-amber-600', 3700000, true, existing_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Community Groups
  INSERT INTO public.community_groups (id, name, avatar, gradient, member_count, privacy, activity_level, created_by)
  VALUES
    (group1_id, '💎 Diamond Developers', 'DD', 'from-cyan-500/30 to-violet-500/30', 124000, 'Public', 'Very Active', existing_user_id),
    (group2_id, '🎨 Creative Minds Hub', 'CM', 'from-pink-500/30 to-rose-500/30', 87000, 'Public', 'Active', existing_user_id),
    (group3_id, '🚀 Startup Founders Circle', 'SF', 'from-emerald-500/30 to-teal-500/30', 45000, 'Private', 'Very Active', existing_user_id),
    (group4_id, '🎮 Pro Gamers Alliance', 'PG', 'from-orange-500/30 to-amber-500/30', 213000, 'Public', 'Extremely Active', existing_user_id),
    (group5_id, '🌍 Global Innovators', 'GI', 'from-blue-500/30 to-indigo-500/30', 567000, 'Public', 'Active', existing_user_id)
  ON CONFLICT (id) DO NOTHING;

  -- Page follows and group memberships for existing user
  IF existing_user_id IS NOT NULL THEN
    INSERT INTO public.page_follows (user_id, page_id)
    VALUES (existing_user_id, page1_id), (existing_user_id, page3_id)
    ON CONFLICT (user_id, page_id) DO NOTHING;

    INSERT INTO public.group_memberships (user_id, group_id)
    VALUES (existing_user_id, group1_id), (existing_user_id, group3_id)
    ON CONFLICT (user_id, group_id) DO NOTHING;

    -- Crypto portfolio
    INSERT INTO public.crypto_portfolio (user_id, coin_id, coin_symbol, coin_name, amount, avg_buy_price)
    VALUES
      (existing_user_id, 'hnc', 'HNC', 'hnCoin', 1250, 2.847),
      (existing_user_id, 'btc', 'BTC', 'Bitcoin', 0.05, 67420.5),
      (existing_user_id, 'eth', 'ETH', 'Ethereum', 1.2, 3842.1),
      (existing_user_id, 'sol', 'SOL', 'Solana', 45, 182.4)
    ON CONFLICT (user_id, coin_id) DO NOTHING;

    -- Stories
    INSERT INTO public.stories (user_id, media_type, caption, filter_name, gradient, emoji)
    VALUES
      (existing_user_id, 'image', 'Living the dream ✨', 'Crystal', 'from-pink-500 to-rose-600', '🌟'),
      (existing_user_id, 'image', 'Building the future 🚀', 'Neon', 'from-violet-500 to-purple-600', '💫')
    ON CONFLICT DO NOTHING;
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Mock data insertion error: %', SQLERRM;
END $$;
