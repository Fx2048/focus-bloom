
-- Remove redundant email column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Update trigger function to stop inserting email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$function$;
