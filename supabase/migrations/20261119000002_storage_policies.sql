-- Storage RLS Policies for client-photos and client-documents
-- Following Supabase best practices (INSERT + SELECT + UPDATE required for upsert)

-- 1. Client Photos (Public Read, Authenticated Write)
CREATE POLICY "Public Read Client Photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'client-photos');

CREATE POLICY "Authenticated Upload Client Photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-photos');

CREATE POLICY "Authenticated Update Client Photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-photos')
WITH CHECK (bucket_id = 'client-photos');

CREATE POLICY "Authenticated Delete Client Photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-photos');

-- 2. Client Documents (Authenticated Only)
CREATE POLICY "Authenticated Select Client Documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'client-documents');

CREATE POLICY "Authenticated Insert Client Documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Authenticated Update Client Documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'client-documents')
WITH CHECK (bucket_id = 'client-documents');

CREATE POLICY "Authenticated Delete Client Documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'client-documents');
