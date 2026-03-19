
-- Mentoring relationships
CREATE TABLE public.mentoring_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL,
  mentee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

ALTER TABLE public.mentoring_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their mentoring relationships"
  ON public.mentoring_relationships FOR SELECT TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can create mentoring relationships"
  ON public.mentoring_relationships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can update their mentoring relationships"
  ON public.mentoring_relationships FOR UPDATE TO authenticated
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- Mentoring sessions (video calls)
CREATE TABLE public.mentoring_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES public.mentoring_relationships(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  jitsi_room_name TEXT NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sessions in their relationships"
  ON public.mentoring_sessions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Users can create sessions in their relationships"
  ON public.mentoring_sessions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Users can update sessions in their relationships"
  ON public.mentoring_sessions FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

-- Mentoring messages (chat)
CREATE TABLE public.mentoring_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES public.mentoring_relationships(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentoring_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their relationships"
  ON public.mentoring_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their relationships"
  ON public.mentoring_messages FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

-- Shared mentoring projects
CREATE TABLE public.mentoring_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES public.mentoring_relationships(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'in-progress',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mentoring_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view projects in their relationships"
  ON public.mentoring_projects FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Users can create projects in their relationships"
  ON public.mentoring_projects FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Users can update projects in their relationships"
  ON public.mentoring_projects FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete projects in their relationships"
  ON public.mentoring_projects FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.mentoring_relationships r
      WHERE r.id = relationship_id
      AND (r.mentor_id = auth.uid() OR r.mentee_id = auth.uid())
    )
  );

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_messages;
