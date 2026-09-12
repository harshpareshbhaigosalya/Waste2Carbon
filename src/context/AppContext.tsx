import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  WasteListing,
  PickupRequest,
  CarbonLedgerEntry,
  AddressData,
  NegotiationMessage,
  NegotiationStatus,
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
    photo_url?: string;
    quality_grade?: 'Grade A (Low Moisture)' | 'Grade B (Standard)' | 'Grade C (Mixed / High Moisture)';
    quality_notes?: string;
  }) => Promise<{ success: boolean; message: string }>;

  acceptPickupRequest: (requestId: string) => Promise<void>;
  verifyPickupHandshake: (requestId: string, enteredOtp: string) => Promise<{ success: boolean; message: string; credits?: number }>;

  // Negotiation Operations
  negotiatePrice: (requestId: string, counterPrice: number, notes?: string) => Promise<{ success: boolean; message: string }>;
  sendNegotiationMessage: (requestId: string, messageText: string, counterPrice?: number) => Promise<{ success: boolean; message: string }>;
  respondToNegotiation: (requestId: string, accept: boolean) => Promise<{ success: boolean; message: string }>;
  createPickupProposal: (listingId: string, offeredPrice: number, initialMessage?: string) => Promise<{ success: boolean; message: string }>;

  // Smart Cluster Bulk Pickup Scheduling
  scheduleClusterPickup: (requestIds: string[], clusterName: string, scheduledDate: string) => Promise<{ success: boolean; message: string }>;

  // Admin & Verification Operations
  verifyProcessor: (processorId: string, verifiedStatus: boolean) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile> & { addressData?: AddressData }) => Promise<{ success: boolean; message: string }>;
  updateProcessorPrice: (newPrice: number) => Promise<void>;

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
        const parsed = requestsData.map((r: any) => ({
          ...r,
          negotiation_messages: typeof r.negotiation_messages === 'string'
            ? (() => {
                try {
                  return JSON.parse(r.negotiation_messages);
                } catch {
                  return [];
                }
              })()
            : Array.isArray(r.negotiation_messages)
            ? r.negotiation_messages
            : [],
        }));
        setPickupRequests(parsed);
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

  // Initial load
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const authUser = sessionData?.session?.user;

        if (authUser) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

          if (profile) {
            setCurrentUser(profile);
          } else {
            const placeholder: UserProfile = {
              id: authUser.id,
              email: authUser.email || '',
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              phone: '',
              role: 'producer',
              entity_type: 'farm',
              onboarded: false,
              verified: true,
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

  // 2. Register Account
  const registerAccount = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string; requiresVerification?: boolean }> => {
    const cleanEmail = email.trim().toLowerCase();

    // STRICT CHECK: Ensure this email is not already registered in Supabase profiles
    try {
      const { data: existingProfiles, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', cleanEmail);

      if (!checkError && existingProfiles && existingProfiles.length > 0) {
        return {
          success: false,
          message: 'An account with this email address already exists. Please sign in instead.',
        };
      }
    } catch (checkErr) {
      console.warn('Email duplicate check warning:', checkErr);
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        // If error message indicates user already registered
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('user already exists') ||
          error.status === 422
        ) {
          return {
            success: false,
            message: 'This email is already registered. Please sign in or use another email.',
          };
        }

        // If Supabase free tier email rate limit is triggered, verify again against profiles
        if (error.message.toLowerCase().includes('rate limit') || error.status === 429) {
          // Double check database to prevent duplicate fallback creation
          const { data: dupCheck } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', cleanEmail);

          if (dupCheck && dupCheck.length > 0) {
            return {
              success: false,
              message: 'This email is already registered. Please switch to Sign In.',
            };
          }

          const fallbackId = `usr-${Date.now()}`;
          const fallbackProfile: UserProfile = {
            id: fallbackId,
            email: cleanEmail,
            full_name: cleanEmail.split('@')[0],
            phone: '',
            role: 'producer',
            entity_type: 'farm',
            onboarded: false,
            verified: false,
            carbon_credits_balance: 0,
          };
          await supabase.from('profiles').upsert(fallbackProfile);
          setCurrentUser(fallbackProfile);
          await refreshData();
          return {
            success: true,
            message: `Account created successfully! Proceeding to onboarding profile...`,
            requiresVerification: false,
          };
        }
        return { success: false, message: error.message };
      }

      const authUser = data?.user;
      if (!authUser) {
        return { success: false, message: 'Registration failed. Please try again.' };
      }

      // Check if user already exists
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          message: 'This email is already registered. Please sign in.',
        };
      }

      const initialProfile: UserProfile = {
        id: authUser.id,
        email: authUser.email || cleanEmail,
        full_name: cleanEmail.split('@')[0],
        phone: '',
        role: 'producer',
        entity_type: 'farm',
        onboarded: false,
        verified: false,
        carbon_credits_balance: 0,
      };

      await supabase.from('profiles').upsert(initialProfile);
      setCurrentUser(initialProfile);
      await refreshData();

      const session = data?.session;
      const requiresVerification = !session;

      return {
        success: true,
        message: requiresVerification
          ? `Account created! A confirmation email was sent to ${cleanEmail}. Please check your inbox / spam folder. You can now complete your onboarding profile.`
          : 'Account created and verified! Please complete your onboarding profile.',
        requiresVerification,
      };
    } catch (err: any) {
      console.error('Registration exception:', err);
      return {
        success: false,
        message: err.message || 'Registration failed. Please try again or sign in.',
      };
    }
  };

  // 3. Login Account (with dedicated Admin check)
  const loginAccount = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; message: string }> => {
    // Special check for Admin credentials requested by user
    if (email.trim().toLowerCase() === 'admin@gmail.com' && pass === 'admin123') {
      const adminProfile: UserProfile = {
        id: 'admin-root',
        email: 'admin@gmail.com',
        full_name: 'W2C System Administrator',
        phone: '+91 99999 99999',
        role: 'admin',
        entity_type: 'admin',
        onboarded: true,
        verified: true,
        carbon_credits_balance: 0,
      };
      try {
        await supabase.from('profiles').upsert(adminProfile);
      } catch (e) {
        console.warn('Admin profile upsert:', e);
      }
      setCurrentUser(adminProfile);
      await refreshData();
      return { success: true, message: 'Welcome Administrator!' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        const { data: directProfile } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', email)
          .maybeSingle();

        if (directProfile) {
          setCurrentUser(directProfile);
          await refreshData();
          return { success: true, message: 'Signed in successfully!' };
        }
        return { success: false, message: error.message };
      }

      const authUser = data.user;
      const { data: profile } = await supabase
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
          verified: false,
          carbon_credits_balance: 0,
        };
        await supabase.from('profiles').upsert(placeholder);
        setCurrentUser(placeholder);
      }

      await refreshData();
      return { success: true, message: 'Signed in successfully!' };
    } catch (err: any) {
      const { data: directProfile } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', email)
        .maybeSingle();

      if (directProfile) {
        setCurrentUser(directProfile);
        await refreshData();
        return { success: true, message: 'Signed in successfully!' };
      }
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  // 4. Complete Onboarding: Save profile permanently to Supabase
  const completeOnboarding = async (
    data: Partial<UserProfile> & { addressData?: AddressData }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'No active session' };

    const addr = data.addressData;
    const isProcessor = (data.role || currentUser.role) === 'processor';

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
      onboarded: true,
      // Processors start unverified until admin approves! Producers are active.
      verified: isProcessor ? false : true,
    };
    delete (updatedProfile as any).addressData;

    const { error } = await supabase.from('profiles').upsert(updatedProfile);
    if (error) {
      console.error('Supabase profile update error:', error);
      return { success: false, message: `Failed to save profile: ${error.message}` };
    }

    setCurrentUser(updatedProfile);
    await refreshData();
    return { success: true, message: 'Profile saved permanently in Supabase database!' };
  };

  // 5. Update Profile (Name, Phone, Address)
  const updateUserProfile = async (
    data: Partial<UserProfile> & { addressData?: AddressData }
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'No active session' };

    const addr = data.addressData;
    const updated: UserProfile = {
      ...currentUser,
      ...data,
      street_address: addr?.street_address ?? currentUser.street_address,
      city: addr?.city ?? currentUser.city,
      state: addr?.state ?? currentUser.state,
      pincode: addr?.pincode ?? currentUser.pincode,
      formatted_address: addr?.formatted_address ?? currentUser.formatted_address,
      latitude: addr?.latitude ?? currentUser.latitude,
      longitude: addr?.longitude ?? currentUser.longitude,
    };
    delete (updated as any).addressData;

    const { error } = await supabase.from('profiles').upsert(updated);
    if (error) {
      return { success: false, message: error.message };
    }

    setCurrentUser(updated);
    await refreshData();
    return { success: true, message: 'Profile updated in Supabase!' };
  };

  // 6. Quick Update Processor Price
  const updateProcessorPrice = async (newPrice: number) => {
    if (!currentUser) return;
    const updated: UserProfile = {
      ...currentUser,
      price_per_ton: newPrice,
    };
    await supabase.from('profiles').update({ price_per_ton: newPrice }).eq('id', currentUser.id);
    setCurrentUser(updated);
    await refreshData();
  };

  // 7. Admin Action: Verify / Reject Processor
  const verifyProcessor = async (processorId: string, verifiedStatus: boolean) => {
    await supabase.from('profiles').update({ verified: verifiedStatus }).eq('id', processorId);
    await refreshData();
  };

  // Switch between profiles
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

  // 8. Add Waste Listing
  const addListing = async (data: {
    title: string;
    waste_category: 'dry_organic' | 'wet_organic';
    waste_subcategory: string;
    quantity: number;
    unit: 'ton' | 'kg' | 'quintal';
    expected_ready_date: string;
    addressData: AddressData;
    processor_id?: string;
    photo_url?: string;
    quality_grade?: 'Grade A (Low Moisture)' | 'Grade B (Standard)' | 'Grade C (Mixed / High Moisture)';
    quality_notes?: string;
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
      estimated_value_usd: metrics.estimatedMarketValueINR,
      photo_url: data.photo_url,
      quality_grade: data.quality_grade,
      quality_notes: data.quality_notes,
      status,
      assigned_processor_id: data.processor_id || undefined,
      assigned_processor_name: assignedProcessorName || undefined,
      verification_otp: otp,
      created_at: new Date().toISOString(),
    };

    const { error: listErr } = await supabase.from('waste_listings').insert([newListing]);
    if (listErr) {
      return { success: false, message: `Database error: ${listErr.message}` };
    }

    if (data.processor_id) {
      const proc = allUsers.find((u) => u.id === data.processor_id);
      const initialPrice = proc?.price_per_ton || 2500;
      const initialMessage: NegotiationMessage = {
        id: `msg-${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_role: 'producer',
        message: data.quality_notes
          ? `Listing created (${data.quality_grade || 'Standard Quality'}). Quality note: ${data.quality_notes}`
          : `Listing created for ${data.quantity} ${data.unit} (${data.quality_grade || 'Standard Quality'}). Ready for inspection and pickup.`,
        offered_price: initialPrice,
        created_at: new Date().toISOString(),
      };

      const newRequest: PickupRequest = {
        id: `req-${Date.now()}`,
        listing_id: newListing.id,
        listing_title: newListing.title,
        listing_photo_url: data.photo_url,
        quality_grade: data.quality_grade,
        producer_id: currentUser.id,
        producer_name: currentUser.full_name,
        producer_phone: currentUser.phone,
        producer_address: data.addressData.formatted_address,
        processor_id: data.processor_id,
        processor_name: proc?.full_name || 'Processor',
        quantity_tons: metrics.tons,
        waste_category: data.waste_category,
        proposed_pickup_date: data.expected_ready_date,
        proposed_price_per_ton: initialPrice,
        original_price_per_ton: initialPrice,
        negotiation_status: 'none',
        negotiation_messages: [initialMessage],
        verification_code: otp,
        status: 'pending',
        credits_awarded: 0,
        created_at: new Date().toISOString(),
      };

      await supabase.from('pickup_requests').insert([newRequest]);
    }

    await refreshData();
    return { success: true, message: 'Waste listing saved directly to Supabase!' };
  };

  // 9. Send Negotiation Chat Message & Optional Counter-Offer Price
  const sendNegotiationMessage = async (
    requestId: string,
    messageText: string,
    counterPrice?: number
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Please sign in first' };
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found' };

    const isProducer = currentUser.id === req.producer_id;
    const senderRole: 'producer' | 'processor' = isProducer ? 'producer' : 'processor';
    
    let statusVal = req.negotiation_status || 'proposed';
    if (counterPrice !== undefined && counterPrice > 0) {
      statusVal = isProducer ? 'countered_by_producer' : 'countered_by_processor';
    }

    const newMsg: NegotiationMessage = {
      id: `msg-${Date.now()}`,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: senderRole,
      message: messageText,
      offered_price: counterPrice,
      created_at: new Date().toISOString(),
    };

    const currentMessages: NegotiationMessage[] = Array.isArray(req.negotiation_messages)
      ? [...req.negotiation_messages]
      : [];
    currentMessages.push(newMsg);

    const updates: any = {
      negotiation_messages: currentMessages,
      negotiation_status: statusVal,
      last_negotiated_by: senderRole,
      negotiation_notes: messageText,
    };

    if (counterPrice !== undefined && counterPrice > 0) {
      updates.counter_price_per_ton = counterPrice;
    }

    const { error } = await supabase.from('pickup_requests').update(updates).eq('id', requestId);
    if (error) {
      return { success: false, message: error.message };
    }

    await refreshData();
    return {
      success: true,
      message: counterPrice
        ? `Offer of ₹${counterPrice.toLocaleString('en-IN')}/ton sent with note!`
        : 'Message sent to partner!',
    };
  };

  // Legacy helper: Producer or Processor submits a counter-offer
  const negotiatePrice = async (
    requestId: string,
    counterPrice: number,
    notes?: string
  ): Promise<{ success: boolean; message: string }> => {
    return sendNegotiationMessage(
      requestId,
      notes || `Proposed counter rate of ₹${counterPrice.toLocaleString('en-IN')}/ton.`,
      counterPrice
    );
  };

  // 10. Respond to negotiation (Agree/Accept or Reject)
  const respondToNegotiation = async (
    requestId: string,
    accept: boolean
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Please sign in first' };
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found' };

    const isProducer = currentUser.id === req.producer_id;
    const currentMessages: NegotiationMessage[] = Array.isArray(req.negotiation_messages)
      ? [...req.negotiation_messages]
      : [];

    if (accept) {
      const finalPrice = req.counter_price_per_ton || req.proposed_price_per_ton;
      const acceptMsg: NegotiationMessage = {
        id: `msg-${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_role: isProducer ? 'producer' : 'processor',
        message: `Accepted price of ₹${finalPrice.toLocaleString('en-IN')}/ton. Deal agreed!`,
        offered_price: finalPrice,
        created_at: new Date().toISOString(),
      };
      currentMessages.push(acceptMsg);

      const updates: any = {
        proposed_price_per_ton: finalPrice,
        negotiation_status: 'agreed',
        negotiation_messages: currentMessages,
      };
      await supabase.from('pickup_requests').update(updates).eq('id', requestId);
    } else {
      const declineMsg: NegotiationMessage = {
        id: `msg-${Date.now()}`,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_role: isProducer ? 'producer' : 'processor',
        message: `Declined the counter-offer. Open to a revised proposal.`,
        created_at: new Date().toISOString(),
      };
      currentMessages.push(declineMsg);

      await supabase
        .from('pickup_requests')
        .update({
          negotiation_status: 'rejected',
          negotiation_messages: currentMessages,
        })
        .eq('id', requestId);
    }

    await refreshData();
    return {
      success: true,
      message: accept ? 'Counter-offer agreed! Price locked.' : 'Counter-offer declined.',
    };
  };

  // 11. Processor claims an open marketplace listing and initiates offer/negotiation
  const createPickupProposal = async (
    listingId: string,
    offeredPrice: number,
    initialMessage?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || currentUser.role !== 'processor') {
      return { success: false, message: 'Only registered processors can submit buying proposals' };
    }
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return { success: false, message: 'Listing not found in database' };

    const firstMsg: NegotiationMessage = {
      id: `msg-${Date.now()}`,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: 'processor',
      message:
        initialMessage ||
        `Inspected quality: ${listing.quality_grade || 'Standard'}. Proposing buying rate of ₹${offeredPrice.toLocaleString('en-IN')}/ton.`,
      offered_price: offeredPrice,
      created_at: new Date().toISOString(),
    };

    const newRequest: PickupRequest = {
      id: `req-${Date.now()}`,
      listing_id: listing.id,
      listing_title: listing.title,
      listing_photo_url: listing.photo_url,
      quality_grade: listing.quality_grade,
      producer_id: listing.producer_id,
      producer_name: listing.producer_name,
      producer_phone: listing.producer_phone,
      producer_address: listing.formatted_address,
      processor_id: currentUser.id,
      processor_name: currentUser.full_name,
      quantity_tons: listing.quantity_in_tons,
      waste_category: listing.waste_category,
      proposed_pickup_date: listing.expected_ready_date,
      proposed_price_per_ton: offeredPrice,
      original_price_per_ton: offeredPrice,
      counter_price_per_ton: offeredPrice,
      negotiation_status: 'countered_by_processor',
      last_negotiated_by: 'processor',
      negotiation_notes: firstMsg.message,
      negotiation_messages: [firstMsg],
      verification_code: listing.verification_otp,
      status: 'pending',
      credits_awarded: 0,
      created_at: new Date().toISOString(),
    };

    const { error: reqErr } = await supabase.from('pickup_requests').insert([newRequest]);
    if (reqErr) {
      return { success: false, message: `Database error: ${reqErr.message}` };
    }

    await supabase
      .from('waste_listings')
      .update({
        assigned_processor_id: currentUser.id,
        assigned_processor_name: currentUser.full_name,
        status: 'requested',
      })
      .eq('id', listing.id);

    await refreshData();
    return {
      success: true,
      message: 'Proposal submitted! The producer can now inspect and negotiate with you.',
    };
  };

  // 11. Schedule Bulk Cluster Pickup & Notify All Producers in Cluster
  const scheduleClusterPickup = async (
    requestIds: string[],
    clusterName: string,
    scheduledDate: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Please log in' };

    const clusterId = `cluster-${Date.now()}`;

    // Update all requests in this cluster to 'accepted', assign scheduled date and cluster id
    for (const reqId of requestIds) {
      const req = pickupRequests.find((r) => r.id === reqId);
      if (req) {
        await supabase
          .from('pickup_requests')
          .update({
            status: 'accepted',
            cluster_id: clusterId,
            cluster_name: clusterName,
            scheduled_pickup_date: scheduledDate,
            cluster_notification_sent: true,
          })
          .eq('id', reqId);

        await supabase
          .from('waste_listings')
          .update({ status: 'accepted' })
          .eq('id', req.listing_id);
      }
    }

    await refreshData();
    return {
      success: true,
      message: `Cluster "${clusterName}" scheduled for ${scheduledDate}! All ${requestIds.length} producers notified.`,
    };
  };

  // 12. Processor accepts pickup request
  const acceptPickupRequest = async (requestId: string) => {
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) return;

    await supabase.from('pickup_requests').update({ status: 'accepted' }).eq('id', requestId);
    await supabase.from('waste_listings').update({ status: 'accepted' }).eq('id', req.listing_id);

    await refreshData();
  };

  // 10. Handshake verification via 6-digit OTP
  const verifyPickupHandshake = async (
    requestId: string,
    enteredOtp: string
  ): Promise<{ success: boolean; message: string; credits?: number }> => {
    const req = pickupRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found in database.' };

    if (req.verification_code.trim() !== enteredOtp.trim()) {
      return { success: false, message: 'Incorrect 6-digit code. Please verify the code on the producer’s screen.' };
    }

    const metrics = calculateCarbonMetrics(req.waste_category, req.quantity_tons, 'ton');
    const credits = metrics.carbonCredits;

    await supabase
      .from('pickup_requests')
      .update({ status: 'collected', credits_awarded: credits })
      .eq('id', requestId);

    await supabase
      .from('waste_listings')
      .update({ status: 'collected' })
      .eq('id', req.listing_id);

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
        negotiatePrice,
        sendNegotiationMessage,
        respondToNegotiation,
        createPickupProposal,
        scheduleClusterPickup,
        verifyProcessor,
        updateUserProfile,
        updateProcessorPrice,
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
