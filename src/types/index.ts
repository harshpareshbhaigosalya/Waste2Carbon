export type UserRole = 'producer' | 'processor' | 'admin';

export type EntityType = 
  | 'farm' 
  | 'food_industry' 
  | 'municipality' 
  | 'household' 
  | 'biochar_facility' 
  | 'biogas_facility' 
  | 'composting_plant'
  | 'other';

export type WasteCategory = 'dry_organic' | 'wet_organic' | 'industrial_organic';

export type WasteUnit = 'kg' | 'ton' | 'quintal';

export type MoistureLevel = 'low' | 'medium' | 'high';

export type ListingStatus = 'available' | 'requested' | 'matched' | 'collected' | 'cancelled';

export type RequestStatus = 'pending' | 'accepted' | 'in_transit' | 'collected' | 'rejected';

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
  verified: boolean;
  rating: number;
  carbon_credits_balance: number;
  created_at?: string;
}

export interface ProcessorInfo {
  id: string;
  name: string;
  facility_type: 'biochar' | 'biogas' | 'compost';
  accepted_categories: WasteCategory[];
  accepted_subtypes: string[];
  capacity_tons_per_month: number;
  current_utilization_tons: number;
  price_per_ton: number; // Offered buying price ($)
  operating_radius_km: number;
  active_sellers_count: number;
  is_verified: boolean;
  rating: number;
  contact_phone: string;
  address: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export interface WasteListing {
  id: string;
  producer_id: string;
  producer_name: string;
  producer_phone?: string;
  title: string;
  waste_category: WasteCategory;
  waste_subcategory: string;
  quantity: number;
  unit: WasteUnit;
  quantity_in_tons: number;
  moisture_level: MoistureLevel;
  expected_ready_date: string;
  location_address: string;
  latitude: number;
  longitude: number;
  estimated_co2_sequestered: number; // tons of CO2e
  estimated_credit_value: number; // $ value
  status: ListingStatus;
  assigned_processor_id?: string;
  assigned_processor_name?: string;
  verification_otp: string; // 6-digit code for handshake
  notes?: string;
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
  status: RequestStatus;
  waste_category: WasteCategory;
  waste_subcategory: string;
  quantity_tons: number;
  proposed_pickup_date: string;
  proposed_price_per_ton: number;
  verification_code: string;
  actual_weight_tons?: number;
  co2_sequestered_final?: number;
  credits_producer?: number;
  credits_processor?: number;
  handshake_timestamp?: string;
  notes?: string;
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
  action_type: 'earned' | 'certified' | 'transferred';
  certificate_code: string;
  issuer: string;
  created_at: string;
}

export interface CarbonCalculationResult {
  tons: number;
  landfillAvoidanceCO2: number; // Avoided methane
  sequestrationCO2: number;     // Direct stable carbon fixation
  totalCO2e: number;            // Total net carbon sequestered
  carbonCredits: number;        // 1 Credit = 1 ton CO2e
  estimatedMarketValueUSD: number; // Value in USD ($40/credit base)
  recommendedPathway: 'Biochar Pyrolysis' | 'Anaerobic Biogas Digestion' | 'Industrial Valorization';
  explanation: string;
}
