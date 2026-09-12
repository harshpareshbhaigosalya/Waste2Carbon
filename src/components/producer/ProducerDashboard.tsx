import React, { useState } from 'react';
import {
  Plus,
  Award,
  Scale,
  Clock,
  CheckCircle2,
  Truck,
  Calendar,
  MapPin,
  FileCheck,
  RefreshCw,
  DollarSign,
  ArrowUpDown,
  Send,
  Sparkles,
  MessageSquare,
  Check,
  X as XIcon,
  Receipt,
  Scan,
  Cpu,
  Eye,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AddWasteModal } from './AddWasteModal';
import { NegotiationChatModal } from '../NegotiationChatModal';
import { DeliveryReceiptModal } from '../processor/DeliveryReceiptModal';
import { ComputerVisionModal } from '../admin/ComputerVisionModal';
import { PickupRequest, DeliveryReceipt, WasteListing } from '../../types';

interface ProducerDashboardProps {
  onOpenCertificate: () => void;
  onOpenProfile?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const ProducerDashboard: React.FC<ProducerDashboardProps> = ({
  onOpenCertificate,
  onOpenProfile,
  onOpenVoiceAssistant,
}) => {
  const {
    currentUser,
    listings,
    pickupRequests,
    ledger,
    setSelectedCertificate,
    refreshData,
    negotiatePrice,
    respondToNegotiation,
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<DeliveryReceipt | null>(null);

  // Negotiation chat modal state
  const [chatReq, setChatReq] = useState<PickupRequest | null>(null);

  // Quality Inspection AI Scan Modal state
  const [inspectingListing, setInspectingListing] = useState<WasteListing | null>(null);

  // Listings for this producer
  const myListings = listings.filter((l) => l.producer_id === currentUser?.id);

  // Pickup requests for this producer
  const myRequests = pickupRequests.filter((r) => r.producer_id === currentUser?.id);

  // Active accepted request awaiting pickup
  const activePickup = myRequests.find((r) => r.status === 'accepted');

  const totalDivertedTons = myListings
    .filter((l) => l.status === 'collected')
    .reduce((acc, curr) => acc + curr.quantity_in_tons, 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleRespondToCounter = async (reqId: string, accept: boolean) => {
    await respondToNegotiation(reqId, accept);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clean Warm Forest & Gold Accents */}
      <div className="bg-gradient-to-r from-[#1E4330] via-[#244E39] to-[#2D5A43] rounded-3xl p-6 sm:p-8 shadow-sm text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle warm blur */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#E5C378]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E5C378] text-[#1E4330] shadow-2xs">
              Waste Producer Portal
            </span>
            <span className="text-xs text-[#E1DCD3] font-medium">
              · {currentUser?.city ? `${currentUser.city}, ${currentUser.state}` : currentUser?.formatted_address || 'Registered Location'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentUser?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-[#D7DFD8] max-w-xl leading-relaxed">
            List agricultural residue, negotiate high purchase prices with verified conversion facilities, and earn certified carbon credits.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto">
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#F8F5EE] hover:bg-[#F2ECE0] text-[#1E4330] font-bold px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm transition transform hover:-translate-y-0.5 cursor-pointer border border-[#D6CEC2] text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 text-[#9A6A15]" />
              <span>Voice AI</span>
            </button>
          )}

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold transition cursor-pointer text-center"
            >
              Profile
            </button>
          )}

          <button
            onClick={handleRefresh}
            title="Refresh database"
            className="p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin text-[#E5C378]' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-[#1E4330] hover:bg-[#F8F5EE] font-bold px-4 sm:px-5 py-3 rounded-2xl shadow-sm transition cursor-pointer text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 text-[#2D5A43]" />
            <span>+ List Waste Batch</span>
          </button>
        </div>
      </div>

      {/* Prominent Physical Handshake Code Card */}
      {activePickup && (
        <div className="bg-white border border-[#D6CEC2] rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#9A6A15] animate-ping" />
                <span className="text-xs font-bold text-[#9A6A15] uppercase tracking-wider">
                  {activePickup.cluster_name ? `Bulk Route Scheduled (${activePickup.cluster_name})` : 'Pickup Scheduled & En Route'}
                </span>
                {activePickup.scheduled_pickup_date && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#2D5A43] text-white uppercase">
                    Arrival Date: {activePickup.scheduled_pickup_date}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-[#1C1E21]">
                {activePickup.processor_name} is arriving for collection
              </h3>
              <p className="text-xs text-[#575B62]">
                Feedstock: <strong>{activePickup.listing_title}</strong> ({activePickup.quantity_tons} Tons) · Agreed Rate:{' '}
                <strong className="text-[#2D5A43] font-black tabular-nums">
                  ₹{activePickup.proposed_price_per_ton.toLocaleString('en-IN')}/ton
                </strong>
              </p>
              {activePickup.scheduled_pickup_date && (
                <p className="text-xs text-[#1D5E34] bg-[#EDF6F0] p-2.5 rounded-xl border border-[#BCE1C8]">
                  📅 <strong>Facility Dispatch Notice:</strong> The processor has grouped your farm with nearby sellers on their route and confirmed arrival on <strong>{activePickup.scheduled_pickup_date}</strong>.
                </p>
              )}
              <p className="text-xs text-[#575B62] pt-1">
                👉 <strong>Show the 6-digit code below to the driver</strong> upon arrival to verify delivery and release your carbon credits:
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl px-6 py-3.5 text-center shadow-2xs shrink-0">
              <span className="text-[10px] text-[#828892] uppercase tracking-widest block font-bold">
                Pickup Handshake OTP
              </span>
              <span className="text-3xl sm:text-4xl font-mono font-black text-[#9A6A15] tracking-widest block mt-0.5">
                {activePickup.verification_code}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards in Clean SaaS Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#575B62]">Total Waste Diverted</span>
          <p className="text-2xl font-black text-[#1C1E21] mt-1 tabular-nums">
            {totalDivertedTons} <span className="text-xs text-[#828892] font-normal">Tons</span>
          </p>
          <p className="text-[11px] text-[#2D5A43] font-medium mt-0.5">Diverted from landfills & burning</p>
        </div>

        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#575B62]">Carbon Credits Balance</span>
          <p className="text-2xl font-black text-[#2D5A43] mt-1 tabular-nums">
            {currentUser?.carbon_credits_balance || 0} <span className="text-xs text-[#828892] font-normal">Credits</span>
          </p>
          <p className="text-[11px] text-[#9A6A15] font-medium mt-0.5">1 Credit = 1 Ton verified CO2e</p>
        </div>

        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#575B62]">Active Listings</span>
          <p className="text-2xl font-black text-[#1C1E21] mt-1 tabular-nums">
            {myListings.length} <span className="text-xs text-[#828892] font-normal">Batches</span>
          </p>
          <p className="text-[11px] text-[#828892] mt-0.5">Stored in Supabase database</p>
        </div>
      </div>

      {/* Active Price Negotiations & Facility Offers */}
      {myRequests.length > 0 && (
        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FDF6E2] text-[#855B09] flex items-center justify-center font-bold border border-[#EED99E]">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#1C1E21]">Price Negotiation & Facility Bids</h2>
                <p className="text-xs text-[#575B62]">Negotiate for a higher selling price per ton directly with processors</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-[#FAF8F5] text-[#575B62] border border-[#E7E1D7] px-2.5 py-1 rounded-full">
              {myRequests.length} Facility Offers
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myRequests.map((req) => {
              const isCounteredByProc = req.negotiation_status === 'countered_by_processor';
              const isCounteredByMe = req.negotiation_status === 'countered_by_producer';

              return (
                <div
                  key={req.id}
                  className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-4 space-y-3 relative hover:border-[#D6CEC2] transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#1C1E21]">{req.listing_title}</h4>
                      <p className="text-xs text-[#575B62]">Buyer Facility: <strong className="text-[#1C1E21]">{req.processor_name}</strong></p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.negotiation_status === 'agreed'
                          ? 'badge-status-verified'
                          : req.negotiation_status === 'rejected'
                          ? 'bg-[#FBEAE9] text-[#9E2A2B] border border-[#F5C2C0]'
                          : req.negotiation_status?.startsWith('countered')
                          ? 'badge-status-estimated'
                          : 'bg-[#F4F0E8] text-[#575B62] border border-[#E7E1D7]'
                      }`}
                    >
                      {req.negotiation_status === 'agreed'
                        ? 'Price Agreed'
                        : req.negotiation_status === 'rejected'
                        ? 'Declined'
                        : req.negotiation_status === 'countered_by_producer'
                        ? 'Your Counter Pending'
                        : req.negotiation_status === 'countered_by_processor'
                        ? 'Processor Countered'
                        : 'Initial Offer'}
                    </span>
                  </div>

                  {/* Quality Inspection Photo preview if available */}
                  {req.listing_photo_url && (
                    <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E7E1D7]">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.listing_photo_url}
                          alt="Quality Inspection"
                          className="w-14 h-12 rounded-lg object-cover border border-[#E7E1D7] shadow-2xs cursor-pointer hover:opacity-90 transition"
                          onClick={() => {
                            const matched = listings.find((l) => l.id === req.listing_id);
                            if (matched) setInspectingListing(matched);
                            else {
                              setInspectingListing({
                                id: req.listing_id,
                                producer_id: req.producer_id,
                                producer_name: req.producer_name,
                                producer_phone: req.producer_phone,
                                title: req.listing_title,
                                waste_category: req.waste_category,
                                waste_subcategory: req.waste_category,
                                quantity: req.quantity_tons,
                                unit: 'ton',
                                quantity_in_tons: req.quantity_tons,
                                expected_ready_date: req.proposed_pickup_date,
                                formatted_address: req.producer_address,
                                latitude: 28.61,
                                longitude: 77.2,
                                estimated_co2_sequestered: 2.1,
                                estimated_value_usd: 5000,
                                status: 'requested',
                                photo_url: req.listing_photo_url,
                                quality_grade: req.quality_grade as any,
                                verification_otp: req.verification_code,
                                created_at: req.created_at,
                              });
                            }
                          }}
                        />
                        <div className="text-xs space-y-0.5">
                          <span className="text-[10px] text-[#828892] font-medium block">Inspected Quality:</span>
                          <span className="font-bold text-[#1D5E34] bg-[#EDF6F0] px-2 py-0.5 rounded-md border border-[#BCE1C8] text-[11px]">
                            {req.quality_grade || 'Grade B (Standard)'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const matched = listings.find((l) => l.id === req.listing_id);
                          if (matched) setInspectingListing(matched);
                          else {
                            setInspectingListing({
                              id: req.listing_id,
                              producer_id: req.producer_id,
                              producer_name: req.producer_name,
                              producer_phone: req.producer_phone,
                              title: req.listing_title,
                              waste_category: req.waste_category,
                              waste_subcategory: req.waste_category,
                              quantity: req.quantity_tons,
                              unit: 'ton',
                              quantity_in_tons: req.quantity_tons,
                              expected_ready_date: req.proposed_pickup_date,
                              formatted_address: req.producer_address,
                              latitude: 28.61,
                              longitude: 77.2,
                              estimated_co2_sequestered: 2.1,
                              estimated_value_usd: 5000,
                              status: 'requested',
                              photo_url: req.listing_photo_url,
                              quality_grade: req.quality_grade as any,
                              verification_otp: req.verification_code,
                              created_at: req.created_at,
                            });
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE0] border border-[#E7E1D7] text-[11px] font-bold text-[#2D5A43] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Scan className="w-3.5 h-3.5 text-[#E5C378]" />
                        <span>AI Assay</span>
                      </button>
                    </div>
                  )}

                  {/* Price comparison card */}
                  <div className="bg-white p-3 rounded-xl border border-[#E7E1D7] grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-[#828892] block">Offered Rate</span>
                      <span className="font-bold text-[#1C1E21] tabular-nums">
                        ₹{req.proposed_price_per_ton.toLocaleString('en-IN')}/ton
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#828892] block">Total Est. Payout</span>
                      <span className="font-black text-[#2D5A43] tabular-nums">
                        ₹{Math.round(req.proposed_price_per_ton * req.quantity_tons).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* If processor countered */}
                  {isCounteredByProc && req.counter_price_per_ton && (
                    <div className="bg-[#FDF6E2] border border-[#EED99E] rounded-xl p-3 text-xs space-y-2">
                      <p className="text-[#855B09] font-bold">
                        Processor proposed counter: ₹{req.counter_price_per_ton.toLocaleString('en-IN')} / ton
                      </p>
                      {req.negotiation_notes && (
                        <p className="text-[#575B62] text-[11px] italic">"{req.negotiation_notes}"</p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleRespondToCounter(req.id, true)}
                          className="flex-1 bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Price
                        </button>
                        <button
                          onClick={() => handleRespondToCounter(req.id, false)}
                          className="px-3 bg-white hover:bg-[#F8F5EE] text-[#575B62] font-bold py-1.5 rounded-lg text-xs border border-[#E7E1D7] cursor-pointer transition"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If I countered */}
                  {isCounteredByMe && req.counter_price_per_ton && (
                    <div className="bg-[#EDF6F0] border border-[#BCE1C8] rounded-xl p-2.5 text-xs text-[#1D5E34]">
                      You asked for <strong>₹{req.counter_price_per_ton.toLocaleString('en-IN')} / ton</strong>. Awaiting facility response.
                    </div>
                  )}

                  {/* Two-Way Chat & Negotiation trigger button */}
                  {req.status === 'pending' && (
                    <button
                      onClick={() => setChatReq(req)}
                      className="w-full py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#E5C378]" />
                      <span>Chat & Negotiate Price</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listings Section */}
      <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-black text-[#1C1E21]">Your Listed Waste Batches</h2>

        {myListings.length === 0 ? (
          <div className="py-12 text-center text-[#828892] space-y-3">
            <Scale className="w-10 h-10 mx-auto opacity-40 text-[#2D5A43]" />
            <p className="text-sm font-medium text-[#575B62]">You have not listed any waste batches yet.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#2D5A43] text-white text-xs font-bold hover:bg-[#1E4330] shadow-2xs transition cursor-pointer"
            >
              + Create First Waste Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-5 space-y-3 hover:border-[#D6CEC2] transition shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-[#1C1E21]">{listing.title}</h3>
                    <p className="text-xs text-[#828892] mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Ready: {listing.expected_ready_date}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      listing.status === 'collected'
                        ? 'badge-status-verified'
                        : listing.status === 'accepted'
                        ? 'badge-status-actual'
                        : 'badge-status-estimated'
                    }`}
                  >
                    {listing.status === 'collected'
                      ? 'VERIFIED'
                      : listing.status === 'accepted'
                      ? 'ACTUAL'
                      : 'ESTIMATED'}
                  </span>
                </div>

                {/* Quality photo card with AI Assay inspection */}
                {listing.photo_url && (
                  <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E7E1D7]">
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.photo_url}
                        alt="Quality Inspection"
                        className="w-14 h-12 rounded-lg object-cover border border-[#E7E1D7] shadow-2xs cursor-pointer hover:opacity-90 transition"
                        onClick={() => setInspectingListing(listing)}
                      />
                      <div className="text-xs space-y-0.5">
                        <span className="text-[10px] text-[#828892] font-medium block">Quality Inspection Photo:</span>
                        <span className="font-bold text-[#1D5E34] bg-[#EDF6F0] px-2 py-0.5 rounded-md border border-[#BCE1C8] text-[11px]">
                          {listing.quality_grade || 'Grade B (Standard)'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectingListing(listing)}
                      className="px-3 py-1.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                    >
                      <Cpu className="w-3.5 h-3.5 text-[#E5C378]" />
                      <span>Inspect AI Assay</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-[#E7E1D7]">
                  <div>
                    <span className="text-[10px] text-[#828892] block">CO2e Sequestration</span>
                    <span className="font-bold text-[#2D5A43] tabular-nums">
                      {listing.estimated_co2_sequestered} Tons CO2e
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#828892] block">Pickup OTP</span>
                    <span className="font-mono font-bold text-[#9A6A15] tracking-wider">
                      {listing.verification_otp}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-[#575B62] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#828892] shrink-0" />
                  <span className="truncate">{listing.formatted_address || `${listing.city}, ${listing.state}`}</span>
                </div>

                {listing.assigned_processor_name ? (
                  <p className="text-xs text-[#575B62]">
                    Assigned Buyer: <strong className="text-[#1C1E21]">{listing.assigned_processor_name}</strong>
                  </p>
                ) : (
                  <p className="text-xs text-[#855B09] font-medium bg-[#FDF6E2] px-2.5 py-1 rounded-lg border border-[#EED99E]">
                    Listed on Open Marketplace · Available for any facility to bid
                  </p>
                )}

                {listing.status === 'collected' && (
                  <div className="pt-2 border-t border-[#E7E1D7] flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        const matchedReq = pickupRequests.find((r) => r.listing_id === listing.id);
                        const rate = matchedReq?.counter_price_per_ton || matchedReq?.proposed_price_per_ton || 2500;
                        const total = Math.round(rate * listing.quantity_in_tons);
                        const r: DeliveryReceipt = {
                          receiptId: `W2C-GRN-${listing.id.slice(-6)}`,
                          requestId: matchedReq?.id || listing.id,
                          certificateCode: `W2C-CERT-${listing.id.slice(-6)}`,
                          listingTitle: listing.title,
                          quantityTons: listing.quantity_in_tons,
                          ratePerTon: rate,
                          totalPayoutINR: total,
                          platformFeeINR: Math.round(total * 0.025),
                          producerNetPayoutINR: total,
                          carbonCreditsAwarded: listing.estimated_co2_sequestered,
                          co2ePreventedTons: listing.estimated_co2_sequestered,
                          producerName: currentUser?.full_name || 'Farmer',
                          producerEmail: currentUser?.email || 'farmer@wastetocarbon.in',
                          producerPhone: currentUser?.phone || '+91 98765 43210',
                          processorName: listing.assigned_processor_name || 'Industrial Biochar Facility',
                          processorEmail: 'plant@wastetocarbon.in',
                          timestamp: listing.created_at || new Date().toISOString(),
                          otpVerified: listing.verification_otp,
                        };
                        setSelectedReceipt(r);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#1C1E21] hover:text-[#2D5A43] bg-[#F8F5EE] hover:bg-[#F2ECE0] px-3 py-1.5 rounded-xl border border-[#E7E1D7] transition cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#9A6A15]" />
                      <span>Delivery Receipt (GRN)</span>
                    </button>

                    <button
                      onClick={() => {
                        const entry = ledger.find((l) => l.user_id === currentUser?.id);
                        if (entry) setSelectedCertificate(entry);
                        onOpenCertificate();
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#1D5E34] hover:text-[#144224] bg-[#EDF6F0] px-3 py-1.5 rounded-xl border border-[#BCE1C8] transition cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#2D5A43]" />
                      <span>View Carbon Certificate</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two-Way Negotiation Chat Modal */}
      {chatReq && (
        <NegotiationChatModal
          isOpen={Boolean(chatReq)}
          onClose={() => setChatReq(null)}
          request={chatReq}
        />
      )}

      <AddWasteModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {/* Delivery Receipt (GRN) & WhatsApp Dispatch Modal */}
      {selectedReceipt && (
        <DeliveryReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

      {/* AI Vision Assay Inspection Modal */}
      {inspectingListing && (
        <ComputerVisionModal
          listing={inspectingListing}
          onClose={() => setInspectingListing(null)}
        />
      )}
    </div>
  );
};
