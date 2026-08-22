DROP POLICY IF EXISTS "product catalog admin manage" ON storage.objects;
CREATE POLICY "product catalog admin manage"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'product-catalog' AND private.portal_is_admin())
  WITH CHECK (bucket_id = 'product-catalog' AND private.portal_is_admin());