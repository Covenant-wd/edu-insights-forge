CREATE TABLE public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
CREATE INDEX comments_post_id_idx ON public.comments(post_id, created_at DESC);

GRANT SELECT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments public read" ON public.comments FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = comments.post_id AND p.status = 'published'));

CREATE POLICY "comments insert own" ON public.comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments update own" ON public.comments FOR UPDATE TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments delete own or admin" ON public.comments FOR DELETE TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER comments_set_updated_at BEFORE UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();