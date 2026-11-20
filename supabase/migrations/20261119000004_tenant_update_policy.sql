-- Allow authenticated users belonging to the tenant to update their office settings
DROP POLICY IF EXISTS "Tenant Update Policy" ON public.tenants;
CREATE POLICY "Tenant Update Policy"
ON public.tenants FOR UPDATE
TO authenticated
USING (id = (SELECT private.current_tenant_id()))
WITH CHECK (id = (SELECT private.current_tenant_id()));
