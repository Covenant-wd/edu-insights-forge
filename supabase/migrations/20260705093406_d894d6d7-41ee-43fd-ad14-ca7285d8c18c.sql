
-- Restrict anon reads on profiles to safe display columns only.
-- RLS still gates which rows (authors of published posts); column-level
-- grants ensure future columns are not exposed silently.
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, display_name, avatar_url, bio) ON public.profiles TO anon;
