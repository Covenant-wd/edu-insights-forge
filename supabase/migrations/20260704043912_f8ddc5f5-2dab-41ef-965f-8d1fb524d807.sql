
-- 1. Create private schema for security-definer helpers not meant for API exposure
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon, service_role;

-- 2. Recreate has_role in private schema
CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- 3. Rewrite policies to use private.has_role
DROP POLICY IF EXISTS "admins manage categories" ON public.categories;
CREATE POLICY "admins manage categories" ON public.categories
  FOR ALL
  USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "published posts public read" ON public.posts;
CREATE POLICY "published posts public read" ON public.posts
  FOR SELECT
  USING (status = 'published' OR private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "editors insert" ON public.posts;
CREATE POLICY "editors insert" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "editors update" ON public.posts;
CREATE POLICY "editors update" ON public.posts
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "admins delete" ON public.posts;
CREATE POLICY "admins delete" ON public.posts
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'));

-- 4. Drop the public.has_role so it's no longer exposed via PostgREST RPC
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- 5. Revoke external execute on trigger-only functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- 6. Restrict profiles read exposure
DROP POLICY IF EXISTS "profiles readable by all" ON public.profiles;

CREATE POLICY "public can read published author profiles" ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.posts
      WHERE posts.author_id = profiles.id
        AND posts.status = 'published'
    )
  );

CREATE POLICY "authenticated users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);
