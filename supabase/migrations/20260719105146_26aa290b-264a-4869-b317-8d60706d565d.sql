
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

ALTER FUNCTION public.has_role(uuid, public.app_role) SET SCHEMA private;
ALTER FUNCTION public.get_technician_id_for_user(uuid) SET SCHEMA private;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.get_technician_id_for_user(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.get_technician_id_for_user(uuid) TO authenticated, service_role;

CREATE POLICY "Users manage own director_costs"
ON public.director_costs FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Ticket owners can insert messages"
ON public.ticket_messages FOR INSERT TO authenticated
WITH CHECK (
  ticket_id IN (
    SELECT id FROM public.tickets WHERE created_by_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Authenticated users can upload CVs" ON storage.objects;
CREATE POLICY "Users upload CVs into own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'cvs'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Auth users can upload ticket attachments" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can view ticket attachments" ON storage.objects;

CREATE POLICY "Ticket participants upload attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'ticket-attachments'
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.created_by_user_id = auth.uid()
        OR t.assigned_technician_id = private.get_technician_id_for_user(auth.uid())
        OR private.has_role(auth.uid(), 'siyakha_admin'::public.app_role)
      )
  )
);

CREATE POLICY "Ticket participants view attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'ticket-attachments'
  AND EXISTS (
    SELECT 1 FROM public.tickets t
    WHERE t.id::text = (storage.foldername(name))[1]
      AND (
        t.created_by_user_id = auth.uid()
        OR t.assigned_technician_id = private.get_technician_id_for_user(auth.uid())
        OR private.has_role(auth.uid(), 'siyakha_admin'::public.app_role)
      )
  )
);

DROP POLICY IF EXISTS "Anyone can read website order files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload website order files" ON storage.objects;

CREATE POLICY "Public can upload website order files"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'website-orders');

CREATE POLICY "Admins read website order files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'website-orders'
  AND private.has_role(auth.uid(), 'siyakha_admin'::public.app_role)
);
