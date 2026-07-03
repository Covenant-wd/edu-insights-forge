
ALTER TABLE public.posts
  ADD CONSTRAINT posts_author_profile_fkey
  FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories (slug);
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts (slug);
