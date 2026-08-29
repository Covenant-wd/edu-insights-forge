CREATE TABLE public.post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  visitor_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX post_views_created_at_idx ON public.post_views (created_at DESC);
CREATE INDEX post_views_post_id_idx ON public.post_views (post_id);

GRANT INSERT ON public.post_views TO anon, authenticated;
GRANT ALL ON public.post_views TO service_role;

ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_views insert published" ON public.post_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.status = 'published'));

CREATE POLICY "post_views admin read" ON public.post_views
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE OR REPLACE FUNCTION public.bump_post_view_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.posts SET view_count = view_count + 1 WHERE id = NEW.post_id;
  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.bump_post_view_count() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER post_views_bump_count
AFTER INSERT ON public.post_views
FOR EACH ROW EXECUTE FUNCTION public.bump_post_view_count();

CREATE OR REPLACE FUNCTION public.admin_daily_traffic(_days integer DEFAULT 30)
RETURNS TABLE(day date, views bigint, visitors bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role)) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT d::date AS day,
         count(v.id) AS views,
         count(DISTINCT v.visitor_id) AS visitors
  FROM generate_series(current_date - (GREATEST(LEAST(_days, 180), 1) - 1), current_date, interval '1 day') d
  LEFT JOIN public.post_views v ON v.created_at >= d AND v.created_at < d + interval '1 day'
  GROUP BY d
  ORDER BY d;
END; $$;

REVOKE EXECUTE ON FUNCTION public.admin_daily_traffic(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_daily_traffic(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_post_views(_days integer DEFAULT 7)
RETURNS TABLE(post_id uuid, title text, slug text, status text, total_views bigint, recent_views bigint, today_views bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role)) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT p.id, p.title, p.slug, p.status,
         p.view_count::bigint AS total_views,
         count(v.id) FILTER (WHERE v.created_at >= current_date - (GREATEST(LEAST(_days, 180), 1) - 1))::bigint AS recent_views,
         count(v.id) FILTER (WHERE v.created_at >= current_date)::bigint AS today_views
  FROM public.posts p
  LEFT JOIN public.post_views v ON v.post_id = p.id
  GROUP BY p.id, p.title, p.slug, p.status, p.view_count
  ORDER BY p.view_count DESC;
END; $$;

REVOKE EXECUTE ON FUNCTION public.admin_post_views(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_post_views(integer) TO authenticated;