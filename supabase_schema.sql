-- ==========================================================
-- W2C (Waste-to-Carbon) Complete Database Schema Updates
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

-- 3. Add Price Negotiation columns to pickup_requests table
ALTER TABLE public.pickup_requests ADD COLUMN IF NOT EXISTS negotiation_status TEXT DEFAULT 'none';
ALTER TABLE public.pickup_requests ADD COLUMN IF NOT EXISTS original_price_per_ton NUMERIC;
ALTER TABLE public.pickup_requests ADD COLUMN IF NOT EXISTS counter_price_per_ton NUMERIC;
ALTER TABLE public.pickup_requests ADD COLUMN IF NOT EXISTS last_negotiated_by TEXT;
ALTER TABLE public.pickup_requests ADD COLUMN IF NOT EXISTS negotiation_notes TEXT;

-- 4. Create or update admin account
INSERT INTO public.profiles (id, email, full_name, phone, role, entity_type, onboarded, verified, carbon_credits_balance)
VALUES ('admin-root', 'admin@gmail.com', 'System Administrator', '+91 99999 99999', 'admin', 'admin', true, true, 0.0)
ON CONFLICT (id) DO UPDATE SET role = 'admin', onboarded = true, verified = true;
