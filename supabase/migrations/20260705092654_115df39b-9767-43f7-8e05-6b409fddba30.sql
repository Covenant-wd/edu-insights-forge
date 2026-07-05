
CREATE TABLE public.ad_snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_key text NOT NULL UNIQUE,
  name text NOT NULL,
  code text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ad_snippets TO anon;
GRANT SELECT ON public.ad_snippets TO authenticated;
GRANT ALL ON public.ad_snippets TO service_role;

ALTER TABLE public.ad_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_snippets public read enabled"
  ON public.ad_snippets FOR SELECT
  USING (enabled = true);

CREATE POLICY "ad_snippets admin read all"
  ON public.ad_snippets FOR SELECT
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ad_snippets admin insert"
  ON public.ad_snippets FOR INSERT
  TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ad_snippets admin update"
  ON public.ad_snippets FOR UPDATE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "ad_snippets admin delete"
  ON public.ad_snippets FOR DELETE
  TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER ad_snippets_set_updated_at
  BEFORE UPDATE ON public.ad_snippets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.ad_snippets (zone_key, name, code, enabled) VALUES
  ('multitag', 'Multitag (all-in-one)', '', false),
  ('popunder', 'Onclick (Popunder)', '', false),
  ('push', 'Push Notifications', '<script src="https://5gvci.com/act/files/tag.min.js?z=11241488" data-cfasync="false" async></script>', true),
  ('inpage_push', 'In-Page Push (Banner)', '', false),
  ('vignette', 'Vignette Banner', '<script>(function(s){s.dataset.zone=''11241493'',s.src=''https://n6wxm.com/vignette.min.js''})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement(''script'')))</script>', true);
