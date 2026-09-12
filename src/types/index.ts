export type UserRole = 'producer' | 'processor' | 'admin';

export type EntityType = 
  | 'farm' 
  | 'food_industry' 
  | 'municipality' 
  | 'household' 
  | 'biochar_facility' 
  | 'biogas_facility'
  | 'admin';

export type WasteCategory = 'dry_organic' | 'wet_organic';

export type WasteUnit = 'ton' | 'kg' | 'quintal';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  entity_type: string;
  street_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  formatted_address?: string;
  latitude?: number;
  longitude?: number;
  onboarded: boolean;
  verified?: boolean;
  facility_type?: string;
  price_per_ton?: number;
  carbon_credits_balance: number;
  
  // Verification Document Details for Processors
  document_name?: string;
  document_type?: string;
  document_number?: string;
  document_url?: string;

  created_at?: string;
  updated_at?: string;
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
  street_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
  estimated_co2_sequestered: number;
  estimated_value_usd: number; // stores INR value
  status: 'available' | 'requested' | 'accepted' | 'collected';
  assigned_processor_id?: string;
  assigned_processor_name?: string;
  verification_otp: string;
  created_at: string;
}

export type NegotiationStatus = 'none' | 'proposed' | 'countered_by_producer' | 'countered_by_processor' | 'agreed' | 'rejected';

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
  
  // Price Negotiation
  negotiation_status?: NegotiationStatus;
  original_price_per_ton?: number;
  counter_price_per_ton?: number;
  last_negotiated_by?: 'producer' | 'processor';
  negotiation_notes?: string;

  verification_code: string;
  status: 'pending' | 'accepted' | 'collected';
  credits_awarded?: number;
  created_at: string;
}

export interface CarbonLedgerEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  request_id: string;
  amount_credits: number;
  waste_type: string;
  tons_diverted: number;
  certificate_code: string;
  created_at: string;
}

export interface AddressData {
  street_address: string;
  city: string;
  state: string;
  pincode: string;
  formatted_address: string;
  latitude: number;
  longitude: number;
}
