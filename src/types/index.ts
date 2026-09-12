export type UserRole = 'producer' | 'processor';

export type EntityType = 
  | 'farm' 
  | 'food_industry' 
  | 'municipality' 
  | 'household' 
  | 'biochar_facility' 
  | 'biogas_facility';

export type WasteCategory = 'dry_organic' | 'wet_organic';

export type WasteUnit = 'ton' | 'kg' | 'quintal';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  entity_type: EntityType;
  address: string;
  latitude: number;
  longitude: number;
  onboarded: boolean;
  verified: boolean;
  carbon_credits_balance: number;
  // Processor-specific details if role is 'processor'
  facility_type?: 'biochar' | 'biogas';
  price_per_ton?: number; // Offered buying price
  accepted_categories?: WasteCategory[];
  capacity_tons_per_month?: number;
  rating?: number;
}

export interface WasteListing {
  id: string;
  producer_id: string;
  producer_name: string;
  producer_phone: string;
  title: string;
  waste_category: WasteCategory;
  waste_subcategory: string;
  quantity: number;
  unit: WasteUnit;
  quantity_in_tons: number;
  expected_ready_date: string;
  location_address: string;
  latitude: number;
  longitude: number;
  estimated_co2_sequestered: number;
  estimated_value_usd: number;
  status: 'available' | 'requested' | 'accepted' | 'collected';
  assigned_processor_id?: string;
  assigned_processor_name?: string;
  verification_otp: string; // 6-digit handshake code
  created_at: string;
}

export interface PickupRequest {
  id: string;
  listing_id: string;
  listing_title: string;
  producer_id: string;
  producer_name: string;
  producer_phone: string;
  producer_address: string;
  processor_id: string;
  processor_name: string;
  quantity_tons: number;
  waste_category: WasteCategory;
  proposed_pickup_date: string;
  proposed_price_per_ton: number;
  verification_code: string;
  status: 'pending' | 'accepted' | 'collected';
  credits_awarded?: number;
  created_at: string;
}

export interface CarbonLedgerEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  request_id: string;
  amount_credits: number;
  waste_type: string;
  tons_diverted: number;
  certificate_code: string;
  created_at: string;
}
