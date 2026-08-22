-- ============================================================
-- WORKSTREAM B1 (a): account state, policy repair, product
-- lifecycle protection, plan revision uniqueness
-- ============================================================

-- 1. Safe defaults for client portal users (old defaults violated the CHECKs)
ALTER TABLE public.portal_client_users
  ALTER COLUMN portal_role SET DEFAULT 'client_viewer',
  ALTER COLUMN status SET DEFAULT 'invited';

-- 2. Remove the legacy RESTRICTIVE policy: it AND-blocked super_admin/admin
DROP POLICY IF EXISTS "Admins full access director_projects" ON public.director_projects;

-- 3. Product lifecycle: referenced catalogue products may never be silently
--    unlinked by a hard delete. Archive is the only safe removal.
ALTER TABLE public.portal_floor_markers
  DROP CONSTRAINT IF EXISTS portal_floor_markers_product_id_fkey;
ALTER TABLE public.portal_floor_markers
  ADD CONSTRAINT portal_floor_markers_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.portal_product_catalog(id) ON DELETE RESTRICT;

ALTER TABLE public.portal_boq_items
  DROP CONSTRAINT IF EXISTS portal_boq_items_product_id_fkey;
ALTER TABLE public.portal_boq_items
  ADD CONSTRAINT portal_boq_items_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.portal_product_catalog(id) ON DELETE RESTRICT;

CREATE OR REPLACE FUNCTION public.portal_product_lifecycle(_action text, _product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  p public.portal_product_catalog;
  v_markers integer;
  v_lines integer;
  v_action text := lower(coalesce(_action, ''));
BEGIN
  IF NOT private.portal_is_admin() THEN
    RAISE EXCEPTION 'Only Siyakha administrators may change catalogue product state';
  END IF;
  IF v_action NOT IN ('archive', 'restore', 'delete') THEN
    RAISE EXCEPTION 'Unsupported catalogue action %', _action;
  END IF;

  SELECT * INTO p FROM public.portal_product_catalog WHERE id = _product_id FOR UPDATE;
  IF p.id IS NULL THEN RAISE EXCEPTION 'Catalogue product not found'; END IF;

  SELECT count(*) INTO v_markers FROM public.portal_floor_markers WHERE product_id = _product_id;
  SELECT count(*) INTO v_lines FROM public.portal_boq_items WHERE product_id = _product_id;

  IF v_action = 'archive' THEN
    UPDATE public.portal_product_catalog
       SET archived_at = coalesce(archived_at, now()), is_active = false
     WHERE id = _product_id;
  ELSIF v_action = 'restore' THEN
    UPDATE public.portal_product_catalog
       SET archived_at = NULL, is_active = true
     WHERE id = _product_id;
  ELSE
    IF v_markers > 0 OR v_lines > 0 THEN
      RAISE EXCEPTION 'This product is used by % device(s) and % bill line(s) — archive it instead of deleting it', v_markers, v_lines;
    END IF;
    DELETE FROM public.portal_product_catalog WHERE id = _product_id;
  END IF;

  INSERT INTO public.portal_admin_audit (actor_user_id, action, outcome, notes)
  VALUES (auth.uid(), 'catalogue_' || v_action, 'ok',
          format('%s (%s) — %s linked device(s), %s bill line(s)', p.name, coalesce(p.sku, 'no SKU'), v_markers, v_lines));

  RETURN jsonb_build_object('action', v_action, 'product_id', _product_id,
                            'linked_markers', v_markers, 'linked_boq_items', v_lines);
END;
$$;

REVOKE ALL ON FUNCTION public.portal_product_lifecycle(text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_product_lifecycle(text, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_product_lifecycle(text, uuid) TO authenticated;

-- 4. Controlled client-account state transitions with audit, no email
CREATE OR REPLACE FUNCTION public.portal_set_client_user_state(_client_user_id uuid, _status text, _portal_role text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  cu public.portal_client_users;
  v_status text := lower(btrim(coalesce(_status, '')));
  v_role text := nullif(btrim(coalesce(_portal_role, '')), '');
BEGIN
  IF NOT private.portal_is_admin() THEN
    RAISE EXCEPTION 'Only Siyakha administrators may change client account state';
  END IF;
  IF v_status NOT IN ('active', 'invited', 'suspended', 'revoked') THEN
    RAISE EXCEPTION 'Status must be active, invited, suspended or revoked';
  END IF;
  IF v_role IS NOT NULL AND v_role NOT IN ('client_admin', 'client_editor', 'client_viewer') THEN
    RAISE EXCEPTION 'Portal role must be client_admin, client_editor or client_viewer';
  END IF;

  SELECT * INTO cu FROM public.portal_client_users WHERE id = _client_user_id FOR UPDATE;
  IF cu.id IS NULL THEN RAISE EXCEPTION 'Client user not found'; END IF;

  IF v_status = 'active' AND cu.user_id IS NULL THEN
    RAISE EXCEPTION 'This client user has no sign-in account yet, so it cannot be activated';
  END IF;

  UPDATE public.portal_client_users
     SET status = v_status,
         portal_role = coalesce(v_role, portal_role),
         activated_at = CASE WHEN v_status = 'active' THEN coalesce(activated_at, now()) ELSE activated_at END
   WHERE id = _client_user_id;

  INSERT INTO public.portal_admin_audit (actor_user_id, target_client_user_id, target_email, action, outcome, notes)
  VALUES (auth.uid(), _client_user_id, cu.email, 'client_user_state_changed', 'ok',
          format('%s -> %s (role %s)', cu.status, v_status, coalesce(v_role, cu.portal_role)));

  RETURN jsonb_build_object('client_user_id', _client_user_id, 'status', v_status,
                            'portal_role', coalesce(v_role, cu.portal_role));
END;
$$;

REVOKE ALL ON FUNCTION public.portal_set_client_user_state(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_set_client_user_state(uuid, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_set_client_user_state(uuid, text, text) TO authenticated;

-- 5. Exactly one current plan revision per floor
CREATE UNIQUE INDEX IF NOT EXISTS portal_plan_revisions_one_current_per_floor
  ON public.portal_plan_revisions (floor_id)
  WHERE is_current AND archived_at IS NULL;

-- 6. When a design bill leaves draft, the project may no longer treat it as the
--    live design bill. Clear the nomination atomically and record it.
CREATE OR REPLACE FUNCTION private.portal_release_design_boq()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE v_projects integer := 0;
BEGIN
  IF NEW.status <> 'draft' AND OLD.status = 'draft' THEN
    UPDATE public.portal_projects SET design_boq_id = NULL WHERE design_boq_id = NEW.id;
    GET DIAGNOSTICS v_projects = ROW_COUNT;
    IF v_projects > 0 THEN
      INSERT INTO public.portal_admin_audit (actor_user_id, action, outcome, notes)
      VALUES (auth.uid(), 'design_boq_released', 'ok',
              format('Bill %s moved to %s — the project design bill nomination was cleared. Create or select a new draft to keep reconciling the plan.', NEW.id, NEW.status));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_portal_boqs_release_design ON public.portal_boqs;
CREATE TRIGGER trg_portal_boqs_release_design
  AFTER UPDATE OF status ON public.portal_boqs
  FOR EACH ROW EXECUTE FUNCTION private.portal_release_design_boq();