-- ============================================================
-- Migration: Owner Full Access
-- Grants lmodirv@gmail.com full (ALL) access on every table,
-- bypassing all existing RLS restrictions.
-- The is_site_owner() SECURITY DEFINER function already exists
-- (created in 20260422140000_owner_protection.sql) and checks
-- auth.users.email = 'lmodirv@gmail.com' — no recursion risk.
-- ============================================================

-- ============================================================
-- HELPER: ensure is_site_owner() exists (idempotent)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_site_owner()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
      AND email = 'lmodirv@gmail.com'
  )
$$;

-- ============================================================
-- 1. user_profiles
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_user_profiles" ON public.user_profiles;
CREATE POLICY "owner_full_access_user_profiles"
ON public.user_profiles FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 2. posts
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_posts" ON public.posts;
CREATE POLICY "owner_full_access_posts"
ON public.posts FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 3. comments
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_comments" ON public.comments;
CREATE POLICY "owner_full_access_comments"
ON public.comments FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 4. likes
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_likes" ON public.likes;
CREATE POLICY "owner_full_access_likes"
ON public.likes FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 5. followers
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_followers" ON public.followers;
CREATE POLICY "owner_full_access_followers"
ON public.followers FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 6. messages
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_messages" ON public.messages;
CREATE POLICY "owner_full_access_messages"
ON public.messages FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 7. videos
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_videos" ON public.videos;
CREATE POLICY "owner_full_access_videos"
ON public.videos FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 8. video_likes
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_video_likes" ON public.video_likes;
CREATE POLICY "owner_full_access_video_likes"
ON public.video_likes FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 9. video_views
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_video_views" ON public.video_views;
CREATE POLICY "owner_full_access_video_views"
ON public.video_views FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 10. notifications
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_notifications" ON public.notifications;
CREATE POLICY "owner_full_access_notifications"
ON public.notifications FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 11. bookmarks
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_bookmarks" ON public.bookmarks;
CREATE POLICY "owner_full_access_bookmarks"
ON public.bookmarks FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 12. video_engagement
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_video_engagement" ON public.video_engagement;
CREATE POLICY "owner_full_access_video_engagement"
ON public.video_engagement FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 13. reports
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_reports" ON public.reports;
CREATE POLICY "owner_full_access_reports"
ON public.reports FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 14. push_strategy_rules
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_push_strategy_rules" ON public.push_strategy_rules;
CREATE POLICY "owner_full_access_push_strategy_rules"
ON public.push_strategy_rules FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 15. user_behavior_profiles
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_user_behavior_profiles" ON public.user_behavior_profiles;
CREATE POLICY "owner_full_access_user_behavior_profiles"
ON public.user_behavior_profiles FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 16. push_notification_log
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_push_notification_log" ON public.push_notification_log;
CREATE POLICY "owner_full_access_push_notification_log"
ON public.push_notification_log FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 17. user_preferences
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_user_preferences" ON public.user_preferences;
CREATE POLICY "owner_full_access_user_preferences"
ON public.user_preferences FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 18. push_rule_performance
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_push_rule_performance" ON public.push_rule_performance;
CREATE POLICY "owner_full_access_push_rule_performance"
ON public.push_rule_performance FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 19. push_user_fatigue
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_push_user_fatigue" ON public.push_user_fatigue;
CREATE POLICY "owner_full_access_push_user_fatigue"
ON public.push_user_fatigue FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 20. push_user_timing
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_push_user_timing" ON public.push_user_timing;
CREATE POLICY "owner_full_access_push_user_timing"
ON public.push_user_timing FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 21. push_ab_tests
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_push_ab_tests" ON public.push_ab_tests;
CREATE POLICY "owner_full_access_push_ab_tests"
ON public.push_ab_tests FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 22. push_deep_links
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_push_deep_links" ON public.push_deep_links;
CREATE POLICY "owner_full_access_push_deep_links"
ON public.push_deep_links FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 23. push_rule_config
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_push_rule_config" ON public.push_rule_config;
CREATE POLICY "owner_full_access_push_rule_config"
ON public.push_rule_config FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 24. error_logs
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_error_logs" ON public.error_logs;
CREATE POLICY "owner_full_access_error_logs"
ON public.error_logs FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 25. marketplace_products
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_marketplace_products" ON public.marketplace_products;
CREATE POLICY "owner_full_access_marketplace_products"
ON public.marketplace_products FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 26. subscription_plans
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_subscription_plans" ON public.subscription_plans;
CREATE POLICY "owner_full_access_subscription_plans"
ON public.subscription_plans FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 27. subscriptions
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_subscriptions" ON public.subscriptions;
CREATE POLICY "owner_full_access_subscriptions"
ON public.subscriptions FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 28. payment_receipts
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_payment_receipts" ON public.payment_receipts;
CREATE POLICY "owner_full_access_payment_receipts"
ON public.payment_receipts FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 29. bank_transfer_details
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_bank_transfer_details" ON public.bank_transfer_details;
CREATE POLICY "owner_full_access_bank_transfer_details"
ON public.bank_transfer_details FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 30. cart_items
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_cart_items" ON public.cart_items;
CREATE POLICY "owner_full_access_cart_items"
ON public.cart_items FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 31. owner_site_settings
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_site_settings" ON public.owner_site_settings;
CREATE POLICY "owner_full_access_site_settings"
ON public.owner_site_settings FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 32. orders
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_orders" ON public.orders;
CREATE POLICY "owner_full_access_orders"
ON public.orders FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 33. referrals
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_referrals" ON public.referrals;
CREATE POLICY "owner_full_access_referrals"
ON public.referrals FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 34. user_points
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_user_points" ON public.user_points;
CREATE POLICY "owner_full_access_user_points"
ON public.user_points FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 35. point_transactions
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_point_transactions" ON public.point_transactions;
CREATE POLICY "owner_full_access_point_transactions"
ON public.point_transactions FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 36. live_stream_gifts
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_live_stream_gifts" ON public.live_stream_gifts;
CREATE POLICY "owner_full_access_live_stream_gifts"
ON public.live_stream_gifts FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 37. marketplace_commissions
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_marketplace_commissions" ON public.marketplace_commissions;
CREATE POLICY "owner_full_access_marketplace_commissions"
ON public.marketplace_commissions FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 38. ai_premium_usage
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_ai_premium_usage" ON public.ai_premium_usage;
CREATE POLICY "owner_full_access_ai_premium_usage"
ON public.ai_premium_usage FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 39. voice_rooms
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_voice_rooms" ON public.voice_rooms;
CREATE POLICY "owner_full_access_voice_rooms"
ON public.voice_rooms FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 40. voice_room_speakers
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_voice_room_speakers" ON public.voice_room_speakers;
CREATE POLICY "owner_full_access_voice_room_speakers"
ON public.voice_room_speakers FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 41. geo_regions
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_geo_regions" ON public.geo_regions;
CREATE POLICY "owner_full_access_geo_regions"
ON public.geo_regions FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 42. geo_news
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_geo_news" ON public.geo_news;
CREATE POLICY "owner_full_access_geo_news"
ON public.geo_news FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 43. geo_services
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_geo_services" ON public.geo_services;
CREATE POLICY "owner_full_access_geo_services"
ON public.geo_services FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 44. geo_trending
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_geo_trending" ON public.geo_trending;
CREATE POLICY "owner_full_access_geo_trending"
ON public.geo_trending FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 45. games
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_games" ON public.games;
CREATE POLICY "owner_full_access_games"
ON public.games FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 46. game_leaderboard
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_game_leaderboard" ON public.game_leaderboard;
CREATE POLICY "owner_full_access_game_leaderboard"
ON public.game_leaderboard FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 47. game_tournaments
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_game_tournaments" ON public.game_tournaments;
CREATE POLICY "owner_full_access_game_tournaments"
ON public.game_tournaments FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 48. store_apps
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_store_apps" ON public.store_apps;
CREATE POLICY "owner_full_access_store_apps"
ON public.store_apps FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 49. user_installed_apps
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_user_installed_apps" ON public.user_installed_apps;
CREATE POLICY "owner_full_access_user_installed_apps"
ON public.user_installed_apps FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 50. community_pages
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_community_pages" ON public.community_pages;
CREATE POLICY "owner_full_access_community_pages"
ON public.community_pages FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 51. community_groups
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_community_groups" ON public.community_groups;
CREATE POLICY "owner_full_access_community_groups"
ON public.community_groups FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 52. page_follows
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_page_follows" ON public.page_follows;
CREATE POLICY "owner_full_access_page_follows"
ON public.page_follows FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 53. group_memberships
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_group_memberships" ON public.group_memberships;
CREATE POLICY "owner_full_access_group_memberships"
ON public.group_memberships FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 54. crypto_portfolio
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_crypto_portfolio" ON public.crypto_portfolio;
CREATE POLICY "owner_full_access_crypto_portfolio"
ON public.crypto_portfolio FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 55. crypto_trades
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_crypto_trades" ON public.crypto_trades;
CREATE POLICY "owner_full_access_crypto_trades"
ON public.crypto_trades FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 56. stories
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_stories" ON public.stories;
CREATE POLICY "owner_full_access_stories"
ON public.stories FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 57. story_views
-- ============================================================
DROP POLICY IF EXISTS "owner_full_access_story_views" ON public.story_views;
CREATE POLICY "owner_full_access_story_views"
ON public.story_views FOR ALL TO authenticated
USING (public.is_site_owner())
WITH CHECK (public.is_site_owner());

-- ============================================================
-- 58. Ensure owner account has is_owner + is_admin flags
-- ============================================================
DO $$
DECLARE
  owner_id UUID;
BEGIN
  SELECT id INTO owner_id
  FROM public.user_profiles
  WHERE email = 'lmodirv@gmail.com'
  LIMIT 1;

  IF owner_id IS NOT NULL THEN
    UPDATE public.user_profiles
    SET is_owner = true,
        is_admin = true,
        is_active = true
    WHERE id = owner_id;
    RAISE NOTICE 'Owner flags confirmed for lmodirv@gmail.com';
  ELSE
    RAISE NOTICE 'Owner profile not found yet — flags will be set on first login via trigger';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Owner flag update skipped: %', SQLERRM;
END $$;
