-- Siyakha Connect: extend role and device-kind vocabularies (idempotent)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'project_manager';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'engineer';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client_admin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client_editor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client_viewer';

ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'switch';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'nvr';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'router_firewall';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'data_point';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'fibre_agg_switch';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'fibre_liu';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'fibre_splice';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'patch_panel';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'access_control';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'note_marker';