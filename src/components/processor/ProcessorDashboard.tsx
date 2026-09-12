import React, { useState } from 'react';
import {
  Factory,
  Truck,
  CheckCircle2,
  Award,
  Phone,
  MapPin,
  KeyRound,
  FileCheck,
  DollarSign,
  RefreshCw,
  ShieldAlert,
  User,
  Clock,
  FileText,
  Check,
  ArrowUpDown,
  Sparkles,
  Send,
  MessageSquare,
  Camera,
  Calendar,
  Scan,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PickupRequest, WasteListing, DeliveryReceipt } from '../../types';
import { SmartClusterView } from './SmartClusterView';
import { generateWasteClusters, ClusterPoint, WasteCluster } from '../../lib/clusteringOptimizer';
import { Layers } from 'lucide-react';
import { NegotiationChatModal } from '../NegotiationChatModal';
import { DeliveryReceiptModal } from './DeliveryReceiptModal';
import { ComputerVisionModal } from '../admin/ComputerVisionModal';

interface ProcessorDashboardProps {
  onOpenCertificate: () => void;
  onOpenProfile?: () => void;
  onOpenVoiceAssistant?: () => void;
}

export const ProcessorDashboard: React.FC<ProcessorDashboardProps> = ({
  onOpenCertificate,
  onOpenProfile,
  onOpenVoiceAssistant,
}) => {
  const {
    currentUser,
    pickupRequests,
    listings,
    acceptPickupRequest,
    verifyPickupHandshake,
    ledger,
    setSelectedCertificate,
    refreshData,
    updateProcessorPrice,
    negotiatePrice,
    respondToNegotiation,
    scheduleClusterPickup,
    createPickupProposal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'clusters' | 'marketplace'>('clusters');
  const [activeHandshakeReq, setActiveHandshakeReq] = useState<PickupRequest | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [handshakeError, setHandshakeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDeliveryReceipt, setActiveDeliveryReceipt] = useState<DeliveryReceipt | null>(null);

  // Quick Price Edit inline state
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(currentUser?.price_per_ton || 2500);
  const [priceSaved, setPriceSaved] = useState(false);

  // Two-Way Negotiation Chat Modal
  const [chatReq, setChatReq] = useState<PickupRequest | null>(null);

  // Marketplace Proposal Modal state
  const [proposalListing, setProposalListing] = useState<WasteListing | null>(null);

  // Quality Inspection AI Scan Modal state
  const [inspectingListing, setInspectingListing] = useState<WasteListing | null>(null);
  const [proposalPrice, setProposalPrice] = useState<number>(currentUser?.price_per_ton || 2500);
  const [proposalNote, setProposalNote] = useState('');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const [proposalFeedback, setProposalFeedback] = useState('');

  // Requests for this processor
  const myRequests = pickupRequests.filter((r) => r.processor_id === currentUser?.id);

  // Open marketplace listings (not assigned to any specific plant)
  const openMarketplaceListings = listings.filter(
    (l) => l.status === 'available' && (!l.assigned_processor_id || l.assigned_processor_id === '')
  );

  // Compute Smart Clusters from pending requests & available listings in geographic radius
  const facilityLat = currentUser?.latitude || 28.6139;
  const facilityLng = currentUser?.longitude || 77.2090;

  // Build cluster points list from all incoming requests and available local listings
  const clusterPoints: ClusterPoint[] = React.useMemo(() => {
    const points: ClusterPoint[] = [];

    // From pickup requests
    myRequests
      .filter((r) => r.status !== 'collected')
      .forEach((r) => {
        // match listing for coordinates if possible
        const l = listings.find((x) => x.id === r.listing_id);
        const lat = l?.latitude || facilityLat + (Math.random() - 0.5) * 0.15;
        const lng = l?.longitude || facilityLng + (Math.random() - 0.5) * 0.15;
        points.push({
          id: r.id,
          producer_name: r.producer_name,
          producer_phone: r.producer_phone,
          location_name: r.producer_address || `${l?.city || 'Village Area'}, ${l?.state || 'India'}`,
          latitude: lat,
          longitude: lng,
          quantity_tons: r.quantity_tons,
          waste_subcategory: l?.waste_subcategory || 'Biomass Feedstock',
          proposed_date: r.proposed_pickup_date,
          price_per_ton: r.proposed_price_per_ton,
          status: r.status,
        });
      });

    // Also include available unassigned listings matching facility technology
    listings
      .filter(
        (l) =>
          l.status === 'available' &&
          !points.some((p) => p.id === l.id) &&
          (currentUser?.facility_type === 'biochar'
            ? l.waste_category === 'dry_organic'
            : l.waste_category === 'wet_organic')
      )
      .forEach((l) => {
        points.push({
          id: l.id,
          producer_name: l.producer_name,
          producer_phone: l.producer_phone,
          location_name: l.formatted_address || `${l.city}, ${l.state}`,
          latitude: l.latitude,
          longitude: l.longitude,
          quantity_tons: l.quantity_in_tons,
          waste_subcategory: l.waste_subcategory,
          proposed_date: l.expected_ready_date,
          price_per_ton: currentUser?.price_per_ton || 2500,
          status: 'available',
        });
      });

    return points;
  }, [myRequests, listings, currentUser, facilityLat, facilityLng]);

  const computedClusters = React.useMemo(() => {
    return generateWasteClusters(facilityLat, facilityLng, clusterPoints, 30);
  }, [facilityLat, facilityLng, clusterPoints]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleQuickPriceSave = async () => {
    await updateProcessorPrice(Number(newPrice));
    setPriceSaved(true);
    setTimeout(() => {
      setPriceSaved(false);
      setIsEditingPrice(false);
    }, 1500);
  };

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalListing) return;
    setIsSubmittingProposal(true);
    setProposalFeedback('');
    const res = await createPickupProposal(proposalListing.id, Number(proposalPrice), proposalNote);
    setIsSubmittingProposal(false);
    if (res.success) {
      setProposalFeedback('Offer submitted! Opening negotiation channel...');
      setTimeout(() => {
        setProposalListing(null);
        setProposalFeedback('');
        setProposalNote('');
        setActiveTab('requests');
      }, 1000);
    } else {
      setProposalFeedback(res.message);
    }
  };

  // If Processor is NOT verified yet by Admin, show Under Verification Gate
  if (currentUser?.role === 'processor' && !currentUser?.verified) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#FDF6E2] border border-[#EED99E] flex items-center justify-center text-[#855B09]">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FDF6E2] text-[#855B09] border border-[#EED99E]">
              Under Verification
            </span>
            <h1 className="text-2xl font-black text-[#1C1E21]">Facility Verification in Progress</h1>
            <p className="text-sm text-[#575B62] max-w-lg mx-auto">
              Your conversion plant registration and compliance documents have been submitted to the Waste2Carbon Admin team for review.
            </p>
          </div>

          {/* Document Summary Card */}
          <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1C1E21]">
              <FileText className="w-4 h-4 text-[#9A6A15]" />
              <span>Submitted Verification Documents</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]">
                <span className="text-[#828892] block">Facility Name</span>
                <span className="font-semibold text-[#1C1E21]">{currentUser?.full_name}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]">
                <span className="text-[#828892] block">Document Type</span>
                <span className="font-semibold text-[#1C1E21] uppercase">{currentUser?.document_type || 'SPCB Consent to Operate'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]">
                <span className="text-[#828892] block">Registration / License No.</span>
                <span className="font-semibold text-[#1C1E21]">{currentUser?.document_number || 'Under Review'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#E7E1D7]">
                <span className="text-[#828892] block">Status</span>
                <span className="font-bold text-[#855B09]">Pending Admin Approval</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F8F5EE] hover:bg-[#F2ECE0] text-[#1C1E21] text-xs font-bold flex items-center justify-center gap-2 border border-[#E7E1D7] transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#2D5A43]' : ''}`} />
              <span>Check Status</span>
            </button>
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>View & Edit Profile</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-[#828892]">
            For testing: Log in with <code className="text-[#9A6A15] font-bold">admin@gmail.com</code> / <code className="text-[#9A6A15] font-bold">admin123</code> to approve this facility instantly!
          </p>
        </div>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeHandshakeReq) return;

    setHandshakeError('');
    setIsVerifying(true);

    const res = await verifyPickupHandshake(activeHandshakeReq.id, enteredOtp);
    setIsVerifying(false);

    if (!res.success) {
      setHandshakeError(res.message);
    } else {
      setActiveHandshakeReq(null);
      setEnteredOtp('');
      if (res.receipt) {
        setActiveDeliveryReceipt(res.receipt);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clean Warm Forest & Amber Accents */}
      <div className="bg-gradient-to-r from-[#1E4330] via-[#244E39] to-[#2D5A43] rounded-3xl p-6 sm:p-8 shadow-sm text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#E5C378]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E5C378] text-[#1E4330] shadow-2xs">
              {currentUser?.facility_type === 'biochar' ? 'Biochar Pyrolysis Plant' : 'Biogas Digester Plant'}
            </span>
            <span className="text-xs text-[#E1DCD3] font-medium">
              · {currentUser?.city ? `${currentUser.city}, ${currentUser.state}` : currentUser?.formatted_address || 'Registered Facility'}
            </span>
            {currentUser?.verified && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF6F0] text-[#1D5E34] border border-[#BCE1C8] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[#2D5A43]" />
                Verified Facility
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentUser?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-[#D7DFD8] max-w-xl leading-relaxed">
            Accept organic feedstock from nearby farms, negotiate purchase prices, and convert waste into verified carbon credits.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto">
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#F8F5EE] hover:bg-[#F2ECE0] text-[#1E4330] font-bold px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-sm transition cursor-pointer border border-[#D6CEC2] text-xs sm:text-sm"
            >
              <Sparkles className="w-4 h-4 text-[#9A6A15]" />
              <span>Voice AI</span>
            </button>
          )}

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <User className="w-4 h-4 text-[#E5C378]" />
              <span>Profile</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            title="Refresh database"
            className="p-2.5 sm:p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white border border-white/20 transition cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isRefreshing ? 'animate-spin text-[#E5C378]' : ''}`} />
          </button>

          {/* Quick Price Editor in Banner */}
          <div className="w-full sm:w-auto bg-white text-[#1C1E21] rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-left sm:text-right shadow-sm shrink-0 border border-[#E7E1D7] flex items-center justify-between sm:block">
            <div className="flex items-center justify-start sm:justify-end gap-1.5 mb-0.5">
              <span className="text-[10px] text-[#828892] uppercase tracking-widest font-bold">
                Your Buying Offer
              </span>
              {!isEditingPrice && (
                <button
                  onClick={() => {
                    setNewPrice(currentUser?.price_per_ton || 2500);
                    setIsEditingPrice(true);
                  }}
                  className="text-[10px] text-[#2D5A43] hover:underline font-bold cursor-pointer"
                >
                  (Edit)
                </button>
              )}
            </div>

            {isEditingPrice ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-24 px-2 py-1 text-xs border border-[#E7E1D7] rounded-lg font-bold text-[#2D5A43]"
                  autoFocus
                />
                <button
                  onClick={handleQuickPriceSave}
                  className="p-1.5 rounded bg-[#2D5A43] hover:bg-[#1E4330] text-white cursor-pointer"
                  title="Save Price"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingPrice(false)}
                  className="text-[#828892] hover:text-[#1C1E21] text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <span className="text-xl sm:text-2xl font-black text-[#2D5A43] tabular-nums">
                  ₹{currentUser?.price_per_ton ? currentUser.price_per_ton.toLocaleString('en-IN') : '2,500'}
                </span>
                <span className="text-xs text-[#828892]"> / ton</span>
                {priceSaved && <p className="text-[10px] text-[#1D5E34] font-bold">Price Updated!</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operational Workflow States Pipeline */}
      <div className="bg-white border border-[#E7E1D7] rounded-2xl p-4 shadow-2xs overflow-x-auto">
        <div className="flex items-center justify-between gap-2 mb-2 min-w-[320px]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#828892]">
            Circular Lifecycle Tracking Pipeline
          </span>
          <span className="text-[10px] font-bold text-[#2D5A43] bg-[#EDF6F0] px-2 py-0.5 rounded border border-[#BCE1C8]">
            IPCC MRV Audit
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] sm:text-xs min-w-[500px]">
          {[
            { label: 'Available', status: 'done' },
            { label: 'Cluster Forming', status: 'done' },
            { label: 'Pickup Eligible', status: 'active' },
            { label: 'Collection', status: 'pending' },
            { label: 'Received', status: 'pending' },
            { label: 'Converted', status: 'pending' },
            { label: 'Verified', status: 'pending' },
          ].map((step, idx) => (
            <div
              key={step.label}
              className={`py-2 px-1 rounded-xl border font-bold transition flex flex-col items-center justify-center gap-1 ${
                idx === 2
                  ? 'bg-[#FDF6E2] border-[#EED99E] text-[#855B09]'
                  : idx < 2
                  ? 'bg-[#EDF6F0] border-[#BCE1C8] text-[#1D5E34]'
                  : 'bg-[#FAF8F5] border-[#E7E1D7] text-[#828892]'
              }`}
            >
              <span className="text-[9px] opacity-70">0{idx + 1}</span>
              <span className="truncate w-full font-semibold">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards in Clean Warm SaaS Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#575B62]">Incoming Feedstock Requests</span>
          <p className="text-2xl font-black text-[#9A6A15] mt-1 tabular-nums">
            {myRequests.filter((r) => r.status === 'pending').length}{' '}
            <span className="text-xs text-[#828892] font-normal">Pending</span>
          </p>
          <p className="text-[11px] text-[#828892] mt-0.5">In database queue</p>
        </div>

        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#575B62]">Scheduled Pickups</span>
          <p className="text-2xl font-black text-[#1E568A] mt-1 tabular-nums">
            {myRequests.filter((r) => r.status === 'accepted').length}{' '}
            <span className="text-xs text-[#828892] font-normal">In Progress</span>
          </p>
          <p className="text-[11px] text-[#828892] mt-0.5">Awaiting OTP verification</p>
        </div>

        <div className="bg-white border border-[#E7E1D7] rounded-2xl p-5 shadow-2xs">
          <span className="text-xs font-semibold text-[#575B62]">Facility Carbon Credits</span>
          <p className="text-2xl font-black text-[#2D5A43] mt-1 tabular-nums">
            {currentUser?.carbon_credits_balance || 0}{' '}
            <span className="text-xs text-[#828892] font-normal">Credits</span>
          </p>
          <p className="text-[11px] text-[#2D5A43] font-medium mt-0.5">Minted upon delivery</p>
        </div>
      </div>

      {/* Main Tabs: Smart Bulk Clusters vs Individual Queue vs Open Marketplace */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
        <button
          onClick={() => setActiveTab('clusters')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition cursor-pointer shadow-2xs ${
            activeTab === 'clusters'
              ? 'bg-[#2D5A43] text-white shadow-sm'
              : 'bg-white text-[#575B62] border border-[#E7E1D7] hover:bg-[#F8F5EE]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#E5C378]" />
          <span>Smart AI Clusters & Routes ({computedClusters.length})</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#E5C378] text-[#1E4330] font-bold uppercase">
            Bulk
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition cursor-pointer shadow-2xs ${
            activeTab === 'requests'
              ? 'bg-[#2D5A43] text-white shadow-sm'
              : 'bg-white text-[#575B62] border border-[#E7E1D7] hover:bg-[#F8F5EE]'
          }`}
        >
          <Truck className="w-4 h-4 text-[#E5C378]" />
          <span>Direct Requests ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition cursor-pointer shadow-2xs ${
            activeTab === 'marketplace'
              ? 'bg-[#2D5A43] text-white shadow-sm'
              : 'bg-white text-[#575B62] border border-[#E7E1D7] hover:bg-[#F8F5EE]'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#E5C378]" />
          <span>Marketplace Batches ({openMarketplaceListings.length})</span>
        </button>
      </div>

      {/* Tab Content: Clusters View */}
      {activeTab === 'clusters' && (
        <SmartClusterView
          clusters={computedClusters}
          facilityLocation={{
            lat: facilityLat,
            lng: facilityLng,
            name: currentUser?.full_name || 'Your Facility',
          }}
          onScheduleCluster={async (cluster, date) => {
            const reqIds = cluster.points.map((p) => p.id);
            await scheduleClusterPickup(reqIds, cluster.name, date);
          }}
        />
      )}

      {/* Tab Content: Individual Requests Table / Cards */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#1C1E21]">Feedstock Intake & Negotiation Queue</h2>
              <p className="text-xs text-[#575B62]">
                Inspect actual batch photos, negotiate fair purchase prices, and schedule collections
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF8F5] text-[#575B62] border border-[#E7E1D7]">
              {myRequests.filter((r) => r.status === 'pending').length} Active Negotiations
            </span>
          </div>

          {myRequests.length === 0 ? (
            <div className="py-12 text-center text-[#828892] space-y-2">
              <Truck className="w-10 h-10 mx-auto opacity-40 text-[#2D5A43]" />
              <p className="text-sm font-medium text-[#1C1E21]">No incoming waste requests in database yet.</p>
              <p className="text-xs text-[#575B62] max-w-sm mx-auto">
                Check the "Open Marketplace Batches" tab to discover available farmer residue and submit buying offers!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const isCounteredByProducer = req.negotiation_status === 'countered_by_producer';
                const isCounteredByMe = req.negotiation_status === 'countered_by_processor';

                return (
                  <div
                    key={req.id}
                    className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-[#D6CEC2] transition shadow-2xs"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-[#1C1E21]">{req.listing_title}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'collected'
                              ? 'badge-status-verified'
                              : req.status === 'accepted'
                              ? 'badge-status-actual'
                              : 'badge-status-estimated'
                          }`}
                        >
                          {req.status === 'collected'
                            ? 'VERIFIED'
                            : req.status === 'accepted'
                            ? 'ACTUAL'
                            : 'ESTIMATED'}
                        </span>
                      </div>

                      <p className="text-xs text-[#575B62]">
                        Producer: <strong>{req.producer_name}</strong> · Phone: <strong>{req.producer_phone}</strong> · Quantity: <strong>{req.quantity_tons} Tons</strong>
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-[#828892]">
                        <MapPin className="w-3.5 h-3.5 text-[#828892] shrink-0" />
                        <span className="truncate">{req.producer_address}</span>
                      </div>

                      {/* Quality Inspection Photo preview */}
                      {req.listing_photo_url && (
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E7E1D7] w-full max-w-xl">
                          <div className="flex items-center gap-3">
                            <img
                              src={req.listing_photo_url}
                              alt="Quality Inspection"
                              className="w-16 h-14 rounded-lg object-cover border border-[#E7E1D7] shadow-2xs shrink-0 cursor-pointer hover:opacity-90 transition"
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
                              <span className="text-[10px] text-[#828892] font-medium block">Farmer's Quality Photo:</span>
                              <span className="font-bold text-[#1D5E34] bg-[#EDF6F0] px-2 py-0.5 rounded-md border border-[#BCE1C8] text-[11px]">
                                {req.quality_grade || 'Grade B (Standard)'}
                              </span>
                              <p className="text-[10px] text-[#575B62]">Inspected biomass moisture & contaminant assay</p>
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
                            className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE0] border border-[#E7E1D7] text-[11px] font-bold text-[#2D5A43] flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                          >
                            <Cpu className="w-3.5 h-3.5 text-[#E5C378]" />
                            <span>AI Quality Assay</span>
                          </button>
                        </div>
                      )}

                      {/* Price & Negotiation Status Badge */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="bg-white border border-[#E7E1D7] px-3 py-1 rounded-xl text-[#1C1E21] font-medium">
                          Current Price: <strong className="text-[#2D5A43] tabular-nums">₹{req.proposed_price_per_ton.toLocaleString('en-IN')}/ton</strong>
                        </span>

                        {isCounteredByProducer && req.counter_price_per_ton && (
                          <span className="bg-[#FDF6E2] text-[#855B09] border border-[#EED99E] px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#9A6A15]" />
                            Farmer Countered: ₹{req.counter_price_per_ton.toLocaleString('en-IN')}/ton
                          </span>
                        )}

                        {isCounteredByMe && req.counter_price_per_ton && (
                          <span className="bg-[#FAF8F5] text-[#575B62] border border-[#E7E1D7] px-2.5 py-1 rounded-xl font-medium">
                            Your Counter: ₹{req.counter_price_per_ton.toLocaleString('en-IN')}/ton (Awaiting farmer)
                          </span>
                        )}

                        {req.negotiation_status === 'agreed' && (
                          <span className="badge-status-verified px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43]" />
                            Agreed Price Locked
                          </span>
                        )}
                      </div>

                      {/* Producer note */}
                      {req.negotiation_notes && (
                        <p className="text-xs text-[#855B09] italic bg-[#FDF6E2] p-2 rounded-lg border border-[#EED99E]">
                          Latest Note: "{req.negotiation_notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
                      {/* Interactive Negotiation Chat button */}
                      <button
                        onClick={() => setChatReq(req)}
                        className="bg-white hover:bg-[#F8F5EE] text-[#1C1E21] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#E7E1D7] transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-[#9A6A15]" />
                        <span>Chat & Negotiate</span>
                      </button>

                      {/* Direct Accept button if producer countered */}
                      {isCounteredByProducer && req.status === 'pending' && (
                        <button
                          onClick={() => respondToNegotiation(req.id, true)}
                          className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Accept Farmer Price
                        </button>
                      )}

                      {/* Accept & Schedule if ready */}
                      {req.status === 'pending' && !isCounteredByProducer && (
                        <button
                          onClick={() => acceptPickupRequest(req.id)}
                          className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                        >
                          Accept & Schedule Pickup
                        </button>
                      )}

                      {/* Handshake confirmation */}
                      {req.status === 'accepted' && (
                        <button
                          onClick={() => setActiveHandshakeReq(req)}
                          className="bg-[#9A6A15] hover:bg-[#7D540E] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-white" />
                          <span>Verify Pickup Handshake</span>
                        </button>
                      )}

                      {/* Certificate */}
                      {req.status === 'collected' && (
                        <button
                          onClick={() => {
                            const entry = ledger.find((l) => l.request_id === req.id);
                            if (entry) setSelectedCertificate(entry);
                            onOpenCertificate();
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-[#1D5E34] hover:text-[#144224] bg-[#EDF6F0] px-3.5 py-2 rounded-xl border border-[#BCE1C8] transition cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4 text-[#2D5A43]" />
                          <span>View Certificate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Open Marketplace Waste Batches */}
      {activeTab === 'marketplace' && (
        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-black text-[#1C1E21]">Available Feedstock on Open Marketplace</h2>
            <p className="text-xs text-[#575B62]">
              Producers have published these organic waste batches to the open market. Inspect quality photos and submit buying proposals to start negotiations.
            </p>
          </div>

          {openMarketplaceListings.length === 0 ? (
            <div className="py-12 text-center text-[#828892] space-y-2">
              <Sparkles className="w-10 h-10 mx-auto opacity-40 text-[#2D5A43]" />
              <p className="text-sm font-medium text-[#1C1E21]">No unassigned listings currently available.</p>
              <p className="text-xs text-[#575B62] max-w-sm mx-auto">
                When farmers post new listings to the marketplace, they will appear here instantly!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openMarketplaceListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-5 space-y-3 hover:border-[#D6CEC2] transition shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-[#1C1E21]">{listing.title}</h3>
                        <p className="text-xs text-[#575B62]">
                          Farmer: <strong>{listing.producer_name}</strong> · Phone: <strong>{listing.producer_phone}</strong>
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EDF6F0] text-[#1D5E34] border border-[#BCE1C8]">
                        {listing.quantity_in_tons} Tons
                      </span>
                    </div>

                    {/* Photo preview with AI Assay inspection */}
                    {listing.photo_url ? (
                      <div className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-[#E7E1D7]">
                        <div className="flex items-center gap-3">
                          <img
                            src={listing.photo_url}
                            alt="Waste Inspection"
                            className="w-16 h-14 rounded-lg object-cover border border-[#E7E1D7] shadow-2xs shrink-0 cursor-pointer hover:opacity-90 transition"
                            onClick={() => setInspectingListing(listing)}
                          />
                          <div className="text-xs space-y-0.5">
                            <span className="text-[10px] text-[#828892] font-medium block">Quality Inspection Photo:</span>
                            <span className="font-bold text-[#1D5E34] bg-[#EDF6F0] px-2 py-0.5 rounded-md border border-[#BCE1C8] text-[11px]">
                              {listing.quality_grade || 'Grade B (Standard)'}
                            </span>
                            {listing.quality_notes && (
                              <p className="text-[10px] text-[#575B62] italic line-clamp-1">"{listing.quality_notes}"</p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => setInspectingListing(listing)}
                          className="px-3 py-1.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs shrink-0 cursor-pointer"
                        >
                          <Cpu className="w-3.5 h-3.5 text-[#E5C378]" />
                          <span>AI Assay</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-[#FDF6E2] border border-[#EED99E] text-[11px] text-[#855B09] flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-[#9A6A15] shrink-0" />
                        <span>No photo attached · Quality: {listing.quality_grade || 'Grade B (Standard)'}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-[#828892]">
                      <MapPin className="w-3.5 h-3.5 text-[#828892] shrink-0" />
                      <span className="truncate">{listing.formatted_address || `${listing.city}, ${listing.state}`}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[#828892]">
                      <Calendar className="w-3.5 h-3.5 text-[#828892] shrink-0" />
                      <span>Ready by: {listing.expected_ready_date}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E7E1D7] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#828892] block">Baseline Value</span>
                      <span className="font-bold text-[#2D5A43] text-sm tabular-nums">
                        ₹{listing.estimated_value_usd.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setProposalListing(listing);
                        setProposalPrice(currentUser?.price_per_ton || 2500);
                        setProposalNote(`Inspected quality (${listing.quality_grade || 'Standard'}). We offer ₹${currentUser?.price_per_ton || 2500}/ton with farm collection.`);
                      }}
                      className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#E5C378]" />
                      <span>Propose Buying Offer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Handshake OTP Verification Modal */}
      {activeHandshakeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1E21]/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E7E1D7] rounded-3xl shadow-xl p-6 space-y-4">
            <h3 className="text-base font-black text-[#1C1E21] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#9A6A15]" />
              <span>Verify Pickup Handshake</span>
            </h3>
            <p className="text-xs text-[#575B62]">
              Ask <strong>{activeHandshakeReq.producer_name}</strong> for the 6-digit code displayed on their screen to confirm delivery in database.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1E21] mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.trim())}
                  placeholder="e.g. 749210"
                  required
                  className="w-full text-center text-3xl font-mono font-bold tracking-widest bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl py-3 text-[#9A6A15] focus:outline-none focus:bg-white focus:border-[#2D5A43]"
                />
              </div>

              {handshakeError && (
                <p className="text-xs text-[#9E2A2B] bg-[#FBEAE9] p-2.5 rounded-xl border border-[#F5C2C0]">
                  {handshakeError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveHandshakeReq(null)}
                  className="px-4 py-2 text-xs text-[#575B62] hover:text-[#1C1E21] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || enteredOtp.length < 6}
                  className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? 'Verifying...' : 'Confirm Delivery & Mint Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Handshake Automated Delivery Receipt & WhatsApp Dispatch Modal */}
      {activeDeliveryReceipt && (
        <DeliveryReceiptModal
          receipt={activeDeliveryReceipt}
          onClose={() => setActiveDeliveryReceipt(null)}
        />
      )}

      {/* Two-Way Negotiation Chat Modal */}
      {chatReq && (
        <NegotiationChatModal
          isOpen={Boolean(chatReq)}
          onClose={() => setChatReq(null)}
          request={chatReq}
        />
      )}

      {/* Marketplace Proposal Modal */}
      {proposalListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C1E21]/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-[#E7E1D7] rounded-3xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-[#1C1E21] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#9A6A15]" />
                <span>Submit Buying Proposal</span>
              </h3>
              <button
                onClick={() => setProposalListing(null)}
                className="text-[#828892] hover:text-[#1C1E21] p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-3.5 text-xs space-y-1">
              <p className="text-[#575B62]">Batch: <strong className="text-[#1C1E21]">{proposalListing.title}</strong></p>
              <p className="text-[#575B62]">Farmer: <strong className="text-[#1C1E21]">{proposalListing.producer_name}</strong></p>
              <p className="text-[#575B62]">
                Quality: <strong className="text-[#1C1E21]">{proposalListing.quality_grade || 'Grade B (Standard)'}</strong>
              </p>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                  Your Buying Rate Offer (₹ / Ton)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[#9A6A15] font-bold">₹</span>
                  <input
                    type="number"
                    step="50"
                    min="500"
                    max="20000"
                    value={proposalPrice}
                    onChange={(e) => setProposalPrice(Number(e.target.value))}
                    required
                    className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl pl-8 pr-3 py-2 font-bold text-[#1C1E21] focus:outline-none focus:bg-white focus:border-[#2D5A43]"
                  />
                </div>
                <p className="text-[11px] text-[#828892] mt-1">
                  Total estimated for {proposalListing.quantity_in_tons} tons: ₹
                  {Math.round(proposalPrice * proposalListing.quantity_in_tons).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#575B62] mb-1">
                  Quality Note / Initial Message to Farmer
                </label>
                <textarea
                  rows={2}
                  value={proposalNote}
                  onChange={(e) => setProposalNote(e.target.value)}
                  placeholder="e.g. Rate based on inspected photo condition. We will handle trailer logistics."
                  className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white focus:border-[#2D5A43]"
                />
              </div>

              {proposalFeedback && (
                <p className="text-xs font-bold text-[#1D5E34] bg-[#EDF6F0] p-2.5 rounded-xl border border-[#BCE1C8]">
                  {proposalFeedback}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProposalListing(null)}
                  className="px-4 py-2 text-xs text-[#575B62] cursor-pointer hover:text-[#1C1E21]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingProposal ? 'Submitting to Database...' : 'Submit Buying Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Vision Quality Assay Inspection Modal */}
      {inspectingListing && (
        <ComputerVisionModal
          listing={inspectingListing}
          onClose={() => setInspectingListing(null)}
        />
      )}
    </div>
  );
};
