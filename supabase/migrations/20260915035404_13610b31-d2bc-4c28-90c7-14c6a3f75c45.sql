CREATE TABLE public.logged_call_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES public.logged_calls(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  label TEXT,
  uploaded_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_logged_call_attachments_call ON public.logged_call_attachments(call_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.logged_call_attachments TO authenticated;
GRANT ALL ON public.logged_call_attachments TO service_role;

ALTER TABLE public.logged_call_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage call attachments" ON public.logged_call_attachments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Staff read job card files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'job-card-files');
CREATE POLICY "Staff upload job card files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'job-card-files');
CREATE POLICY "Staff update job card files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'job-card-files');
CREATE POLICY "Staff delete job card files" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'job-card-files');