
-- Helpdesk Management System Schema

-- 1. Clients table
CREATE TABLE IF NOT EXISTS public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  client_type text DEFAULT 'business',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access clients" ON public.clients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));
CREATE TRIGGER update_clients_ts BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Technicians table
CREATE TABLE IF NOT EXISTS public.technicians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  email text,
  phone text,
  role text DEFAULT 'technician',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access technicians" ON public.technicians FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));
CREATE TRIGGER update_technicians_ts BEFORE UPDATE ON public.technicians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  website text,
  industry text,
  location text,
  source text DEFAULT 'manual',
  status text DEFAULT 'new',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access leads" ON public.leads FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));
CREATE TRIGGER update_leads_ts BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Email campaigns
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  body_html text,
  body_text text,
  status text DEFAULT 'draft',
  sent_count int DEFAULT 0,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access campaigns" ON public.email_campaigns FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));
CREATE TRIGGER update_campaigns_ts BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Campaign recipients
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES public.email_campaigns(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  name text,
  status text DEFAULT 'pending',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access recipients" ON public.campaign_recipients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));

-- 6. Ticket notes
CREATE TABLE IF NOT EXISTS public.ticket_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  author_id uuid,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.ticket_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins full access notes" ON public.ticket_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));

-- 7. Extend tickets table
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS assigned_technician_id uuid,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS caller_name text,
  ADD COLUMN IF NOT EXISTS caller_email text,
  ADD COLUMN IF NOT EXISTS caller_phone text,
  ADD COLUMN IF NOT EXISTS caller_company text;

-- 8. Admin RLS policies for tickets
CREATE POLICY "Admins can view all tickets" ON public.tickets FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'));
CREATE POLICY "Admins can update all tickets" ON public.tickets FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));
CREATE POLICY "Admins can insert tickets" ON public.tickets FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));
CREATE POLICY "Admins can delete tickets" ON public.tickets FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'));

-- 9. Admin RLS for ticket messages
CREATE POLICY "Admins can view all messages" ON public.ticket_messages FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'));
CREATE POLICY "Admins can insert messages" ON public.ticket_messages FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));

-- 10. Ticket attachments bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', false) ON CONFLICT DO NOTHING;
CREATE POLICY "Auth users can upload ticket attachments" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ticket-attachments');
CREATE POLICY "Auth users can view ticket attachments" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'ticket-attachments');

-- 11. Helper function for technician lookup
CREATE OR REPLACE FUNCTION public.get_technician_id_for_user(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.technicians WHERE user_id = _user_id LIMIT 1
$$;

-- 12. Technicians can view assigned tickets
CREATE POLICY "Technicians view assigned tickets" ON public.tickets FOR SELECT TO authenticated
  USING (assigned_technician_id = public.get_technician_id_for_user(auth.uid()));
