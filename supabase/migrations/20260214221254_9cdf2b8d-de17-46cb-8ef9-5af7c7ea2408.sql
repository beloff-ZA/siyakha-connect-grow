
-- 1. Job applications: Only admins can view
CREATE POLICY "Only admins can view job applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'siyakha_admin')
);

-- 2. Companies: UPDATE restricted to company admin/owner members
CREATE POLICY "Company admins can update their companies"
ON public.companies FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = companies.id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = companies.id
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
);

-- Companies: DELETE restricted to owners only
CREATE POLICY "Company owners can delete their companies"
ON public.companies FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_members
    WHERE company_id = companies.id
    AND user_id = auth.uid()
    AND role = 'owner'
  )
);

-- 3. CV Storage: Replace permissive anonymous upload with authenticated-only
DROP POLICY IF EXISTS "Anyone can upload CVs" ON storage.objects;

CREATE POLICY "Authenticated users can upload CVs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cvs'
);

-- Admins can read CVs
CREATE POLICY "Admins can read CVs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cvs'
  AND public.has_role(auth.uid(), 'siyakha_admin')
);
