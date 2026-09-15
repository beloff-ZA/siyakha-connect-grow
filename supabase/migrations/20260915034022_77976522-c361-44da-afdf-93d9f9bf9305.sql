CREATE TABLE public.logged_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_ref text NOT NULL UNIQUE,
  sit_number text,
  logging_customer text,
  customer_order_ref text,
  end_customer_company text NOT NULL,
  end_customer_first_name text,
  end_customer_last_name text,
  contact_number text,
  contact_email text,
  site_address text,
  city text,
  fault_description text,
  special_instructions text,
  engineer_name text,
  engineer_user_id uuid,
  status text NOT NULL DEFAULT 'new',
  priority text NOT NULL DEFAULT 'normal',
  logged_at timestamptz NOT NULL DEFAULT now(),
  scheduled_at timestamptz,
  arrival_at timestamptz,
  departure_at timestamptz,
  opening_km numeric,
  closing_km numeric,
  fault_solution text,
  change_control text,
  internal_notes text,
  signoff_token text NOT NULL DEFAULT replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  signoff_status text NOT NULL DEFAULT 'pending',
  signed_by_name text,
  signed_by_email text,
  signature_data text,
  satisfaction_rating integer,
  signoff_comment text,
  signed_at timestamptz,
  signed_ip text,
  signed_user_agent text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX logged_calls_signoff_token_key ON public.logged_calls (signoff_token);
CREATE INDEX logged_calls_status_idx ON public.logged_calls (status);
CREATE INDEX logged_calls_created_idx ON public.logged_calls (created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.logged_calls TO authenticated;
GRANT ALL ON public.logged_calls TO service_role;
ALTER TABLE public.logged_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage logged calls" ON public.logged_calls
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.logged_call_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid NOT NULL REFERENCES public.logged_calls(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  serial_number text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX logged_call_items_call_idx ON public.logged_call_items (call_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.logged_call_items TO authenticated;
GRANT ALL ON public.logged_call_items TO service_role;
ALTER TABLE public.logged_call_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage logged call items" ON public.logged_call_items
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER update_logged_calls_updated_at BEFORE UPDATE ON public.logged_calls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_logged_call_items_updated_at BEFORE UPDATE ON public.logged_call_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.logged_call_signoff_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF OLD.signoff_status = 'signed' THEN
    NEW.signature_data := OLD.signature_data;
    NEW.signed_by_name := OLD.signed_by_name;
    NEW.signed_at := OLD.signed_at;
    NEW.signoff_status := 'signed';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER logged_calls_signoff_guard BEFORE UPDATE ON public.logged_calls
  FOR EACH ROW EXECUTE FUNCTION public.logged_call_signoff_guard();