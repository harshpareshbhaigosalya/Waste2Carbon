import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  WasteListing,
  ProcessorInfo,
  PickupRequest,
  CarbonLedgerEntry,
  UserRole,
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_PROCESSORS,
  INITIAL_LISTINGS,
  INITIAL_REQUESTS,
  INITIAL_LEDGER,
} from '../data/mockData';
import { calculateCarbonMetrics } from '../lib/carbonCalculator';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  switchRole: (role: UserRole) => void;
  listings: WasteListing[];
  processors: ProcessorInfo[];
  pickupRequests: PickupRequest[];
  ledger: CarbonLedgerEntry[];
  addListing: (listing: Omit<WasteListing, 'id' | 'created_at' | 'verification_otp' | 'status' | 'producer_id' | 'producer_name'>) => Promise<WasteListing>;
  sendPickupRequest: (listingId: string, processorId: string, notes?: string) => Promise<void>;
  acceptPickupRequest: (requestId: string) => Promise<void>;
  rejectPickupRequest: (requestId: string) => Promise<void>;
  completeHandshake: (requestId: string, enteredOtp: string, verifiedWeightTons: number) => Promise<{ success: boolean; message: string; credits?: number }>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  selectedCertificate: CarbonLedgerEntry | null;
  setSelectedCertificate: (entry: CarbonLedgerEntry | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'w2c_current_user',
  LISTINGS: 'w2c_listings',
  PROCESSORS: 'w2c_processors',
  REQUESTS: 'w2c_requests',
  LEDGER: 'w2c_ledger',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PROFILES[0]; // Default to Producer (Farmer John)
  });

  const [listings, setListings] = useState<WasteListing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_LISTINGS;
  });

  const [processors, setProcessors] = useState<ProcessorInfo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROCESSORS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_PROCESSORS;
  });

  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_REQUESTS;
  });

  const [ledger, setLedger] = useState<CarbonLedgerEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LEDGER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_LEDGER;
  });

  const [selectedCertificate, setSelectedCertificate] = useState<CarbonLedgerEntry | null>(null);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROCESSORS, JSON.stringify(processors));
  }, [processors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(pickupRequests));
  }, [pickupRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  // Fast role switcher for testing & demo presentation
  const switchRole = (role: UserRole) => {
    const matched = INITIAL_PROFILES.find((p) => p.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else {
      if (currentUser) {
        setCurrentUser({ ...currentUser, role });
      }
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);

    // Try updating Supabase profile
    try {
      await supabase.from('profiles').upsert({
        id: updated.id,
        email: updated.email,
        full_name: updated.full_name,
        phone: updated.phone,
        role: updated.role,
        entity_type: updated.entity_type,
        address: updated.address,
        latitude: updated.latitude,
        longitude: updated.longitude,
        verified: updated.verified,
        rating: updated.rating,
      });
    } catch (e) {
      console.warn('Supabase sync skipped (offline or table pending):', e);
    }
  };

  // Add new waste listing
  const addListing = async (
    data: Omit<WasteListing, 'id' | 'created_at' | 'verification_otp' | 'status' | 'producer_id' | 'producer_name'>
  ): Promise<WasteListing> => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const newListing: WasteListing = {
      ...data,
      id: `list-${Date.now()}`,
      producer_id: currentUser?.id || 'demo-producer-1',
      producer_name: currentUser?.full_name || 'GreenField Farms',
      producer_phone: currentUser?.phone || '+1 (555) 234-8765',
      verification_otp: otp,
      status: 'available',
      created_at: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);

    try {
      await supabase.from('waste_listings').insert([
        {
          id: newListing.id,
          producer_id: newListing.producer_id,
          producer_name: newListing.producer_name,
          title: newListing.title,
          waste_category: newListing.waste_category,
          waste_subcategory: newListing.waste_subcategory,
          quantity: newListing.quantity,
          unit: newListing.unit,
          quantity_in_tons: newListing.quantity_in_tons,
          moisture_level: newListing.moisture_level,
          expected_ready_date: newListing.expected_ready_date,
          location_address: newListing.location_address,
          latitude: newListing.latitude,
          longitude: newListing.longitude,
          estimated_co2_sequestered: newListing.estimated_co2_sequestered,
          estimated_credit_value: newListing.estimated_credit_value,
          status: newListing.status,
          verification_otp: newListing.verification_otp,
          notes: newListing.notes,
        },
      ]);
    } catch (e) {
      console.warn('Supabase insert skipped:', e);
    }

    return newListing;
  };

  // Producer initiates request to specific processor
  const sendPickupRequest = async (listingId: string, processorId: string, notes?: string) => {
    const listing = listings.find((l) => l.id === listingId);
    const proc = processors.find((p) => p.id === processorId);
    if (!listing || !proc) return;

    const newRequest: PickupRequest = {
      id: `req-${Date.now()}`,
      listing_id: listing.id,
      listing_title: listing.title,
      producer_id: listing.producer_id,
      producer_name: listing.producer_name,
      producer_phone: listing.producer_phone || currentUser?.phone || '+1 (555) 000-0000',
      producer_address: listing.location_address,
      processor_id: proc.id,
      processor_name: proc.name,
      status: 'pending',
      waste_category: listing.waste_category,
      waste_subcategory: listing.waste_subcategory,
      quantity_tons: listing.quantity_in_tons,
      proposed_pickup_date: listing.expected_ready_date,
      proposed_price_per_ton: proc.price_per_ton,
      verification_code: listing.verification_otp,
      notes: notes || 'Direct request dispatched via W2C matching engine',
      created_at: new Date().toISOString(),
    };

    setPickupRequests((prev) => [newRequest, ...prev]);

    // Update listing status to requested
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId
          ? {
              ...l,
              status: 'requested',
              assigned_processor_id: proc.id,
              assigned_processor_name: proc.name,
            }
          : l
      )
    );
  };

  const acceptPickupRequest = async (requestId: string) => {
    setPickupRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r))
    );

    const req = pickupRequests.find((r) => r.id === requestId);
    if (req) {
      setListings((prev) =>
        prev.map((l) => (l.id === req.listing_id ? { ...l, status: 'matched' } : l))
      );
    }
  };

  const rejectPickupRequest = async (requestId: string) => {
    setPickupRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' } : r))
    );

    const req = pickupRequests.find((r) => r.id === requestId);
    if (req) {
      setListings((prev) =>
        prev.map((l) =>
          l.id === req.listing_id
            ? { ...l, status: 'available', assigned_processor_id: undefined, assigned_processor_name: undefined }
            : l
        )
      );
    }
  };

  // Handshake verification upon physical arrival at producer site
  const completeHandshake = async (
    requestId: string,
    enteredOtp: string,
    verifiedWeightTons: number
  ): Promise<{ success: boolean; message: string; credits?: number }> => {
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) {
      return { success: false, message: 'Pickup request not found.' };
    }

    // OTP validation
    if (req.verification_code.trim() !== enteredOtp.trim()) {
      return {
        success: false,
        message: `Invalid Verification Code. Please verify the 6-digit code shown on ${req.producer_name}'s dashboard.`,
      };
    }

    // Calculate final verified carbon credits based on actual weight
    const metrics = calculateCarbonMetrics(req.waste_category, verifiedWeightTons, 'ton');
    const awardedCredits = metrics.carbonCredits;

    const timestamp = new Date().toISOString();
    const certCodeProducer = `W2C-PROD-${Date.now().toString().slice(-6)}`;
    const certCodeProcessor = `W2C-PROC-${Date.now().toString().slice(-6)}`;

    // Update request state to collected
    setPickupRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'collected',
              actual_weight_tons: verifiedWeightTons,
              co2_sequestered_final: metrics.totalCO2e,
              credits_producer: awardedCredits,
              credits_processor: awardedCredits,
              handshake_timestamp: timestamp,
            }
          : r
      )
    );

    // Update listing state to collected
    setListings((prev) =>
      prev.map((l) => (l.id === req.listing_id ? { ...l, status: 'collected' } : l))
    );

    // Create ledger entries for both producer and processor
    const producerEntry: CarbonLedgerEntry = {
      id: `ledg-${Date.now()}-1`,
      user_id: req.producer_id,
      user_name: req.producer_name,
      user_role: 'producer',
      request_id: req.id,
      amount_credits: awardedCredits,
      waste_type: `${req.waste_subcategory.replace('_', ' ')} (${verifiedWeightTons} Tons)`,
      tons_diverted: verifiedWeightTons,
      action_type: 'certified',
      certificate_code: certCodeProducer,
      issuer: 'W2C Verified Sequestration Registry (IPCC MRV)',
      created_at: timestamp,
    };

    const processorEntry: CarbonLedgerEntry = {
      id: `ledg-${Date.now()}-2`,
      user_id: req.processor_id,
      user_name: req.processor_name,
      user_role: 'processor',
      request_id: req.id,
      amount_credits: awardedCredits,
      waste_type: `${req.waste_subcategory.replace('_', ' ')} (${verifiedWeightTons} Tons)`,
      tons_diverted: verifiedWeightTons,
      action_type: 'certified',
      certificate_code: certCodeProcessor,
      issuer: 'W2C Verified Sequestration Registry (IPCC MRV)',
      created_at: timestamp,
    };

    setLedger((prev) => [producerEntry, processorEntry, ...prev]);

    // Update current user balance if they are one of the parties
    if (currentUser?.id === req.producer_id || currentUser?.role === 'producer') {
      setCurrentUser((prev) =>
        prev ? { ...prev, carbon_credits_balance: Number((prev.carbon_credits_balance + awardedCredits).toFixed(2)) } : null
      );
    } else if (currentUser?.id === req.processor_id || currentUser?.role === 'processor') {
      setCurrentUser((prev) =>
        prev ? { ...prev, carbon_credits_balance: Number((prev.carbon_credits_balance + awardedCredits).toFixed(2)) } : null
      );
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#38bdf8', '#f59e0b'],
      });
    } catch (e) {
      // ignore in non-window
    }

    return {
      success: true,
      message: `Handshake successful! ${verifiedWeightTons} Tons collected and converted. Issued ${awardedCredits} Carbon Credits to both parties.`,
      credits: awardedCredits,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        listings,
        processors,
        pickupRequests,
        ledger,
        addListing,
        sendPickupRequest,
        acceptPickupRequest,
        rejectPickupRequest,
        completeHandshake,
        updateUserProfile,
        selectedCertificate,
        setSelectedCertificate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
