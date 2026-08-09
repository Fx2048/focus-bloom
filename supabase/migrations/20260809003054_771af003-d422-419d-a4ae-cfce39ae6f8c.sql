-- 1. challenge_participants: only own rows readable
DROP POLICY IF EXISTS "Users can view challenge participants" ON public.challenge_participants;
CREATE POLICY "Users can view their own participation"
ON public.challenge_participants FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2. profiles: only own profile readable
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles for leaderboard" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Safe leaderboard exposure (no sensitive columns)
CREATE OR REPLACE VIEW public.leaderboard
WITH (security_invoker = false) AS
SELECT user_id, display_name, avatar_emoji, xp, level, total_points, streak_days
FROM public.profiles
ORDER BY xp DESC
LIMIT 50;

REVOKE ALL ON public.leaderboard FROM anon;
GRANT SELECT ON public.leaderboard TO authenticated;
GRANT ALL ON public.leaderboard TO service_role;

-- 3. Token tables: no anon access
REVOKE ALL ON public.google_calendar_tokens FROM anon;
REVOKE ALL ON public.spotify_tokens FROM anon;

-- 4. Trigger functions must not be callable via the API
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;