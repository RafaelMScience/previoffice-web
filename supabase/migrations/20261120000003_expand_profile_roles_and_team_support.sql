-- Migration: Expand profiles role check to support ASSISTANT and INTERN alongside LAWYER and RECEPTIONIST
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
CHECK (role IN ('MANAGING_LAWYER', 'ASSOCIATE_LAWYER', 'RECEPTIONIST', 'ASSISTANT', 'INTERN'));
