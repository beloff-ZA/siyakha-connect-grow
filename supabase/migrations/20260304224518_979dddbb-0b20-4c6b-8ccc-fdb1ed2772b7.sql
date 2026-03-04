
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins full access technicians" ON public.technicians;

-- Create a permissive policy so only siyakha_admin can access
CREATE POLICY "Admins full access technicians"
ON public.technicians
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'siyakha_admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'::app_role));
