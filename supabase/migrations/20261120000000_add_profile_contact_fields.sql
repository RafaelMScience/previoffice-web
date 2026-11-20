-- Migration: Add phone, oab_number, and avatar_url to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS oab_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Revoke broad update and restrict authenticated users to only safe profile columns
-- (prevents tampering with role, tenant_id, is_active, id)
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (full_name, phone, oab_number, avatar_url, updated_at) ON public.profiles TO authenticated;

-- Ensure authenticated users can only update their own profile within their active tenant
DROP POLICY IF EXISTS "User Update Own Profile" ON public.profiles;
CREATE POLICY "User Update Own Profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (
  id = (SELECT auth.uid())
  AND tenant_id = (SELECT private.current_tenant_id())
);
