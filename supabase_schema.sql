-- ==========================================================
-- W2C (Waste-to-Carbon) Database Schema for Supabase
-- Theme: Circular Carbon Ecosystem
-- ==========================================================

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('producer', 'processor', 'admin')),
  entity_type TEXT NOT NULL, -- 'farm', 'food_industry', 'municipality', 'household', 'biochar_facility', 'biogas_facility', 'other'
  address TEXT,
  latitude DOUBLE PRECISION DEFAULT 28.6139,
  longitude DOUBLE PRECISION DEFAULT 77.2090,
  verified BOOLEAN DEFAULT false,
  rating NUMERIC(2,1) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Processors Info Table (Capacity, Accepted waste, Pricing)
CREATE TABLE IF NOT EXISTS public.processors_info (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  facility_type TEXT NOT NULL CHECK (facility_type IN ('biochar', 'biogas', 'compost', 'hybrid')),
  accepted_categories TEXT[] NOT NULL, -- e.g. ARRAY['dry_organic', 'wet_organic', 'industrial_organic']
  accepted_subtypes TEXT[], -- e.g. ARRAY['crop_residue', 'wood_waste', 'food_waste', 'manure']
  capacity_tons_per_month NUMERIC(10,2) DEFAULT 250.0,
  current_utilization_tons NUMERIC(10,2) DEFAULT 45.0,
  price_per_ton NUMERIC(10,2) DEFAULT 35.0, -- Offered buying price ($ or ₹)
  operating_radius_km NUMERIC(6,1) DEFAULT 80.0,
  active_sellers_count INT DEFAULT 12,
  is_verified BOOLEAN DEFAULT true,
  contact_phone TEXT,
  notes TEXT
);

-- 3. Waste Listings Table (Created by Producers)
CREATE TABLE IF NOT EXISTS public.waste_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  producer_name TEXT NOT NULL,
  title TEXT NOT NULL,
  waste_category TEXT NOT NULL CHECK (waste_category IN ('dry_organic', 'wet_organic', 'industrial_organic')),
  waste_subcategory TEXT NOT NULL, -- e.g. 'crop_residue', 'food_waste', 'manure', 'wood_chips', 'spent_grain'
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL CHECK (unit IN ('kg', 'ton', 'quintal')),
  quantity_in_tons NUMERIC(10,2) NOT NULL,
  moisture_level TEXT DEFAULT 'medium' CHECK (moisture_level IN ('low', 'medium', 'high')),
  expected_ready_date DATE NOT NULL,
  location_address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  estimated_co2_sequestered NUMERIC(10,2) NOT NULL,
  estimated_credit_value NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'requested', 'matched', 'collected', 'cancelled')),
  assigned_processor_id UUID REFERENCES public.profiles(id),
  verification_otp TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pickup Requests & Handshakes (Matches between Producer & Processor)
CREATE TABLE IF NOT EXISTS public.pickup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.waste_listings(id) ON DELETE CASCADE,
  producer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  processor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_transit', 'collected', 'rejected')),
  proposed_pickup_date DATE,
  proposed_price_per_ton NUMERIC(10,2),
  verification_code TEXT NOT NULL, -- 4-digit or 6-digit OTP
  actual_weight_tons NUMERIC(10,2),
  co2_sequestered_final NUMERIC(10,2),
  credits_producer NUMERIC(10,2),
  credits_processor NUMERIC(10,2),
  handshake_timestamp TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Carbon Credits Ledger Table (Tamper-evident log of credits)
CREATE TABLE IF NOT EXISTS public.carbon_credits_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.pickup_requests(id) ON DELETE SET NULL,
  amount_credits NUMERIC(10,2) NOT NULL,
  waste_type TEXT NOT NULL,
  tons_diverted NUMERIC(10,2) NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('earned', 'certified', 'transferred')),
  certificate_code TEXT UNIQUE NOT NULL,
  issuer TEXT DEFAULT 'W2C Standards Board (IPCC MRV)',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processors_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_credits_ledger ENABLE ROW LEVEL SECURITY;

-- Open policies for public read/write in authenticated environment or app mediator
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public read processors" ON public.processors_info FOR SELECT USING (true);
CREATE POLICY "Processors can update own info" ON public.processors_info FOR ALL USING (auth.uid() = id);

CREATE POLICY "Public read listings" ON public.waste_listings FOR SELECT USING (true);
CREATE POLICY "Producers manage own listings" ON public.waste_listings FOR ALL USING (auth.uid() = producer_id);

CREATE POLICY "Users see related pickup requests" ON public.pickup_requests FOR SELECT USING (true);
CREATE POLICY "Parties update pickup requests" ON public.pickup_requests FOR ALL USING (auth.uid() = producer_id OR auth.uid() = processor_id);

CREATE POLICY "Public read carbon ledger" ON public.carbon_credits_ledger FOR SELECT USING (true);
CREATE POLICY "System insert ledger" ON public.carbon_credits_ledger FOR INSERT WITH CHECK (true);
