-- 1. Call records: replace blanket authenticated access with admin/creator scope.
DROP POLICY IF EXISTS "Staff manage logged calls" ON public.logged_calls;
CREATE POLICY "Admins and the logging user manage calls"
  ON public.logged_calls FOR ALL TO authenticated
  USING (private.portal_is_admin() OR created_by = auth.uid())
  WITH CHECK (private.portal_is_admin() OR created_by = auth.uid());

DROP POLICY IF EXISTS "Staff manage logged call items" ON public.logged_call_items;
CREATE POLICY "Admins and the logging user manage call items"
  ON public.logged_call_items FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.logged_calls c
    WHERE c.id = logged_call_items.call_id
      AND (private.portal_is_admin() OR c.created_by = auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.logged_calls c
    WHERE c.id = logged_call_items.call_id
      AND (private.portal_is_admin() OR c.created_by = auth.uid())
  ));

DROP POLICY IF EXISTS "Staff manage call attachments" ON public.logged_call_attachments;
CREATE POLICY "Admins and the logging user manage call attachments"
  ON public.logged_call_attachments FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.logged_calls c
    WHERE c.id = logged_call_attachments.call_id
      AND (private.portal_is_admin() OR c.created_by = auth.uid())
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.logged_calls c
    WHERE c.id = logged_call_attachments.call_id
      AND (private.portal_is_admin() OR c.created_by = auth.uid())
  ));

-- 2. Project documents: clients only ever see released documents.
DROP POLICY IF EXISTS "portal documents client read" ON public.portal_documents;
DROP POLICY IF EXISTS "portal_documents client read" ON public.portal_documents;
CREATE POLICY "portal documents client read released only"
  ON public.portal_documents FOR SELECT TO authenticated
  USING (
    private.portal_is_admin()
    OR (client_visible = true AND archived = false AND private.portal_can_read_project(project_id))
  );

-- 3. Encrypted copy of an issued share link, so admins can re-copy it later.
ALTER TABLE public.portal_share_links ADD COLUMN IF NOT EXISTS token_cipher text;