CREATE POLICY "portal storage client read projects prefix"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = ANY (ARRAY['client-documents'::text, 'client-photos'::text])
  AND (storage.foldername(name))[1] = 'projects'
  AND (storage.foldername(name))[2] ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  AND private.portal_can_read_project(((storage.foldername(name))[2])::uuid)
);