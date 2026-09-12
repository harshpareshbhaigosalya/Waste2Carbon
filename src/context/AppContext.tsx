import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  WasteListing,
  PickupRequest,
  CarbonLedgerEntry,
  UserRole,
} from '../types';
import { calculateCarbonMetrics } from '../lib/carbonCalculator';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  listings: WasteListing[];
  pickupRequests: PickupRequest[];
  ledger: CarbonLedgerEntry[];
  
  // Auth & Onboarding Flow
  registerAccount: (email: string, pass: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  loginAccount: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  completeOnboarding: (data: Partial<UserProfile>) => Promise<void>;
  switchUser: (userId: string) => void;
  signOut: () => void;

  // Waste & Selling Flow
  addListing: (data: {
    title: string;
    waste_category: 'dry_organic' | 'wet_organic';
    waste_subcategory: string;
    quantity: number;
    unit: 'ton' | 'kg' | 'quintal';
    expected_ready_date: string;
    location_address: string;
    processor_id?: string;
  }) => Promise<WasteListing>;
  
  acceptPickupRequest: (requestId: string) => Promise<void>;
  verifyPickupHandshake: (requestId: string, enteredOtp: string) => Promise<{ success: boolean; message: string; credits?: number }>;
  
  // Active certificate modal state
  selectedCertificate: CarbonLedgerEntry | null;
  setSelectedCertificate: (cert: CarbonLedgerEntry | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const KEYS = {
  CURRENT_USER: 'w2c_clean_user',
  ALL_USERS: 'w2c_clean_all_users',
  LISTINGS: 'w2c_clean_listings',
  REQUESTS: 'w2c_clean_requests',
  LEDGER: 'w2c_clean_ledger',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(KEYS.ALL_USERS);
    return saved ? JSON.parse(saved) : [];
  });

  const [listings, setListings] = useState<WasteListing[]>(() => {
    const saved = localStorage.getItem(KEYS.LISTINGS);
    return saved ? JSON.parse(saved) : [];
  });

  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>(() => {
    const saved = localStorage.getItem(KEYS.REQUESTS);
    return saved ? JSON.parse(saved) : [];
  });

  const [ledger, setLedger] = useState<CarbonLedgerEntry[]>(() => {
    const saved = localStorage.getItem(KEYS.LEDGER);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCertificate, setSelectedCertificate] = useState<CarbonLedgerEntry | null>(null);

  // Sync to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(KEYS.LISTINGS, JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem(KEYS.REQUESTS, JSON.stringify(pickupRequests));
  }, [pickupRequests]);

  useEffect(() => {
    localStorage.setItem(KEYS.LEDGER, JSON.stringify(ledger));
  }, [ledger]);

  // Register Account
  const registerAccount = async (email: string, pass: string): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      const newUserId = data?.user?.id || `usr-${Date.now()}`;

      // Create new fresh profile in pending onboarding state
      const newProfile: UserProfile = {
        id: newUserId,
        email,
        full_name: email.split('@')[0],
        phone: '',
        role: 'producer',
        entity_type: 'farm',
        address: '',
        latitude: 28.6139,
        longitude: 77.2090,
        onboarded: false, // Must onboard on first login!
        verified: false,
        carbon_credits_balance: 0,
      };

      setAllUsers((prev) => [...prev.filter((u) => u.email !== email), newProfile]);
      setCurrentUser(newProfile);

      if (error) {
        // Fallback for local demo if network or offline
        return {
          success: true,
          message: 'Account created locally. Please proceed to onboarding profile.',
          requiresVerification: false,
        };
      }

      return {
        success: true,
        message: 'Registration successful! Verification email sent. Please complete your onboarding profile.',
        requiresVerification: true,
      };
    } catch (err: any) {
      // Fallback: create local test profile
      const newProfile: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: email.split('@')[0],
        phone: '',
        role: 'producer',
        entity_type: 'farm',
        address: '',
        latitude: 28.6139,
        longitude: 77.2090,
        onboarded: false,
        verified: false,
        carbon_credits_balance: 0,
      };
      setAllUsers((prev) => [...prev.filter((u) => u.email !== email), newProfile]);
      setCurrentUser(newProfile);
      return { success: true, message: 'Account created! Complete your profile.' };
    }
  };

  // Sign In Account
  const loginAccount = async (email: string, pass: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      // Find profile in allUsers or create placeholder
      let matched = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!matched) {
        matched = {
          id: data?.user?.id || `usr-${Date.now()}`,
          email,
          full_name: email.split('@')[0],
          phone: '',
          role: 'producer',
          entity_type: 'farm',
          address: '',
          latitude: 28.6139,
          longitude: 77.2090,
          onboarded: false,
          verified: true,
          carbon_credits_balance: 0,
        };
        setAllUsers((prev) => [...prev, matched!]);
      }

      setCurrentUser(matched);
      return { success: true, message: 'Signed in successfully!' };
    } catch (err: any) {
      // Local fallback lookup
      const matched = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setCurrentUser(matched);
        return { success: true, message: 'Signed in successfully!' };
      }
      return { success: false, message: 'Invalid credentials or user not found.' };
    }
  };

  // First-Time Onboarding: Save profile permanently
  const completeOnboarding = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;

    const updated: UserProfile = {
      ...currentUser,
      ...data,
      onboarded: true, // Mark permanently onboarded!
      verified: true,
    };

    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));

    // Try saving in Supabase profiles
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
        verified: true,
      });
    } catch (e) {
      console.warn('Supabase profile save skipped:', e);
    }
  };

  // Switch between created user accounts (so user can test Producer & Processor on 1 machine)
  const switchUser = (userId: string) => {
    const user = allUsers.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
    }
  };

  const signOut = () => {
    setCurrentUser(null);
  };

  // Producer creates new waste listing
  const addListing = async (data: {
    title: string;
    waste_category: 'dry_organic' | 'wet_organic';
    waste_subcategory: string;
    quantity: number;
    unit: 'ton' | 'kg' | 'quintal';
    expected_ready_date: string;
    location_address: string;
    processor_id?: string;
  }): Promise<WasteListing> => {
    const metrics = calculateCarbonMetrics(data.waste_category, data.quantity, data.unit);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    let assignedProcessorName = '';
    let status: WasteListing['status'] = 'available';

    if (data.processor_id) {
      const proc = allUsers.find((u) => u.id === data.processor_id);
      if (proc) {
        assignedProcessorName = proc.full_name;
        status = 'requested';
      }
    }

    const newListing: WasteListing = {
      id: `lst-${Date.now()}`,
      producer_id: currentUser?.id || 'demo-prod',
      producer_name: currentUser?.full_name || 'My Farm',
      producer_phone: currentUser?.phone || 'N/A',
      title: data.title,
      waste_category: data.waste_category,
      waste_subcategory: data.waste_subcategory,
      quantity: data.quantity,
      unit: data.unit,
      quantity_in_tons: metrics.tons,
      expected_ready_date: data.expected_ready_date,
      location_address: data.location_address || currentUser?.address || 'Pickup Site',
      latitude: currentUser?.latitude || 28.6139,
      longitude: currentUser?.longitude || 77.2090,
      estimated_co2_sequestered: metrics.totalCO2e,
      estimated_value_usd: metrics.estimatedMarketValueUSD,
      status,
      assigned_processor_id: data.processor_id,
      assigned_processor_name: assignedProcessorName,
      verification_otp: otp,
      created_at: new Date().toISOString(),
    };

    setListings((prev) => [newListing, ...prev]);

    // If processor was selected, create pickup request automatically
    if (data.processor_id) {
      const proc = allUsers.find((u) => u.id === data.processor_id);
      const newReq: PickupRequest = {
        id: `req-${Date.now()}`,
        listing_id: newListing.id,
        listing_title: newListing.title,
        producer_id: newListing.producer_id,
        producer_name: newListing.producer_name,
        producer_phone: newListing.producer_phone,
        producer_address: newListing.location_address,
        processor_id: data.processor_id,
        processor_name: proc?.full_name || 'Processor',
        quantity_tons: metrics.tons,
        waste_category: data.waste_category,
        proposed_pickup_date: data.expected_ready_date,
        proposed_price_per_ton: proc?.price_per_ton || 45,
        verification_code: otp,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      setPickupRequests((prev) => [newReq, ...prev]);
    }

    return newListing;
  };

  // Processor accepts request
  const acceptPickupRequest = async (requestId: string) => {
    setPickupRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' } : r))
    );

    const req = pickupRequests.find((r) => r.id === requestId);
    if (req) {
      setListings((prev) =>
        prev.map((l) => (l.id === req.listing_id ? { ...l, status: 'accepted' } : l))
      );
    }
  };

  // Handshake completion via 6-digit OTP
  const verifyPickupHandshake = async (
    requestId: string,
    enteredOtp: string
  ): Promise<{ success: boolean; message: string; credits?: number }> => {
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Pickup request not found.' };

    if (req.verification_code.trim() !== enteredOtp.trim()) {
      return { success: false, message: 'Incorrect 6-digit code. Please verify the code on the producer’s screen.' };
    }

    // Calculate final verified credits
    const metrics = calculateCarbonMetrics(req.waste_category, req.quantity_tons, 'ton');
    const credits = metrics.carbonCredits;

    // Update request
    setPickupRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'collected', credits_awarded: credits } : r))
    );

    // Update listing
    setListings((prev) =>
      prev.map((l) => (l.id === req.listing_id ? { ...l, status: 'collected' } : l))
    );

    // Award carbon credits to both parties
    setAllUsers((prev) =>
      prev.map((u) => {
        if (u.id === req.producer_id || u.id === req.processor_id) {
          return {
            ...u,
            carbon_credits_balance: Number((u.carbon_credits_balance + credits).toFixed(2)),
          };
        }
        return u;
      })
    );

    if (currentUser?.id === req.producer_id || currentUser?.id === req.processor_id) {
      setCurrentUser((prev) =>
        prev
          ? { ...prev, carbon_credits_balance: Number((prev.carbon_credits_balance + credits).toFixed(2)) }
          : null
      );
    }

    // Log in Carbon Ledger
    const certCode = `W2C-CERT-${Date.now().toString().slice(-6)}`;
    const newEntry: CarbonLedgerEntry = {
      id: `ledg-${Date.now()}`,
      user_id: req.producer_id,
      user_name: req.producer_name,
      user_role: 'producer',
      request_id: req.id,
      amount_credits: credits,
      waste_type: `${req.listing_title} (${req.quantity_tons} t)`,
      tons_diverted: req.quantity_tons,
      certificate_code: certCode,
      created_at: new Date().toISOString(),
    };

    setLedger((prev) => [newEntry, ...prev]);

    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669', '#38bdf8'],
      });
    } catch (e) {
      // ignore
    }

    return {
      success: true,
      message: `Pickup confirmed! ${credits} Carbon Credits issued to both parties.`,
      credits,
    };
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        listings,
        pickupRequests,
        ledger,
        registerAccount,
        loginAccount,
        completeOnboarding,
        switchUser,
        signOut,
        addListing,
        acceptPickupRequest,
        verifyPickupHandshake,
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
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
