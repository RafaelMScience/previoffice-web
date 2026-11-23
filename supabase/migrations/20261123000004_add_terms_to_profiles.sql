-- Migration: 20261123000004_add_terms_to_profiles.sql
-- Adds LGPD terms acceptance tracking to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0';

COMMENT ON COLUMN profiles.terms_accepted_at IS 'Data e hora do aceite formal do Termo de Responsabilidade e Consentimento LGPD';
COMMENT ON COLUMN profiles.terms_version IS 'Versão do Termo de Responsabilidade aceita pelo operador (ex: 1.0)';
