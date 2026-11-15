DROP POLICY IF EXISTS "Public can upload website order files" ON storage.objects;

DROP POLICY IF EXISTS "Staff read job card files" ON storage.objects;
DROP POLICY IF EXISTS "Staff upload job card files" ON storage.objects;
DROP POLICY IF EXISTS "Staff update job card files" ON storage.objects;
DROP POLICY IF EXISTS "Staff delete job card files" ON storage.objects;

CREATE POLICY "Admins or uploader read job card files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'job-card-files' AND (private.portal_is_admin() OR owner_id = (select auth.uid()::text)));
CREATE POLICY "Admins or uploader upload job card files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'job-card-files' AND (private.portal_is_admin() OR owner_id = (select auth.uid()::text)));
CREATE POLICY "Admins or uploader update job card files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'job-card-files' AND (private.portal_is_admin() OR owner_id = (select auth.uid()::text)))
  WITH CHECK (bucket_id = 'job-card-files' AND (private.portal_is_admin() OR owner_id = (select auth.uid()::text)));
CREATE POLICY "Admins or uploader delete job card files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'job-card-files' AND (private.portal_is_admin() OR owner_id = (select auth.uid()::text)));