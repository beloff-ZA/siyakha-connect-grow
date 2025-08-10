-- Phase 1 schema for multi-tenant ops (tickets, messages, partners) using existing company membership helpers
-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_channel') THEN
    CREATE TYPE public.ticket_channel AS ENUM ('whatsapp','email','phone','portal');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
    CREATE TYPE public.ticket_priority AS ENUM ('low','normal','high','urgent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE public.ticket_status AS ENUM ('new','triage','assigned','in_progress','halted','awaiting_client','completed','closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_direction') THEN
    CREATE TYPE public.message_direction AS ENUM ('inbound','outbound');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_channel') THEN
    CREATE TYPE public.message_channel AS ENUM ('whatsapp','email');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
    CREATE TYPE public.message_status AS ENUM ('inbound_received','pending_send','sent_manual','sent_api','failed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_type') THEN
    CREATE TYPE public.partner_type AS ENUM ('technician','subcontractor','freelancer');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_status') THEN
    CREATE TYPE public.partner_status AS ENUM ('submitted','review','approved','declined','suspended');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_tier') THEN
    CREATE TYPE public.partner_tier AS ENUM ('probation','standard','premium');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'partner_document_type') THEN
    CREATE TYPE public.partner_document_type AS ENUM ('id','company_reg','insurance','certification','safety');
  END IF;
END $$;

-- Service categories
CREATE TABLE IF NOT EXISTS public.service_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  sla_response_mins integer NOT NULL DEFAULT 240,
  sla_resolve_mins integer NOT NULL DEFAULT 1440,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_service_categories_company ON public.service_categories(company_id);
CREATE TRIGGER service_categories_set_updated_at
  BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tickets (tenant-scoped via company_id)
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL,
  client_account_id uuid NULL,
  channel ticket_channel NOT NULL DEFAULT 'portal',
  source_message_id text NULL,
  service_category_id uuid NULL,
  priority ticket_priority NOT NULL DEFAULT 'normal',
  status ticket_status NOT NULL DEFAULT 'new',
  sla_response_due_at timestamptz NULL,
  sla_resolve_due_at timestamptz NULL,
  assigned_partner_id uuid NULL,
  assigned_user_id uuid NULL,
  summary text NOT NULL,
  details text NULL,
  location text NULL,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  tracking_ref text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tickets_company ON public.tickets(company_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_partner ON public.tickets(assigned_partner_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_user ON public.tickets(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON public.tickets(created_at);
CREATE TRIGGER tickets_set_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Ticket messages
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  direction message_direction NOT NULL,
  channel message_channel NOT NULL,
  to_from text NOT NULL,
  subject text NULL,
  body text NOT NULL,
  raw_headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_ids jsonb NOT NULL DEFAULT '{}'::jsonb,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  status message_status NOT NULL DEFAULT 'pending_send',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_created_at ON public.ticket_messages(created_at);
CREATE TRIGGER ticket_messages_set_updated_at
  BEFORE UPDATE ON public.ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Partners
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  partner_type partner_type NOT NULL,
  company_name text NULL,
  individual_name text NULL,
  whatsapp text NULL,
  email text NULL,
  regions jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills jsonb NOT NULL DEFAULT '[]'::jsonb,
  tier partner_tier NOT NULL DEFAULT 'probation',
  status partner_status NOT NULL DEFAULT 'submitted',
  profile_score integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_partners_company ON public.partners(company_id);
CREATE TRIGGER partners_set_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Partner documents
CREATE TABLE IF NOT EXISTS public.partner_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL,
  type partner_document_type NOT NULL,
  file_url text NOT NULL,
  issued_at date NULL,
  expires_at date NULL,
  verified boolean NOT NULL DEFAULT false,
  notes text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.partner_documents ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_partner_docs_partner ON public.partner_documents(partner_id);
CREATE TRIGGER partner_documents_set_updated_at
  BEFORE UPDATE ON public.partner_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
-- service_categories policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_categories' AND policyname='service_categories_select_members'
  ) THEN
    CREATE POLICY service_categories_select_members ON public.service_categories
      FOR SELECT USING (is_company_member(company_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_categories' AND policyname='service_categories_insert_members'
  ) THEN
    CREATE POLICY service_categories_insert_members ON public.service_categories
      FOR INSERT WITH CHECK (is_company_member(company_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_categories' AND policyname='service_categories_update_members'
  ) THEN
    CREATE POLICY service_categories_update_members ON public.service_categories
      FOR UPDATE USING (is_company_member(company_id)) WITH CHECK (is_company_member(company_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='service_categories' AND policyname='service_categories_delete_members'
  ) THEN
    CREATE POLICY service_categories_delete_members ON public.service_categories
      FOR DELETE USING (is_company_member(company_id));
  END IF;
END $$;

-- tickets policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tickets' AND policyname='tickets_select_members_or_creator'
  ) THEN
    CREATE POLICY tickets_select_members_or_creator ON public.tickets
      FOR SELECT USING (is_company_member(company_id) OR (auth.uid() = created_by_user_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tickets' AND policyname='tickets_insert_creator_and_member'
  ) THEN
    CREATE POLICY tickets_insert_creator_and_member ON public.tickets
      FOR INSERT WITH CHECK ((auth.uid() = created_by_user_id) AND ((company_id IS NULL) OR is_company_member(company_id)));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tickets' AND policyname='tickets_update_members_or_creator'
  ) THEN
    CREATE POLICY tickets_update_members_or_creator ON public.tickets
      FOR UPDATE USING (is_company_member(company_id) OR (auth.uid() = created_by_user_id))
      WITH CHECK (is_company_member(company_id) OR (auth.uid() = created_by_user_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tickets' AND policyname='tickets_delete_creator_only'
  ) THEN
    CREATE POLICY tickets_delete_creator_only ON public.tickets
      FOR DELETE USING (auth.uid() = created_by_user_id);
  END IF;
END $$;

-- ticket_messages policies (inherit from parent ticket)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ticket_messages' AND policyname='ticket_messages_select_via_ticket'
  ) THEN
    CREATE POLICY ticket_messages_select_via_ticket ON public.ticket_messages
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = ticket_messages.ticket_id
            AND (is_company_member(t.company_id) OR (auth.uid() = t.created_by_user_id))
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ticket_messages' AND policyname='ticket_messages_insert_via_ticket'
  ) THEN
    CREATE POLICY ticket_messages_insert_via_ticket ON public.ticket_messages
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = ticket_messages.ticket_id
            AND (is_company_member(t.company_id) OR (auth.uid() = t.created_by_user_id))
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ticket_messages' AND policyname='ticket_messages_update_via_ticket'
  ) THEN
    CREATE POLICY ticket_messages_update_via_ticket ON public.ticket_messages
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = ticket_messages.ticket_id
            AND (is_company_member(t.company_id) OR (auth.uid() = t.created_by_user_id))
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = ticket_messages.ticket_id
            AND (is_company_member(t.company_id) OR (auth.uid() = t.created_by_user_id))
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='ticket_messages' AND policyname='ticket_messages_delete_via_ticket'
  ) THEN
    CREATE POLICY ticket_messages_delete_via_ticket ON public.ticket_messages
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.tickets t
          WHERE t.id = ticket_messages.ticket_id
            AND (auth.uid() = t.created_by_user_id)
        )
      );
  END IF;
