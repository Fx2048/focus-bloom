
-- Add XP and level to profiles for leaderboard
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_emoji text DEFAULT '🧑‍💻';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active_date date;

-- Challenges table
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  challenge_type text NOT NULL DEFAULT 'weekly', -- weekly, daily, special
  target_value integer NOT NULL DEFAULT 1,
  xp_reward integer NOT NULL DEFAULT 50,
  starts_at timestamp with time zone NOT NULL DEFAULT now(),
  ends_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges" ON public.challenges
  FOR SELECT TO authenticated USING (true);

-- Challenge participants
CREATE TABLE public.challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamp with time zone,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view challenge participants" ON public.challenge_participants
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join challenges" ON public.challenge_participants
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.challenge_participants
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Leaderboard: allow authenticated users to see other profiles for ranking
CREATE POLICY "Users can view leaderboard data" ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- Drop the old restrictive select policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Seed some initial challenges
INSERT INTO public.challenges (title, description, icon, challenge_type, target_value, xp_reward, starts_at, ends_at) VALUES
  ('Maratonista Pomodoro', 'Completa 20 sesiones Pomodoro esta semana', '🍅', 'weekly', 20, 100, now(), now() + interval '7 days'),
  ('Maestro del Enfoque', 'Completa 5 tareas sin saltar ningún descanso', '🧘', 'weekly', 5, 75, now(), now() + interval '7 days'),
  ('Madrugador', 'Inicia 3 sesiones antes de las 9 AM', '🌅', 'weekly', 3, 60, now(), now() + interval '7 days'),
  ('Racha Imparable', 'Mantén una racha de 5 días consecutivos', '🔥', 'special', 5, 150, now(), now() + interval '30 days');
