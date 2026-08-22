REVOKE ALL ON FUNCTION public.portal_next_proposal_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.portal_next_proposal_number() TO authenticated, service_role;