END $$;

-- partners policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partners' AND policyname='partners_select_members'
  ) THEN
    CREATE POLICY partners_select_members ON public.partners
      FOR SELECT USING (is_company_member(company_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partners' AND policyname='partners_insert_members'
  ) THEN
    CREATE POLICY partners_insert_members ON public.partners
      FOR INSERT WITH CHECK (is_company_member(company_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partners' AND policyname='partners_update_members'
  ) THEN
    CREATE POLICY partners_update_members ON public.partners
      FOR UPDATE USING (is_company_member(company_id)) WITH CHECK (is_company_member(company_id));
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partners' AND policyname='partners_delete_members'
  ) THEN
    CREATE POLICY partners_delete_members ON public.partners
      FOR DELETE USING (is_company_member(company_id));
  END IF;
END $$;

-- partner_documents policies (via partner.company_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partner_documents' AND policyname='partner_docs_select_via_partner'
  ) THEN
    CREATE POLICY partner_docs_select_via_partner ON public.partner_documents
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.partners p
          WHERE p.id = partner_documents.partner_id AND is_company_member(p.company_id)
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partner_documents' AND policyname='partner_docs_insert_via_partner'
  ) THEN
    CREATE POLICY partner_docs_insert_via_partner ON public.partner_documents
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.partners p
          WHERE p.id = partner_documents.partner_id AND is_company_member(p.company_id)
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partner_documents' AND policyname='partner_docs_update_via_partner'
  ) THEN
    CREATE POLICY partner_docs_update_via_partner ON public.partner_documents
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.partners p
          WHERE p.id = partner_documents.partner_id AND is_company_member(p.company_id)
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.partners p
          WHERE p.id = partner_documents.partner_id AND is_company_member(p.company_id)
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='partner_documents' AND policyname='partner_docs_delete_via_partner'
  ) THEN
    CREATE POLICY partner_docs_delete_via_partner ON public.partner_documents
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.partners p
          WHERE p.id = partner_documents.partner_id AND is_company_member(p.company_id)
        )
      );
  END IF;
END $$;
