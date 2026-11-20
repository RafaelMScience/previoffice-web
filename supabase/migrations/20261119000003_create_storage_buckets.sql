-- Ensure storage buckets exist in local & remote instances
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('client-photos', 'client-photos', true),
  ('client-documents', 'client-documents', false)
ON CONFLICT (id) DO NOTHING;
