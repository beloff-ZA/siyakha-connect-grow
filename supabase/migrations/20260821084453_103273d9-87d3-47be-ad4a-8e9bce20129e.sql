CREATE TABLE public.portal_building_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  level_code text,
  storey_type text NOT NULL DEFAULT 'storey' CHECK (storey_type IN ('site','basement','ground','storey','roof','other')),
  sort_order integer NOT NULL DEFAULT 0,
  plan_image_path text,
  plan_reference text,
  drawing_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','shared')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_building_levels_project_idx ON public.portal_building_levels (project_id, sort_order);

CREATE TABLE public.portal_device_markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL REFERENCES public.portal_building_levels(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  device_type text NOT NULL DEFAULT 'wifi_ap' CHECK (device_type IN ('wifi_ap','camera','switch','cabinet','ap_bridge','other')),
  label text NOT NULL,
  model text,
  x_pct numeric(6,3) NOT NULL CHECK (x_pct >= 0 AND x_pct <= 100),
  y_pct numeric(6,3) NOT NULL CHECK (y_pct >= 0 AND y_pct <= 100),
  mounting text,
  status text NOT NULL DEFAULT 'preliminary' CHECK (status IN ('preliminary','confirmed','installed')),
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_device_markers_level_idx ON public.portal_device_markers (level_id, sort_order);
CREATE INDEX portal_device_markers_project_idx ON public.portal_device_markers (project_id);

CREATE TRIGGER trg_portal_building_levels_updated
  BEFORE UPDATE ON public.portal_building_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_device_markers_updated
  BEFORE UPDATE ON public.portal_device_markers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION private.portal_can_read_level(_level_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_building_levels l
    WHERE l.id = _level_id
      AND private.portal_can_read_project(l.project_id)
      AND (private.portal_is_admin() OR l.status = 'shared')
  );
$$;

GRANT EXECUTE ON FUNCTION private.portal_can_read_level(uuid) TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_building_levels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_device_markers TO authenticated;
GRANT ALL ON public.portal_building_levels, public.portal_device_markers TO service_role;

ALTER TABLE public.portal_building_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_device_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage building levels" ON public.portal_building_levels FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage device markers" ON public.portal_device_markers FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

CREATE POLICY "clients read shared building levels" ON public.portal_building_levels FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id) AND status = 'shared');
CREATE POLICY "clients read shared device markers" ON public.portal_device_markers FOR SELECT TO authenticated
  USING (private.portal_can_read_level(level_id));

-- ============ SEED: 12 levels for 353 Anton Lembede Street ============
INSERT INTO public.portal_building_levels
  (id, project_id, name, level_code, storey_type, sort_order, plan_image_path, plan_reference, drawing_date, status, notes)
VALUES
  ('e1a11e00-0000-4000-8000-00000000c001','c1a11e00-0000-4000-8000-0000000000a1','Site & Building Context','SITE','site',1,'plans/353-anton-lembede/site-context.png','LTK_207','2026-07-20','shared','Council submission sheet – site and building context.'),
  ('e1a11e00-0000-4000-8000-00000000c002','c1a11e00-0000-4000-8000-0000000000a1','Ground Storey','GF','ground',2,'plans/353-anton-lembede/ground-storey.png','LTK_207','2026-07-20','shared','Council submission sheet – ground storey.'),
  ('e1a11e00-0000-4000-8000-00000000c003','c1a11e00-0000-4000-8000-0000000000a1','1st Storey','L01','storey',3,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c004','c1a11e00-0000-4000-8000-0000000000a1','2nd Storey','L02','storey',4,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c005','c1a11e00-0000-4000-8000-0000000000a1','3rd Storey','L03','storey',5,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c006','c1a11e00-0000-4000-8000-0000000000a1','4th Storey','L04','storey',6,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c007','c1a11e00-0000-4000-8000-0000000000a1','5th Storey','L05','storey',7,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c008','c1a11e00-0000-4000-8000-0000000000a1','6th Storey','L06','storey',8,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c009','c1a11e00-0000-4000-8000-0000000000a1','7th Storey','L07','storey',9,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c010','c1a11e00-0000-4000-8000-0000000000a1','8th Storey','L08','storey',10,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c011','c1a11e00-0000-4000-8000-0000000000a1','9th Storey','L09','storey',11,'plans/353-anton-lembede/typical-storey.png','LTK_207','2026-07-20','shared','Typical storey sheet from the council submission.'),
  ('e1a11e00-0000-4000-8000-00000000c012','c1a11e00-0000-4000-8000-0000000000a1','Roof Plan','RF','roof',12,'plans/353-anton-lembede/roof-plan.png','LTK_207','2026-07-20','shared','Council submission sheet – roof plan.')
ON CONFLICT (id) DO NOTHING;

-- ============ SEED: exactly 100 preliminary AP markers ============
INSERT INTO public.portal_device_markers
  (level_id, project_id, device_type, label, model, x_pct, y_pct, mounting, status, notes, sort_order)
SELECT
  l.id,
  l.project_id,
  'wifi_ap',
  'AP-' || l.level_code || '-' || lpad(g.n::text, 2, '0'),
  'TBC',
  g.x,
  g.y,
  'Ceiling mounted (to be confirmed on site survey)',
  'preliminary',
  'Preliminary placement indicated on the council submission sheet. Position and count to be confirmed by site survey and predictive coverage design.',
  g.n
FROM public.portal_building_levels l
JOIN (VALUES
  (1, 22.0, 12.0),
  (2, 60.0, 13.0),
  (3, 78.0, 20.0),
  (4, 22.0, 32.0),
  (5, 60.0, 30.0),
  (6, 78.0, 42.0),
  (7, 22.0, 52.0),
  (8, 60.0, 55.0),
  (9, 40.0, 70.0),
  (10, 72.0, 72.0)
) AS g(n, x, y) ON true
WHERE l.project_id = 'c1a11e00-0000-4000-8000-0000000000a1'
  AND l.storey_type IN ('ground','storey')
  AND NOT EXISTS (
    SELECT 1 FROM public.portal_device_markers m WHERE m.project_id = l.project_id
  );