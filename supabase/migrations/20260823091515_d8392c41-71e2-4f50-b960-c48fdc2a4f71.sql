-- Client project-deck engagement: viewer registration, BOQ acceptance,
-- two-way client notes and per-project delivery summary settings.
-- All guest/token access happens through the deck-client edge function using the
-- service role; these tables are otherwise admin-only (no anon grants).

/* ---------------------------------------------------------- viewer sessions */
CREATE TABLE public.portal_deck_viewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid NOT NULL REFERENCES public.portal_share_links(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  surname text NOT NULL,
  email text NOT NULL,
  consent_at timestamptz NOT NULL DEFAULT now(),
  session_token_hash text NOT NULL UNIQUE,
  session_expires_at timestamptz,
  first_viewed_at timestamptz NOT NULL DEFAULT now(),
  last_viewed_at timestamptz NOT NULL DEFAULT now(),
  view_count integer NOT NULL DEFAULT 1,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (share_link_id, email)
);
CREATE INDEX portal_deck_viewers_project_idx ON public.portal_deck_viewers (project_id);
GRANT SELECT ON public.portal_deck_viewers TO authenticated;
GRANT ALL ON public.portal_deck_viewers TO service_role;
ALTER TABLE public.portal_deck_viewers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read deck viewers" ON public.portal_deck_viewers
  FOR SELECT TO authenticated USING (private.portal_is_admin());

/* -------------------------------------------------------- BOQ acceptances */
CREATE TABLE public.portal_boq_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  boq_id uuid NOT NULL REFERENCES public.portal_boqs(id) ON DELETE CASCADE,
  revision_label text,
  revision_hash text NOT NULL,
  share_link_id uuid REFERENCES public.portal_share_links(id) ON DELETE SET NULL,
  viewer_id uuid REFERENCES public.portal_deck_viewers(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  po_reference text,
  subtotal numeric(14,2) NOT NULL,
  vat numeric(14,2) NOT NULL,
  total numeric(14,2) NOT NULL,
  vat_rate numeric(6,4) NOT NULL DEFAULT 15,
  terms_text text NOT NULL,
  terms_version text NOT NULL,
  status text NOT NULL DEFAULT 'accepted',
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (viewer_id, revision_hash)
);
CREATE INDEX portal_boq_acceptances_project_idx ON public.portal_boq_acceptances (project_id);
GRANT SELECT ON public.portal_boq_acceptances TO authenticated;
GRANT ALL ON public.portal_boq_acceptances TO service_role;
ALTER TABLE public.portal_boq_acceptances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read boq acceptances" ON public.portal_boq_acceptances
  FOR SELECT TO authenticated USING (private.portal_is_admin());

-- Append-only: an accepted snapshot can never be edited or removed.
CREATE OR REPLACE FUNCTION public.portal_boq_acceptance_immutable()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'BOQ acceptances are append-only';
END;
$$;
CREATE TRIGGER portal_boq_acceptances_no_change
  BEFORE UPDATE OR DELETE ON public.portal_boq_acceptances
  FOR EACH ROW EXECUTE FUNCTION public.portal_boq_acceptance_immutable();

/* ------------------------------------------------------ client note threads */
CREATE TABLE public.portal_client_note_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  share_link_id uuid REFERENCES public.portal_share_links(id) ON DELETE SET NULL,
  viewer_id uuid REFERENCES public.portal_deck_viewers(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'general',
  subject text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_client_note_threads_project_idx ON public.portal_client_note_threads (project_id);
GRANT SELECT, UPDATE ON public.portal_client_note_threads TO authenticated;
GRANT ALL ON public.portal_client_note_threads TO service_role;
ALTER TABLE public.portal_client_note_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage client note threads" ON public.portal_client_note_threads
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

CREATE TABLE public.portal_client_note_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.portal_client_note_threads(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  author_kind text NOT NULL CHECK (author_kind IN ('client', 'siyakha')),
  author_name text NOT NULL,
  viewer_id uuid REFERENCES public.portal_deck_viewers(id) ON DELETE SET NULL,
  author_user_id uuid,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_client_note_messages_thread_idx ON public.portal_client_note_messages (thread_id);
GRANT SELECT, INSERT ON public.portal_client_note_messages TO authenticated;
GRANT ALL ON public.portal_client_note_messages TO service_role;
ALTER TABLE public.portal_client_note_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage client note messages" ON public.portal_client_note_messages
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

/* -------------------------------------------------- delivery summary config */
CREATE TABLE public.portal_project_delivery_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL UNIQUE REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  executive_summary text,
  delivery_objectives text,
  team_size integer,
  duration_weeks integer,
  lead_engineer_count integer,
  lead_engineer_role text,
  temp_cctv_enabled boolean NOT NULL DEFAULT false,
  temp_cctv_notes text,
  power_backup_hours numeric(6,2),
  power_backup_qualification text,
  cctv_recording_mode text,
  cctv_average_bitrate_kbps integer,
  cctv_duty_cycle numeric(4,3),
  cctv_codec text,
  hdd_raw_tb numeric(8,2),
  hdd_usable_factor numeric(4,3),
  methodology text,
  benefits_narrative text,
  assumptions text,
  exclusions text,
  stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT, INSERT, UPDATE ON public.portal_project_delivery_settings TO authenticated;
GRANT ALL ON public.portal_project_delivery_settings TO service_role;
ALTER TABLE public.portal_project_delivery_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage delivery settings" ON public.portal_project_delivery_settings
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE TRIGGER portal_delivery_settings_updated_at
  BEFORE UPDATE ON public.portal_project_delivery_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();