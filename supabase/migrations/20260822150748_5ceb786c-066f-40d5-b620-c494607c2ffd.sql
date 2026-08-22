CREATE OR REPLACE FUNCTION public.portal_share_accept(
  _share_link_id uuid,
  _snapshot_hash text,
  _user_id uuid DEFAULT NULL,
  _note text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private'
AS $$
DECLARE l public.portal_share_links; a public.portal_share_acceptances; v_id uuid;
BEGIN
  SELECT * INTO l FROM public.portal_share_links WHERE id = _share_link_id FOR UPDATE;
  IF l.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'reason', 'unavailable'); END IF;
  IF l.revoked_at IS NOT NULL OR l.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unavailable');
  END IF;
  IF NOT l.approval_allowed THEN RETURN jsonb_build_object('ok', false, 'reason', 'denied'); END IF;
  IF l.resource_type NOT IN ('proposal', 'boq', 'project_pack', 'costing') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'unsupported_resource');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.portal_projects p
     WHERE p.id = l.project_id AND (l.client_id IS NULL OR p.client_id = l.client_id)
  ) THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'relationship_mismatch');
  END IF;

  -- The resource must belong to the same project and be in an issuable state.
  IF l.resource_id IS NOT NULL THEN
    IF l.resource_type IN ('proposal', 'costing') THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.portal_proposals x
         WHERE x.id = l.resource_id AND x.project_id = l.project_id
           AND x.status IN ('issued', 'accepted')
      ) THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'resource_not_issued');
      END IF;
    ELSIF l.resource_type = 'boq' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.portal_boqs x
         WHERE x.id = l.resource_id AND x.project_id = l.project_id
           AND x.status IN ('published', 'approved')
      ) THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'resource_not_issued');
      END IF;
    ELSIF l.resource_type = 'project_pack' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.portal_project_packs x
         WHERE x.id = l.resource_id AND x.project_id = l.project_id
      ) THEN
        RETURN jsonb_build_object('ok', false, 'reason', 'resource_not_issued');
      END IF;
    END IF;
  END IF;

  SELECT * INTO a FROM public.portal_share_acceptances WHERE share_link_id = l.id;
  IF a.id IS NOT NULL THEN
    IF a.snapshot_hash = _snapshot_hash AND a.resource_type = l.resource_type
       AND coalesce(a.resource_id::text, '') = coalesce(l.resource_id::text, '') THEN
      RETURN jsonb_build_object('ok', true, 'acceptance_id', a.id, 'repeat', true);
    END IF;
    RETURN jsonb_build_object('ok', false, 'reason', 'replay_mismatch');
  END IF;

  INSERT INTO public.portal_share_acceptances (
    share_link_id, project_id, client_id, resource_type, resource_id, revision_label,
    snapshot_hash, accepted_by_user_id, note
  ) VALUES (
    l.id, l.project_id, l.client_id, l.resource_type, l.resource_id, l.revision_label,
    _snapshot_hash, _user_id, left(coalesce(_note, ''), 2000)
  ) RETURNING id INTO v_id;

  IF l.resource_type = 'proposal' AND l.resource_id IS NOT NULL THEN
    UPDATE public.portal_proposals
       SET status = 'accepted', accepted_at = now()
     WHERE id = l.resource_id AND project_id = l.project_id AND status = 'issued';
  END IF;

  INSERT INTO public.portal_activity (
    client_id, project_id, entity_type, entity_id, action, detail, actor_type, actor_user_id
  ) VALUES (
    l.client_id, l.project_id, 'share_link', l.id, 'client_approved',
    format('%s accepted via secure share link', l.title), 'client', _user_id
  );

  RETURN jsonb_build_object('ok', true, 'acceptance_id', v_id, 'repeat', false);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.portal_share_accept(uuid, text, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_share_accept(uuid, text, uuid, text) TO service_role;