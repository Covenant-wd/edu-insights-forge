CREATE TABLE public.archive_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text NOT NULL DEFAULT 'lesson-notes',
  level text,
  subject text,
  file_url text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT 'PDF',
  file_size text,
  download_count integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'published',
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.archive_resources TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.archive_resources TO authenticated;
GRANT ALL ON public.archive_resources TO service_role;

ALTER TABLE public.archive_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "archive public read published" ON public.archive_resources
  FOR SELECT USING (status = 'published' OR private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "archive editors insert" ON public.archive_resources
  FOR INSERT TO authenticated
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "archive editors update" ON public.archive_resources
  FOR UPDATE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "archive admin delete" ON public.archive_resources
  FOR DELETE TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER archive_resources_set_updated_at
  BEFORE UPDATE ON public.archive_resources
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX archive_resources_category_idx ON public.archive_resources (category, created_at DESC);

INSERT INTO public.archive_resources (title, slug, description, category, level, subject, file_type, featured, sort_order) VALUES
('JSS1-SSS3 Lesson Notes Bundle', 'lesson-notes-bundle-jss1-sss3', 'Complete termly lesson notes across core subjects, formatted to the Nigerian curriculum and ready to print.', 'lesson-notes', 'Secondary', 'All subjects', 'PDF', true, 1),
('Mathematics Scheme of Work (All Terms)', 'mathematics-scheme-of-work', 'Weekly breakdown of topics, objectives and activities for the full academic session.', 'scheme-of-work', 'Secondary', 'Mathematics', 'DOCX', true, 2),
('WAEC Past Questions & Answers Pack', 'waec-exam-series-pack', 'Ten-year WAEC exam series with worked solutions for revision and CBT practice.', 'exam-series', 'SSS3', 'Multiple', 'PDF', true, 3),
('AI Prompt Formats for Teachers', 'ai-prompt-formats-for-teachers', 'Copy-and-paste prompt templates for lesson planning, question generation, marking guides and report comments.', 'ai-prompts', 'All levels', 'General', 'PDF', true, 4),
('Use of AI in the Classroom - Teacher Course', 'ai-class-for-teachers', 'A practical guide and slide deck on running an AI-assisted classroom safely and effectively.', 'ai-class', 'All levels', 'Professional development', 'PDF', false, 5);