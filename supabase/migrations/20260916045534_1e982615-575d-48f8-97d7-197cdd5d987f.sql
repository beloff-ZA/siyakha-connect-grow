CREATE POLICY "admins read site progress files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'site-progress' AND private.portal_is_admin());
CREATE POLICY "admins write site progress files" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-progress' AND private.portal_is_admin());
CREATE POLICY "admins update site progress files" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-progress' AND private.portal_is_admin());
CREATE POLICY "admins delete site progress files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-progress' AND private.portal_is_admin());