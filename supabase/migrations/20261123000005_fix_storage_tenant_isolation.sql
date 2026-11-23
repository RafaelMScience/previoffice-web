-- Migration: 20261123000005_fix_storage_tenant_isolation.sql
-- Enforces strict multi-tenant isolation on Supabase Storage buckets

-- 1. Drop overly permissive storage policies on client-documents
DROP POLICY IF EXISTS "Authenticated Select Client Documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Insert Client Documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Client Documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Client Documents" ON storage.objects;

-- 2. Create tenant-isolated policies for client-documents
-- The first folder segment in the object path MUST match the authenticated user's tenant ID
CREATE POLICY "Tenant Isolated Select Client Documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
);

CREATE POLICY "Tenant Isolated Insert Client Documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
);

CREATE POLICY "Tenant Isolated Update Client Documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
)
WITH CHECK (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
);

CREATE POLICY "Tenant Isolated Delete Client Documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-documents'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
);

-- 3. Drop overly permissive policies on client-photos
DROP POLICY IF EXISTS "Authenticated Upload Client Photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Client Photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Client Photos" ON storage.objects;

-- 4. Create tenant-isolated upload/update/delete policies for client-photos
CREATE POLICY "Tenant Isolated Upload Client Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'client-photos'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
);

CREATE POLICY "Tenant Isolated Update Client Photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
)
WITH CHECK (
  bucket_id = 'client-photos'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
);

CREATE POLICY "Tenant Isolated Delete Client Photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'client-photos'
  AND (storage.foldername(name))[1] = (SELECT private.current_tenant_id())::text
);
