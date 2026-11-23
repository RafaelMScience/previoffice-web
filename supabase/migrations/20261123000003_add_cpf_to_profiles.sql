-- Migration: Add cpf column to public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Grant column update permissions for authenticated users
GRANT UPDATE (cpf) ON public.profiles TO authenticated;
