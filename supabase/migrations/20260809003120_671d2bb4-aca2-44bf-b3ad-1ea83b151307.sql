DROP VIEW IF EXISTS public.leaderboard;

CREATE TABLE public.leaderboard (
  user_id uuid PRIMARY KEY,
  display_name text,
  avatar_emoji text,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  total_points integer NOT NULL DEFAULT 0,
  streak_days integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.leaderboard TO authenticated;
GRANT ALL ON public.leaderboard TO service_role;

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaderboard readable by signed-in users"
ON public.leaderboard FOR SELECT TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.sync_leaderboard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.leaderboard (user_id, display_name, avatar_emoji, xp, level, total_points, streak_days, updated_at)
  VALUES (NEW.user_id, NEW.display_name, NEW.avatar_emoji, NEW.xp, NEW.level, NEW.total_points, NEW.streak_days, now())
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_emoji = EXCLUDED.avatar_emoji,
    xp = EXCLUDED.xp,
    level = EXCLUDED.level,
    total_points = EXCLUDED.total_points,
    streak_days = EXCLUDED.streak_days,
    updated_at = now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_leaderboard() FROM anon, authenticated, public;

CREATE TRIGGER sync_leaderboard_on_profile
AFTER INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_leaderboard();

INSERT INTO public.leaderboard (user_id, display_name, avatar_emoji, xp, level, total_points, streak_days)
SELECT user_id, display_name, avatar_emoji, xp, level, total_points, streak_days FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;