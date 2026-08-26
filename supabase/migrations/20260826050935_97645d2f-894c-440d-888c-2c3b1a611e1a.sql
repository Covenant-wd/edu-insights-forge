
CREATE POLICY "Editors can upload post images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'post-images' AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor')));

CREATE POLICY "Editors can update post images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'post-images' AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor')));

CREATE POLICY "Editors can delete post images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'post-images' AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor')));

CREATE POLICY "Editors can read post images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'post-images' AND (private.has_role(auth.uid(),'admin') OR private.has_role(auth.uid(),'editor')));
