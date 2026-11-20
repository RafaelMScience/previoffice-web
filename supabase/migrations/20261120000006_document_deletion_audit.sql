-- Migration: Add audit fields for document and photo deletions
ALTER TABLE public.documents
ADD COLUMN IF NOT EXISTS deleted_by_name TEXT,
ADD COLUMN IF NOT EXISTS deleted_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.documents.deleted_by_name IS 'Full name of the user/operator who performed the document deletion';
COMMENT ON COLUMN public.documents.deleted_by_user_id IS 'UUID profile of the user/operator who performed the deletion';
