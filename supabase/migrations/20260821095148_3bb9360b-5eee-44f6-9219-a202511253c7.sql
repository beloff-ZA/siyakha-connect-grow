ALTER TABLE public.portal_floor_marker_history
  ADD COLUMN IF NOT EXISTS actor_role text,
  ADD COLUMN IF NOT EXISTS prev_x_norm numeric,
  ADD COLUMN IF NOT EXISTS prev_y_norm numeric,
  ADD COLUMN IF NOT EXISTS new_x_norm numeric,
  ADD COLUMN IF NOT EXISTS new_y_norm numeric;

CREATE OR REPLACE FUNCTION public.portal_move_floor_markers(_moves jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_is_admin boolean;
  v_actor_type text;
  v_count integer := 0;
  mv jsonb;
  m public.portal_floor_markers;
  nx numeric;
  ny numeric;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.portal_is_admin();
  v_actor_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END;

  FOR mv IN SELECT value FROM jsonb_array_elements(coalesce(_moves, '[]'::jsonb)) LOOP
    SELECT * INTO m FROM public.portal_floor_markers WHERE id = (mv ->> 'id')::uuid;
    IF m.id IS NULL THEN
      CONTINUE;
    END IF;

    IF NOT (v_is_admin OR (m.client_visible AND private.portal_can_read_floor(m.floor_id))) THEN
      RAISE EXCEPTION 'Not authorised to move this device';
    END IF;

    IF m.status <> 'planned'::public.portal_marker_state THEN
      RAISE EXCEPTION 'Device % is locked because its status is %', m.label, m.status;
    END IF;

    nx := least(1, greatest(0, round((mv ->> 'x')::numeric, 4)));
    ny := least(1, greatest(0, round((mv ->> 'y')::numeric, 4)));

    IF nx = m.x_norm AND ny = m.y_norm THEN
      CONTINUE;
    END IF;

    UPDATE public.portal_floor_markers
      SET x_norm = nx, y_norm = ny
      WHERE id = m.id;

    INSERT INTO public.portal_floor_marker_history (
      marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail,
      prev_x_norm, prev_y_norm, new_x_norm, new_y_norm
    ) VALUES (
      m.id, m.floor_id, auth.uid(), v_actor_type,
      CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
      'position_moved',
      format('%s moved from (%s, %s) to (%s, %s)', m.label, m.x_norm, m.y_norm, nx, ny),
      m.x_norm, m.y_norm, nx, ny
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.portal_move_floor_markers(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_move_floor_markers(jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_move_floor_markers(jsonb) TO service_role;

DROP POLICY IF EXISTS "clients read own floor marker history" ON public.portal_floor_marker_history;
CREATE POLICY "clients read own floor marker history"
  ON public.portal_floor_marker_history FOR SELECT TO authenticated
  USING (private.portal_can_read_floor(floor_id));