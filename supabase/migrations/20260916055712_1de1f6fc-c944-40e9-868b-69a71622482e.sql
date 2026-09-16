-- 1. Work date vs submission time, and baseline tagging
ALTER TABLE public.portal_site_updates
  ADD COLUMN IF NOT EXISTS baseline_category text,
  ADD COLUMN IF NOT EXISTS backdated boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.portal_site_update_date_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.shift_date IS NULL THEN
    NEW.shift_date := (now() AT TIME ZONE 'Africa/Johannesburg')::date;
  END IF;
  IF NEW.shift_date > ((now() AT TIME ZONE 'Africa/Johannesburg')::date) THEN
    RAISE EXCEPTION 'A site update cannot be recorded for a future work date';
  END IF;
  NEW.backdated := NEW.shift_date < ((now() AT TIME ZONE 'Africa/Johannesburg')::date);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portal_site_update_date_guard ON public.portal_site_updates;
CREATE TRIGGER portal_site_update_date_guard
  BEFORE INSERT OR UPDATE OF shift_date ON public.portal_site_updates
  FOR EACH ROW EXECUTE FUNCTION public.portal_site_update_date_guard();

-- 2. Additional / out-of-scope work register (operational only, never commercial)
CREATE TABLE IF NOT EXISTS public.portal_scope_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  floor_id uuid REFERENCES public.portal_floors(id) ON DELETE SET NULL,
  update_id uuid REFERENCES public.portal_site_updates(id) ON DELETE SET NULL,
  issue_id uuid REFERENCES public.portal_site_issues(id) ON DELETE SET NULL,
  work_date date NOT NULL,
  area_label text,
  title text NOT NULL,
  description text,
  trigger_reason text,
  source text NOT NULL DEFAULT 'site_condition'
    CHECK (source IN ('field_update', 'admin_update', 'client_instruction', 'site_condition')),
  baseline_category text,
  status text NOT NULL DEFAULT 'under_review'
    CHECK (status IN ('identified', 'under_review', 'approved_to_proceed', 'completed', 'not_proceeding')),
  internal_notes text,
  client_visible boolean NOT NULL DEFAULT false,
  raised_by_name text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_scope_changes TO authenticated;
GRANT ALL ON public.portal_scope_changes TO service_role;

ALTER TABLE public.portal_scope_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project managers manage additional works"
  ON public.portal_scope_changes FOR ALL TO authenticated
  USING (public.portal_can_manage_project(project_id))
  WITH CHECK (public.portal_can_manage_project(project_id));

CREATE TRIGGER portal_scope_changes_updated_at
  BEFORE UPDATE ON public.portal_scope_changes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS portal_scope_changes_project_idx
  ON public.portal_scope_changes (project_id, work_date DESC);

-- 3. Photos may also evidence an additional-work entry
ALTER TABLE public.portal_site_update_photos
  ADD COLUMN IF NOT EXISTS scope_change_id uuid REFERENCES public.portal_scope_changes(id) ON DELETE SET NULL;

-- 4. Confirmed site history (work dates; no invented quantities or photos)
INSERT INTO public.portal_site_updates
  (id, project_id, floor_id, shift_date, submitted_by_name, source, category,
   work_completed, blockers, progress_pct, approval_status, client_visible,
   photo_evidence_required, photos_outstanding, approved_at, published_at)
VALUES
  ('e1000000-0000-4000-8000-00000000d210', 'e1000000-0000-4000-8000-00000000d1c3', NULL,
   '2026-09-10', 'Siyakha Technology Solutions', 'admin', 'Health & Safety',
   'The team completed the Health & Safety check-in and site induction. No quantities supplied.',
   NULL, 0, 'approved', true, false, false, now(), now()),
  ('e1000000-0000-4000-8000-00000000d211', 'e1000000-0000-4000-8000-00000000d1c3', NULL,
   '2026-09-11', 'Siyakha Technology Solutions', 'admin', 'Cabling',
   'The team commenced pulling cables to the network points. No quantities supplied.',
   NULL, 0, 'approved', true, true, true, now(), now()),
  ('e1000000-0000-4000-8000-00000000d212', 'e1000000-0000-4000-8000-00000000d1c3', NULL,
   '2026-09-12', 'Siyakha Technology Solutions', 'admin', 'Cabling',
   'The team continued pulling cables to the network points. No quantities supplied.',
   NULL, 0, 'approved', true, true, true, now(), now()),
  ('e1000000-0000-4000-8000-00000000d213', 'e1000000-0000-4000-8000-00000000d1c3', NULL,
   '2026-09-14', 'Siyakha Technology Solutions', 'admin', 'Site Constraint',
   'The team continued pulling cables to the network points. A routing and access challenge was encountered for the drops to the required points because suitable, accessible routing and containment was not available. No quantities supplied.',
   'Suitable accessible routing/containment was not available for the drops to the required points, so additional routing and containment was required.',
   0, 'approved', true, true, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 5. Additional routing flagged for office review (no pricing, no entitlement stated)
INSERT INTO public.portal_scope_changes
  (id, project_id, floor_id, update_id, work_date, title, description, trigger_reason,
   source, baseline_category, status, internal_notes, client_visible, raised_by_name)
VALUES
  ('e1000000-0000-4000-8000-00000000d301', 'e1000000-0000-4000-8000-00000000d1c3',
   'dc6999e9-4394-4d94-8902-0771bcde8c58', 'e1000000-0000-4000-8000-00000000d202',
   '2026-09-15',
   'Additional routing and containment installed to reach required drops',
   'Additional routing and containment was installed to overcome the drop and access challenge encountered on site. 9 PVC pipes were installed and allocated to the Fifth Floor.',
   'Suitable accessible routing/containment was not available for the planned drops (14 September site condition).',
   'admin_update', 'LAN New Install', 'under_review',
   'Recorded for office review against the scope of works, which assumes existing containment and pathways are sufficient and excludes new containment or trunking beyond minor cable pathway adjustments. Operational record only — no pricing or entitlement determined.',
   false, 'Siyakha Technology Solutions')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.portal_activity (project_id, entity_type, entity_id, action, detail, actor_type)
VALUES ('e1000000-0000-4000-8000-00000000d1c3', 'scope_change',
        'e1000000-0000-4000-8000-00000000d301', 'additional_work_identified',
        'Additional routing/containment on the Fifth Floor recorded as potential additional work, under review. No pricing recorded.',
        'admin');
