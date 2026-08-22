ALTER TABLE public.portal_share_links
  ADD COLUMN IF NOT EXISTS live_project_view boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.portal_share_link_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  IF NEW.token_hash IS DISTINCT FROM OLD.token_hash
     OR NEW.snapshot IS DISTINCT FROM OLD.snapshot
     OR NEW.resource_type IS DISTINCT FROM OLD.resource_type
     OR NEW.resource_id IS DISTINCT FROM OLD.resource_id
     OR NEW.revision_label IS DISTINCT FROM OLD.revision_label
     OR NEW.project_id IS DISTINCT FROM OLD.project_id
     OR NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.live_project_view IS DISTINCT FROM OLD.live_project_view
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'A share link''s token, snapshot, live-view mode and resource identity are immutable. Revoke it and issue a new link.';
  END IF;
  RETURN NEW;
END;
$$;