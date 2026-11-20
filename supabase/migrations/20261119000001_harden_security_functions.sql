-- Harden Security Definer Functions according to Supabase Advisors and Best Practices

-- 1. Create private schema (never exposed to PostgREST/Data API)
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Define tenant resolution function in private schema
CREATE OR REPLACE FUNCTION private.current_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    NULLIF((SELECT auth.jwt() -> 'app_metadata' ->> 'tenant_id'), '')::uuid,
    (SELECT p.tenant_id FROM public.profiles p WHERE p.id = (SELECT auth.uid()))
  );
$$;

-- Revoke execution from PUBLIC and anon; grant only to authenticated (for RLS evaluation)
REVOKE EXECUTE ON FUNCTION private.current_tenant_id() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_tenant_id() TO authenticated;

-- 3. Update all RLS policies to use private.current_tenant_id()
DROP POLICY IF EXISTS "Tenant Isolation for Tenants" ON public.tenants;
CREATE POLICY "Tenant Isolation for Tenants"
ON public.tenants FOR SELECT
TO authenticated
USING (id = (SELECT private.current_tenant_id()));

DROP POLICY IF EXISTS "Tenant View Profiles" ON public.profiles;
CREATE POLICY "Tenant View Profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (tenant_id = (SELECT private.current_tenant_id()));

DROP POLICY IF EXISTS "Tenant Isolation for Clients" ON public.clients;
CREATE POLICY "Tenant Isolation for Clients"
ON public.clients FOR ALL
TO authenticated
USING (tenant_id = (SELECT private.current_tenant_id()))
WITH CHECK (tenant_id = (SELECT private.current_tenant_id()));

DROP POLICY IF EXISTS "Tenant Isolation for Attendances" ON public.attendances;
CREATE POLICY "Tenant Isolation for Attendances"
ON public.attendances FOR ALL
TO authenticated
USING (tenant_id = (SELECT private.current_tenant_id()))
WITH CHECK (tenant_id = (SELECT private.current_tenant_id()));

DROP POLICY IF EXISTS "Tenant Isolation for Documents" ON public.documents;
CREATE POLICY "Tenant Isolation for Documents"
ON public.documents FOR ALL
TO authenticated
USING (tenant_id = (SELECT private.current_tenant_id()))
WITH CHECK (tenant_id = (SELECT private.current_tenant_id()));

-- 4. Drop legacy public.current_tenant_id() function
DROP FUNCTION IF EXISTS public.current_tenant_id();

-- 5. Revoke execution on trigger function from all public roles
REVOKE EXECUTE ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;
