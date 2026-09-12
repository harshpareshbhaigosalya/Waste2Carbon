-- ==========================================================
-- W2C (Waste-to-Carbon) Database Schema Updates for Supabase
-- ==========================================================

-- 1. Allow 'admin' role in profiles
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('producer', 'processor', 'admin'));

-- 2. Add verification document columns and verified flag
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS document_url TEXT;

-- 3. Create or update admin account
INSERT INTO public.profiles (id, email, full_name, phone, role, entity_type, onboarded, verified, carbon_credits_balance)
VALUES ('admin-root', 'admin@gmail.com', 'System Administrator', '+91 99999 99999', 'admin', 'admin', true, true, 0.0)
ON CONFLICT (id) DO UPDATE SET role = 'admin', onboarded = true, verified = true;
