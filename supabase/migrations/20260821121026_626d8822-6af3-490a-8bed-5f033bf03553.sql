CREATE TABLE IF NOT EXISTS public.portal_rack_equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  rack_marker_id uuid NOT NULL REFERENCES public.portal_floor_markers(id) ON DELETE CASCADE,
  equipment_type text NOT NULL DEFAULT 'switch',
  manufacturer text NOT NULL,
  model text NOT NULL,
  description text,
  rack_units integer NOT NULL DEFAULT 1 CHECK (rack_units > 0 AND rack_units <= 42),
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  port_count integer CHECK (port_count IS NULL OR port_count > 0),
  port_type text,
  poe_capable boolean NOT NULL DEFAULT false,
  layer3_capable boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 1,
  status public.portal_marker_state NOT NULL DEFAULT 'planned',
  client_visible boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_rack_equipment_rack_model_key UNIQUE (rack_marker_id, model)
);

CREATE INDEX IF NOT EXISTS portal_rack_equipment_project_idx ON public.portal_rack_equipment(project_id);
CREATE INDEX IF NOT EXISTS portal_rack_equipment_rack_idx ON public.portal_rack_equipment(rack_marker_id);
CREATE INDEX IF NOT EXISTS portal_rack_equipment_model_idx ON public.portal_rack_equipment(model);

GRANT SELECT ON public.portal_rack_equipment TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.portal_rack_equipment TO authenticated;
GRANT ALL ON public.portal_rack_equipment TO service_role;

ALTER TABLE public.portal_rack_equipment ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal rack equipment admin manage" ON public.portal_rack_equipment;
CREATE POLICY "portal rack equipment admin manage"
  ON public.portal_rack_equipment FOR ALL TO authenticated
  USING (private.portal_is_admin())
  WITH CHECK (private.portal_is_admin());

DROP POLICY IF EXISTS "portal rack equipment client read" ON public.portal_rack_equipment;
CREATE POLICY "portal rack equipment client read"
  ON public.portal_rack_equipment FOR SELECT TO authenticated
  USING (client_visible AND private.portal_can_read_project(project_id));

DROP TRIGGER IF EXISTS trg_portal_rack_equipment_updated ON public.portal_rack_equipment;
CREATE TRIGGER trg_portal_rack_equipment_updated
  BEFORE UPDATE ON public.portal_rack_equipment
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the final rack equipment configuration for 353 Anton Lembede Street.
-- One 24-port L3 PoE access switch in every rack (Levels 0-10), plus one
-- 10G SFP+ fibre aggregation switch in the Level 0 ground-floor rack only.
INSERT INTO public.portal_rack_equipment (
  project_id, rack_marker_id, equipment_type, manufacturer, model, description,
  rack_units, quantity, port_count, port_type, poe_capable, layer3_capable,
  sort_order, status, client_visible, notes
)
SELECT
  m.project_id, m.id, 'access_switch', 'Grandstream', 'GWN7813P',
  '24-port Layer 3 managed PoE switch (1U)',
  1, 1, 24, 'RJ45 PoE', true, true,
  1, 'planned'::public.portal_marker_state, true,
  'Serves the Wi-Fi access points and CCTV cameras on this level. Final port allocation confirmed during commissioning.'
FROM public.portal_floor_markers m
JOIN public.portal_floors f ON f.id = m.floor_id
WHERE m.project_id = 'c1a11e00-0000-4000-8000-0000000000a1'
  AND m.marker_type = 'rack'::public.portal_marker_kind
  AND f.level_number BETWEEN 0 AND 10
ON CONFLICT (rack_marker_id, model) DO NOTHING;

INSERT INTO public.portal_rack_equipment (
  project_id, rack_marker_id, equipment_type, manufacturer, model, description,
  rack_units, quantity, port_count, port_type, poe_capable, layer3_capable,
  sort_order, status, client_visible, notes
)
SELECT
  m.project_id, m.id, 'aggregation_switch', 'Grandstream', 'GWN7832',
  'Layer 3 fibre aggregation switch, 12 x 10G SFP+ (1U)',
  1, 1, 12, '10G SFP+', false, true,
  2, 'planned'::public.portal_marker_state, true,
  'Building fibre backbone hub: ten planned uplinks, one to each Level 1-10 rack, leaving two SFP+ ports spare. Fibre type, transceivers, routing and lengths remain TBC after riser and site survey.'
FROM public.portal_floor_markers m
JOIN public.portal_floors f ON f.id = m.floor_id
WHERE m.project_id = 'c1a11e00-0000-4000-8000-0000000000a1'
  AND m.marker_type = 'rack'::public.portal_marker_kind
  AND f.level_number = 0
ON CONFLICT (rack_marker_id, model) DO NOTHING;