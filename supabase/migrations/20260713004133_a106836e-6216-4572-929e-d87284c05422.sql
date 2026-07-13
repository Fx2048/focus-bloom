
-- Academic fields on profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS academic_level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS academic_progress integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS academic_track text;

-- Courses table for the weekly schedule (blackboard-style)
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  code text,
  professor text,
  room text,
  color text NOT NULL DEFAULT '#8b5cf6',
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own courses"
  ON public.courses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS courses_user_day_idx ON public.courses(user_id, day_of_week, start_time);
