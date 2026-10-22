REVOKE SELECT ON public.study_checks FROM authenticated;
GRANT SELECT (id, user_id, topic, minutes, score, completed_at, created_at) ON public.study_checks TO authenticated;