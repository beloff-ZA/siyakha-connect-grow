-- Extend rack equipment register with QS-grade attributes, dedupe guard and audit history.
ALTER TABLE public.portal_rack_equipment
  ADD COLUMN IF NOT EXISTS floor_id uuid REFERENCES public.portal_floors(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS equipment_name text,
  ADD COLUMN IF NOT EXISTS rack_position integer,
  ADD COLUMN IF NOT EXISTS copper_ports integer,
  ADD COLUMN IF NOT EXISTS sfp_ports integer,
  ADD COLUMN IF NOT EXISTS sfp_plus_ports integer,
  ADD COLUMN IF NOT EXISTS network_layer text,
  ADD COLUMN IF NOT EXISTS product_url text,
  ADD COLUMN IF NOT EXISTS serial_number text,
  ADD COLUMN IF NOT EXISTS mac_address text,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- Backfill from existing columns; no fabricated serials, MACs or dates.
UPDATE public.portal_rack_equipment e
   SET floor_id = coalesce(e.floor_id, m.floor_id),
       role = coalesce(e.role, case when e.equipment_type = 'aggregation_switch'
                                    then 'Building fibre aggregation / core'
                                    else 'Floor access / PoE switch' end),
       equipment_name = coalesce(e.equipment_name, case
         when e.model = 'GWN7813P' then 'Grandstream GWN7813P 24-Port Layer 3 Managed PoE Switch'
         when e.model = 'GWN7832' then 'Grandstream GWN7832 Layer 3 Fibre Aggregation Switch'
         else trim(coalesce(e.manufacturer,'') || ' ' || coalesce(e.model,'')) end),
       rack_position = coalesce(e.rack_position, e.sort_order),
       copper_ports = coalesce(e.copper_ports, case when e.port_type ilike '%SFP%' then null else e.port_count end),
       sfp_plus_ports = coalesce(e.sfp_plus_ports, case when e.port_type ilike '%SFP+%' then e.port_count else null end),
       network_layer = coalesce(e.network_layer, case when e.layer3_capable then 'Layer 3' else 'Layer 2' end),
       product_url = coalesce(e.product_url, case
         when e.model = 'GWN7813P' then 'https://www.grandstream.com/products/networking-solutions/network-switches/product/gwn7811p_gwn7812p_gwn7813p'
         when e.model = 'GWN7832' then 'https://www.grandstream.com/products/networking-solutions/network-switches/product/gwn7830-gwn7831-gwn7832'
         else null end)
  FROM public.portal_floor_markers m
 WHERE m.id = e.rack_marker_id;

-- GWN7813P has SFP+ uplink capability alongside its 24 copper ports.
UPDATE public.portal_rack_equipment
   SET sfp_plus_ports = coalesce(sfp_plus_ports, 2)
 WHERE model = 'GWN7813P';

CREATE UNIQUE INDEX IF NOT EXISTS portal_rack_equipment_unique_model_role
  ON public.portal_rack_equipment (rack_marker_id, model, role);

CREATE TABLE IF NOT EXISTS public.portal_rack_equipment_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL,
  project_id uuid NOT NULL,
  rack_marker_id uuid,
  actor_user_id uuid,
  actor_type text NOT NULL DEFAULT 'admin',
  action text NOT NULL,
  detail text,
  prev_values jsonb,
  new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portal_rack_equipment_history TO authenticated;
GRANT ALL ON public.portal_rack_equipment_history TO service_role;

ALTER TABLE public.portal_rack_equipment_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal rack equipment history admin manage" ON public.portal_rack_equipment_history;
CREATE POLICY "portal rack equipment history admin manage"
  ON public.portal_rack_equipment_history FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

DROP POLICY IF EXISTS "portal rack equipment history client read" ON public.portal_rack_equipment_history;
CREATE POLICY "portal rack equipment history client read"
  ON public.portal_rack_equipment_history FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id));

CREATE INDEX IF NOT EXISTS portal_rack_equipment_history_equipment_idx
  ON public.portal_rack_equipment_history (equipment_id, created_at DESC);

-- Audit trigger: records creation and field-level updates.
CREATE OR REPLACE FUNCTION public.portal_rack_equipment_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.portal_rack_equipment_history (
      equipment_id, project_id, rack_marker_id, actor_user_id, action, detail, new_values
    ) VALUES (
      NEW.id, NEW.project_id, NEW.rack_marker_id, auth.uid(), 'equipment_created',
      format('%s %s added to rack (%sU, status %s)', NEW.manufacturer, NEW.model, NEW.rack_units, NEW.status),
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;

  IF to_jsonb(NEW) - 'updated_at' <> to_jsonb(OLD) - 'updated_at' THEN
    INSERT INTO public.portal_rack_equipment_history (
      equipment_id, project_id, rack_marker_id, actor_user_id, action, detail, prev_values, new_values
    ) VALUES (
      NEW.id, NEW.project_id, NEW.rack_marker_id, auth.uid(),
      CASE WHEN NEW.rack_marker_id IS DISTINCT FROM OLD.rack_marker_id THEN 'equipment_moved'
           WHEN NEW.status IS DISTINCT FROM OLD.status THEN 'status_changed'
           ELSE 'equipment_updated' END,
      format('%s %s updated (status %s, rack position %s)', NEW.manufacturer, NEW.model, NEW.status, coalesce(NEW.rack_position, NEW.sort_order)),
      to_jsonb(OLD), to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portal_rack_equipment_audit ON public.portal_rack_equipment;
CREATE TRIGGER trg_portal_rack_equipment_audit
  AFTER INSERT OR UPDATE ON public.portal_rack_equipment
  FOR EACH ROW EXECUTE FUNCTION public.portal_rack_equipment_audit();