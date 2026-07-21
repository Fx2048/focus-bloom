
CREATE TABLE public.curriculum_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL DEFAULT '',
  name text NOT NULL,
  credits numeric NOT NULL DEFAULT 3,
  semester text NOT NULL,
  prerequisites uuid[] NOT NULL DEFAULT '{}',
  color text NOT NULL DEFAULT '#c8f55a',
  notes text,
  position integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'planned',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.curriculum_courses TO authenticated;
GRANT ALL ON public.curriculum_courses TO service_role;

ALTER TABLE public.curriculum_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own curriculum courses"
  ON public.curriculum_courses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_curriculum_courses_user_semester ON public.curriculum_courses(user_id, semester);

CREATE TRIGGER update_curriculum_courses_updated_at
  BEFORE UPDATE ON public.curriculum_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
