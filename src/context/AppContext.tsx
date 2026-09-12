import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  WasteListing,
  PickupRequest,
  CarbonLedgerEntry,
  AddressData,
} from '../types';
import { calculateCarbonMetrics } from '../lib/carbonCalculator';
import { supabase } from '../lib/supabase';

interface AppContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  listings: WasteListing[];
  pickupRequests: PickupRequest[];
  ledger: CarbonLedgerEntry[];
  isLoading: boolean;
  
  // Auth & Onboarding
  registerAccount: (email: string, pass: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
  loginAccount: (email: string, pass: string) => Promise<{ success: boolean; message: string }>;
  completeOnboarding: (data: Partial<UserProfile> & { addressData?: AddressData }) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  switchUser: (userId: string) => void;
  refreshData: () => Promise<void>;

  // Waste Listings & Handshake
  addListing: (data: {
    title: string;
    waste_category: 'dry_organic' | 'wet_organic';
    waste_subcategory: string;
    quantity: number;
    unit: 'ton' | 'kg' | 'quintal';
    expected_ready_date: string;
    addressData: AddressData;
    processor_id?: string;
  }) => Promise<{ success: boolean; message: string }>;

  acceptPickupRequest: (requestId: string) => Promise<void>;
  verifyPickupHandshake: (requestId: string, enteredOtp: string) => Promise<{ success: boolean; message: string; credits?: number }>;

  // Certificate Modal State
  selectedCertificate: CarbonLedgerEntry | null;
  setSelectedCertificate: (cert: CarbonLedgerEntry | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
  const [ledger, setLedger] = useState<CarbonLedgerEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<CarbonLedgerEntry | null>(null);

  // 1. Fetch all data directly from Supabase tables
  const refreshData = async () => {
    try {
      // Fetch profiles
      const { data: profilesData } = await supabase.from('profiles').select('*');
      if (profilesData) {
        setAllUsers(profilesData);
        // If logged in user, refresh their profile state
        if (currentUser) {
          const fresh = profilesData.find((p) => p.id === currentUser.id);
          if (fresh) setCurrentUser(fresh);
        }
      }

      // Fetch waste listings
      const { data: listingsData } = await supabase
        .from('waste_listings')
        .select('*')
        .order('created_at', { ascending: false });
      if (listingsData) {
        setListings(listingsData);
      }

      // Fetch pickup requests
      const { data: requestsData } = await supabase
        .from('pickup_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (requestsData) {
        setPickupRequests(requestsData);
      }

      // Fetch carbon ledger
      const { data: ledgerData } = await supabase
        .from('carbon_ledger')
        .select('*')
        .order('created_at', { ascending: false });
      if (ledgerData) {
        setLedger(ledgerData);
      }
    } catch (e) {
      console.error('Error fetching data from Supabase:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load & check Supabase Auth session
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const authUser = sessionData?.session?.user;

        if (authUser) {
          // Fetch user profile from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profile) {
            setCurrentUser(profile);
          } else {
            // User registered in auth but profile record pending
            const placeholder: UserProfile = {
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              phone: '',
              role: 'producer',
              entity_type: 'farm',
              onboarded: false,
              carbon_credits_balance: 0,
            };
            setCurrentUser(placeholder);
          }
        }
      } catch (e) {
        console.warn('Session check error:', e);
      }
      await refreshData();
    };

    initAuth();
  }, []);

  // 2. Register Account with Supabase Auth & create database profile
  const registerAccount = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      const authUser = data?.user;
      if (!authUser) {
        return { success: false, message: 'Registration failed. Please try again.' };
      }

      const initialProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || email,
        full_name: email.split('@')[0],
        phone: '',
        role: 'producer',
        entity_type: 'farm',
        onboarded: false, // Must complete onboarding step!
        carbon_credits_balance: 0,
      };

      // Store in Supabase profiles table
      const { error: profileErr } = await supabase.from('profiles').upsert(initialProfile);
      if (profileErr) {
        console.error('Error inserting profile in Supabase:', profileErr);
      }

      setCurrentUser(initialProfile);
      await refreshData();

      // Check if email confirmation is required
      const session = data?.session;
      const requiresVerification = !session;

      return {
        success: true,
        message: requiresVerification
          ? `Account created! A confirmation email was sent to ${email}. Please check your inbox / spam folder. You can now complete your onboarding profile.`
          : 'Account created and verified! Please complete your onboarding profile.',
        requiresVerification,
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  // 3. Login Account with Supabase
  const loginAccount = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      const authUser = data.user;
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profile) {
        setCurrentUser(profile);
      } else {
        const placeholder: UserProfile = {
          id: authUser.id,
          email: authUser.email || email,
          full_name: email.split('@')[0],
          phone: '',
          role: 'producer',
          entity_type: 'farm',
          onboarded: false,
          carbon_credits_balance: 0,
        };
        await supabase.from('profiles').upsert(placeholder);
        setCurrentUser(placeholder);
      }

      await refreshData();
      return { success: true, message: 'Signed in successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  // 4. Complete Onboarding: Save profile permanently to Supabase
  const completeOnboarding = async (
    data: Partial<UserProfile> & { addressData?: AddressData }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'No active session' };

    const addr = data.addressData;
    const updatedProfile: UserProfile = {
      ...currentUser,
      ...data,
      street_address: addr?.street_address || currentUser.street_address,
      city: addr?.city || currentUser.city,
      state: addr?.state || currentUser.state,
      pincode: addr?.pincode || currentUser.pincode,
      formatted_address: addr?.formatted_address || currentUser.formatted_address,
      latitude: addr?.latitude ?? currentUser.latitude ?? 28.6139,
      longitude: addr?.longitude ?? currentUser.longitude ?? 77.2090,
      onboarded: true, // Marked permanently onboarded
    };
    delete (updatedProfile as any).addressData;

    // Save directly to Supabase
    const { error } = await supabase.from('profiles').upsert(updatedProfile);
    if (error) {
      console.error('Supabase profile update error:', error);
      return { success: false, message: `Failed to save profile: ${error.message}` };
    }

    setCurrentUser(updatedProfile);
    await refreshData();
    return { success: true, message: 'Profile saved permanently in Supabase database!' };
  };

  // Switch between profiles (useful for testing Producer & Processor in 1 browser)
  const switchUser = (userId: string) => {
    const matched = allUsers.find((u) => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
    }
  };

  // Sign out
  const signOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  // 5. Add Waste Listing & store in Supabase
  const addListing = async (data: {
    title: string;
    waste_category: 'dry_organic' | 'wet_organic';
    waste_subcategory: string;
    quantity: number;
    unit: 'ton' | 'kg' | 'quintal';
    expected_ready_date: string;
    addressData: AddressData;
    processor_id?: string;
  }): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Must be signed in to add listing' };

    const metrics = calculateCarbonMetrics(data.waste_category, data.quantity, data.unit);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const listingId = `lst-${Date.now()}`;

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
      id: listingId,
      producer_id: currentUser.id,
      producer_name: currentUser.full_name,
      producer_phone: currentUser.phone,
      title: data.title,
      waste_category: data.waste_category,
      waste_subcategory: data.waste_subcategory,
      quantity: data.quantity,
      unit: data.unit,
      quantity_in_tons: metrics.tons,
      expected_ready_date: data.expected_ready_date,
      street_address: data.addressData.street_address,
      city: data.addressData.city,
      state: data.addressData.state,
      pincode: data.addressData.pincode,
      formatted_address: data.addressData.formatted_address,
      latitude: data.addressData.latitude,
      longitude: data.addressData.longitude,
      estimated_co2_sequestered: metrics.totalCO2e,
      estimated_value_usd: metrics.estimatedMarketValueUSD,
      status,
      assigned_processor_id: data.processor_id || undefined,
      assigned_processor_name: assignedProcessorName || undefined,
      verification_otp: otp,
      created_at: new Date().toISOString(),
    };

    // 1. Insert listing into Supabase
    const { error: listErr } = await supabase.from('waste_listings').insert([newListing]);
    if (listErr) {
      console.error('Error inserting listing into Supabase:', listErr);
      return { success: false, message: `Database error: ${listErr.message}` };
    }

    // 2. If a processor was selected, insert request into Supabase
    if (data.processor_id) {
      const proc = allUsers.find((u) => u.id === data.processor_id);
      const newRequest: PickupRequest = {
        id: `req-${Date.now()}`,
        listing_id: newListing.id,
        listing_title: newListing.title,
        producer_id: currentUser.id,
        producer_name: currentUser.full_name,
        producer_phone: currentUser.phone,
        producer_address: data.addressData.formatted_address,
        processor_id: data.processor_id,
        processor_name: proc?.full_name || 'Processor',
        quantity_tons: metrics.tons,
        waste_category: data.waste_category,
        proposed_pickup_date: data.expected_ready_date,
        proposed_price_per_ton: proc?.price_per_ton || 45,
        verification_code: otp,
        status: 'pending',
        credits_awarded: 0,
        created_at: new Date().toISOString(),
      };

      const { error: reqErr } = await supabase.from('pickup_requests').insert([newRequest]);
      if (reqErr) {
        console.error('Error inserting pickup request:', reqErr);
      }
    }

    await refreshData();
    return { success: true, message: 'Waste listing saved directly to Supabase!' };
  };

  // 6. Processor accepts pickup request in Supabase
  const acceptPickupRequest = async (requestId: string) => {
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) return;

    // Update request status to 'accepted'
    await supabase.from('pickup_requests').update({ status: 'accepted' }).eq('id', requestId);

    // Update listing status to 'accepted'
    await supabase.from('waste_listings').update({ status: 'accepted' }).eq('id', req.listing_id);

    await refreshData();
  };

  // 7. Handshake verification via 6-digit OTP
  const verifyPickupHandshake = async (
    requestId: string,
    enteredOtp: string
  ): Promise<{ success: boolean; message: string; credits?: number }> => {
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found in database.' };

    if (req.verification_code.trim() !== enteredOtp.trim()) {
      return { success: false, message: 'Incorrect 6-digit code. Please verify the code on the producer’s screen.' };
    }

    // Calculate verified credits
    const metrics = calculateCarbonMetrics(req.waste_category, req.quantity_tons, 'ton');
    const credits = metrics.carbonCredits;

    // 1. Update request status to 'collected' in Supabase
    await supabase
      .from('pickup_requests')
      .update({ status: 'collected', credits_awarded: credits })
      .eq('id', requestId);

    // 2. Update listing status to 'collected' in Supabase
    await supabase
      .from('waste_listings')
      .update({ status: 'collected' })
      .eq('id', req.listing_id);

    // 3. Insert into carbon_ledger table in Supabase
    const certCode = `W2C-CERT-${Date.now().toString().slice(-6)}`;
    const ledgerEntry: CarbonLedgerEntry = {
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
    await supabase.from('carbon_ledger').insert([ledgerEntry]);

    // 4. Increment carbon credit balances in profiles table
    const producer = allUsers.find((u) => u.id === req.producer_id);
    const processor = allUsers.find((u) => u.id === req.processor_id);

    if (producer) {
      await supabase
        .from('profiles')
        .update({ carbon_credits_balance: Number(((producer.carbon_credits_balance || 0) + credits).toFixed(2)) })
        .eq('id', req.producer_id);
    }
    if (processor) {
      await supabase
        .from('profiles')
        .update({ carbon_credits_balance: Number(((processor.carbon_credits_balance || 0) + credits).toFixed(2)) })
        .eq('id', req.processor_id);
    }

    // Confetti celebration!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#38bdf8', '#f59e0b'],
      });
    } catch (e) {
      // ignore
    }

    await refreshData();
    return {
      success: true,
      message: `Pickup confirmed! ${credits} Carbon Credits saved to database for both parties.`,
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
        isLoading,
        registerAccount,
        loginAccount,
        completeOnboarding,
        signOut,
        switchUser,
        refreshData,
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
