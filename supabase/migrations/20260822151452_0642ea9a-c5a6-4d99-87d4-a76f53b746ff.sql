ALTER TABLE public.portal_share_access_log
  ADD COLUMN IF NOT EXISTS rate_key text;

CREATE INDEX IF NOT EXISTS portal_share_access_log_rate_key_idx
  ON public.portal_share_access_log (rate_key, accessed_at DESC);

CREATE INDEX IF NOT EXISTS portal_share_access_log_ip_idx
  ON public.portal_share_access_log (ip_hash, accessed_at DESC);