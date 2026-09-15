ALTER TABLE public.logged_calls
  ADD COLUMN IF NOT EXISTS logging_contact_name text,
  ADD COLUMN IF NOT EXISTS logging_contact_email text,
  ADD COLUMN IF NOT EXISTS update_emails_enabled boolean NOT NULL DEFAULT true;

UPDATE public.logged_calls
SET logging_contact_name = 'Danelle van den Berg',
    logging_contact_email = 'support@satio.co.za'
WHERE logging_customer ILIKE '%satio%'
  AND logging_contact_email IS NULL;