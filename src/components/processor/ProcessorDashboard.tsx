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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PickupRequest, WasteListing } from '../../types';
import { SmartClusterView } from './SmartClusterView';
import { generateWasteClusters, ClusterPoint, WasteCluster } from '../../lib/clusteringOptimizer';
import { Layers } from 'lucide-react';
import { NegotiationChatModal } from '../NegotiationChatModal';

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

  // Quick Price Edit inline state
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(currentUser?.price_per_ton || 2500);
  const [priceSaved, setPriceSaved] = useState(false);

  // Two-Way Negotiation Chat Modal
  const [chatReq, setChatReq] = useState<PickupRequest | null>(null);

  // Marketplace Proposal Modal state
  const [proposalListing, setProposalListing] = useState<WasteListing | null>(null);
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
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
              Under Verification
            </span>
            <h1 className="text-2xl font-black text-slate-900">Facility Verification in Progress</h1>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Your conversion plant registration and compliance documents have been submitted to the W2C Admin team for review.
            </p>
          </div>

          {/* Document Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Submitted Verification Documents</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Facility Name</span>
                <span className="font-semibold text-slate-900">{currentUser?.full_name}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Document Type</span>
                <span className="font-semibold text-slate-900 uppercase">{currentUser?.document_type || 'SPCB Consent to Operate'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Registration / License No.</span>
                <span className="font-semibold text-slate-900">{currentUser?.document_number || 'Under Review'}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Status</span>
                <span className="font-bold text-amber-700">Pending Admin Approval</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 border border-slate-300 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Check Status</span>
            </button>
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow transition"
              >
                <User className="w-4 h-4" />
                <span>View & Edit Profile</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            For testing: Log in with <code className="text-amber-800 font-bold">admin@gmail.com</code> / <code className="text-amber-800 font-bold">admin123</code> to approve this facility instantly!
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Clean Modern Forest & Amber Accents */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-emerald-900 rounded-3xl p-6 sm:p-8 shadow-lg text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
              {currentUser?.facility_type === 'biochar' ? 'Biochar Pyrolysis Plant' : 'Biogas Digester Plant'}
            </span>
            <span className="text-xs text-amber-100 font-medium">
              · {currentUser?.city ? `${currentUser.city}, ${currentUser.state}` : currentUser?.formatted_address || 'Registered Facility'}
            </span>
            {currentUser?.verified && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-200 border border-emerald-400/50 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                Verified Facility
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {currentUser?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl leading-relaxed">
            Accept organic feedstock from nearby farms, negotiate purchase prices, and convert waste into verified carbon credits.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-md transition"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>AgriCarbon AI Voice</span>
            </button>
          )}

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-4 py-3 rounded-2xl bg-black/20 hover:bg-black/30 text-white border border-white/30 text-xs font-bold flex items-center gap-2 transition"
            >
              <User className="w-4 h-4 text-amber-300" />
              <span>Facility Profile</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            title="Refresh database"
            className="p-3 rounded-2xl bg-black/20 hover:bg-black/30 text-amber-200 border border-white/30 transition"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
          </button>

          {/* Quick Price Editor in Banner */}
          <div className="bg-white text-slate-900 rounded-2xl px-5 py-3 text-right shadow-lg shrink-0">
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Your Buying Offer
              </span>
              {!isEditingPrice && (
                <button
                  onClick={() => {
                    setNewPrice(currentUser?.price_per_ton || 2500);
                    setIsEditingPrice(true);
                  }}
                  className="text-[10px] text-emerald-700 hover:underline font-bold"
                >
                  (Edit)
                </button>
              )}
            </div>

            {isEditingPrice ? (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm text-emerald-700 font-bold">₹</span>
                <input
                  type="number"
                  step="50"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-24 bg-slate-50 border-2 border-emerald-600 rounded-lg px-2 py-1 text-sm font-black text-slate-900 text-right focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleQuickPriceSave}
                  className="p-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white"
                  title="Save Price"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingPrice(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-black text-emerald-700">
                  ₹{currentUser?.price_per_ton ? currentUser.price_per_ton.toLocaleString('en-IN') : '2,500'}
                </span>
                <span className="text-xs text-slate-500"> / ton</span>
                {priceSaved && <p className="text-[10px] text-emerald-700 font-bold">Price Updated!</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards in Clean White / Gold Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Incoming Feedstock Requests</span>
          <p className="text-2xl font-black text-amber-700 mt-1">
            {myRequests.filter((r) => r.status === 'pending').length}{' '}
            <span className="text-xs text-slate-500 font-normal">Pending</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">In Supabase queue</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Scheduled Pickups</span>
          <p className="text-2xl font-black text-sky-700 mt-1">
            {myRequests.filter((r) => r.status === 'accepted').length}{' '}
            <span className="text-xs text-slate-500 font-normal">In Progress</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting OTP verification</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-amber-800">Facility Carbon Credits</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {currentUser?.carbon_credits_balance || 0}{' '}
            <span className="text-xs text-slate-500 font-normal">Credits</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Minted upon delivery</p>
        </div>
      </div>

      {/* Main Tabs: Smart Bulk Clusters vs Individual Queue vs Open Marketplace */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setActiveTab('clusters')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer shadow-xs ${
            activeTab === 'clusters'
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-300" />
          <span>Smart AI Clusters & Routes ({computedClusters.length})</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-emerald-950 font-black uppercase">
            Bulk Logistics
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer shadow-xs ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Truck className="w-4 h-4 text-amber-300" />
          <span>Direct Requests & Negotiations ({myRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer shadow-xs ${
            activeTab === 'marketplace'
              ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Open Marketplace Batches ({openMarketplaceListings.length})</span>
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Feedstock Intake & Negotiation Queue</h2>
              <p className="text-xs text-slate-500">
                Inspect actual batch photos, negotiate fair purchase prices, and schedule collections
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {myRequests.filter((r) => r.status === 'pending').length} Active Negotiations
            </span>
          </div>

          {myRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Truck className="w-10 h-10 mx-auto opacity-40 text-amber-600" />
              <p className="text-sm font-medium text-slate-700">No incoming waste requests in database yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                    className="bg-[#fcfbf7] border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-amber-300 transition shadow-sm"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900">{req.listing_title}</h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'collected'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : req.status === 'accepted'
                              ? 'bg-sky-100 text-sky-800 border border-sky-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        Producer: <strong>{req.producer_name}</strong> · Phone: <strong>{req.producer_phone}</strong> · Quantity: <strong>{req.quantity_tons} Tons</strong>
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{req.producer_address}</span>
                      </div>

                      {/* Quality Inspection Photo preview */}
                      {req.listing_photo_url && (
                        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 w-fit">
                          <img
                            src={req.listing_photo_url}
                            alt="Quality Inspection"
                            className="w-16 h-14 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0 cursor-pointer"
                            onClick={() => setChatReq(req)}
                          />
                          <div className="text-xs space-y-0.5">
                            <span className="text-[10px] text-slate-500 font-medium block">Farmer's Quality Photo:</span>
                            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                              {req.quality_grade || 'Grade B (Standard)'}
                            </span>
                            <p className="text-[10px] text-slate-500">Click photo or chat to negotiate based on quality condition.</p>
                          </div>
                        </div>
                      )}

                      {/* Price & Negotiation Status Badge */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-slate-700 font-medium">
                          Current Price: <strong className="text-emerald-700">₹{req.proposed_price_per_ton.toLocaleString('en-IN')}/ton</strong>
                        </span>

                        {isCounteredByProducer && req.counter_price_per_ton && (
                          <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                            <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" />
                            Farmer Countered: ₹{req.counter_price_per_ton.toLocaleString('en-IN')}/ton
                          </span>
                        )}

                        {isCounteredByMe && req.counter_price_per_ton && (
                          <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-xl font-medium">
                            Your Counter: ₹{req.counter_price_per_ton.toLocaleString('en-IN')}/ton (Awaiting farmer)
                          </span>
                        )}

                        {req.negotiation_status === 'agreed' && (
                          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Agreed Price Locked
                          </span>
                        )}
                      </div>

                      {/* Producer note */}
                      {req.negotiation_notes && (
                        <p className="text-xs text-amber-900 italic bg-amber-50 p-2 rounded-lg border border-amber-200">
                          Latest Note: "{req.negotiation_notes}"
                        </p>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 shrink-0">
                      {/* Interactive Negotiation Chat button */}
                      <button
                        onClick={() => setChatReq(req)}
                        className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs px-4 py-2.5 rounded-xl border border-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-amber-800" />
                        <span>💬 Chat & Negotiate</span>
                      </button>

                      {/* Direct Accept button if producer countered */}
                      {isCounteredByProducer && req.status === 'pending' && (
                        <button
                          onClick={() => respondToNegotiation(req.id, true)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" /> Accept Farmer Price
                        </button>
                      )}

                      {/* Accept & Schedule if ready */}
                      {req.status === 'pending' && !isCounteredByProducer && (
                        <button
                          onClick={() => acceptPickupRequest(req.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow transition cursor-pointer"
                        >
                          Accept & Schedule Pickup
                        </button>
                      )}

                      {/* Handshake confirmation */}
                      {req.status === 'accepted' && (
                        <button
                          onClick={() => setActiveHandshakeReq(req)}
                          className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-slate-950" />
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
                          className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-300 transition cursor-pointer"
                        >
                          <FileCheck className="w-4 h-4 text-emerald-700" />
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
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900">Available Feedstock on Open Marketplace</h2>
            <p className="text-xs text-slate-500">
              Producers have published these organic waste batches to the open market. Inspect quality photos and submit buying proposals to start negotiations.
            </p>
          </div>

          {openMarketplaceListings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Sparkles className="w-10 h-10 mx-auto opacity-40 text-amber-600" />
              <p className="text-sm font-medium text-slate-700">No unassigned listings currently available.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When farmers post new listings to the marketplace, they will appear here instantly!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openMarketplaceListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-[#fcfbf7] border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-amber-400 transition shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{listing.title}</h3>
                        <p className="text-xs text-slate-500">
                          Farmer: <strong>{listing.producer_name}</strong> · Phone: <strong>{listing.producer_phone}</strong>
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {listing.quantity_in_tons} Tons
                      </span>
                    </div>

                    {/* Photo preview */}
                    {listing.photo_url ? (
                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                        <img
                          src={listing.photo_url}
                          alt="Waste Inspection"
                          className="w-16 h-14 rounded-lg object-cover border border-slate-200 shadow-2xs shrink-0"
                        />
                        <div className="text-xs space-y-0.5">
                          <span className="text-[10px] text-slate-500 font-medium block">Quality Inspection Photo:</span>
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px]">
                            {listing.quality_grade || 'Grade B (Standard)'}
                          </span>
                          {listing.quality_notes && (
                            <p className="text-[10px] text-slate-600 italic">"{listing.quality_notes}"</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>No photo attached · Quality: {listing.quality_grade || 'Grade B (Standard)'}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{listing.formatted_address || `${listing.city}, ${listing.state}`}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Ready by: {listing.expected_ready_date}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Baseline Value</span>
                      <span className="font-black text-emerald-700 text-sm">
                        ₹{listing.estimated_value_usd.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setProposalListing(listing);
                        setProposalPrice(currentUser?.price_per_ton || 2500);
                        setProposalNote(`Inspected quality (${listing.quality_grade || 'Standard'}). We offer ₹${currentUser?.price_per_ton || 2500}/ton with farm collection.`);
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border-2 border-amber-300 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <span>Verify Pickup Handshake</span>
            </h3>
            <p className="text-xs text-slate-600">
              Ask <strong>{activeHandshakeReq.producer_name}</strong> for the 6-digit code displayed on their screen to confirm delivery in Supabase.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.trim())}
                  placeholder="e.g. 749210"
                  required
                  className="w-full text-center text-3xl font-mono font-black tracking-widest bg-slate-50 border-2 border-amber-400 rounded-2xl py-3 text-amber-800 focus:outline-none focus:bg-white"
                />
              </div>

              {handshakeError && (
                <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {handshakeError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveHandshakeReq(null)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || enteredOtp.length < 6}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
                >
                  {isVerifying ? 'Verifying in Supabase...' : 'Confirm Delivery & Mint Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border-2 border-amber-300 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <span>Submit Buying Proposal</span>
              </h3>
              <button
                onClick={() => setProposalListing(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs space-y-1">
              <p className="text-slate-700">Batch: <strong>{proposalListing.title}</strong></p>
              <p className="text-slate-700">Farmer: <strong>{proposalListing.producer_name}</strong></p>
              <p className="text-slate-700">
                Quality: <strong>{proposalListing.quality_grade || 'Grade B (Standard)'}</strong>
              </p>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Buying Rate Offer (₹ / Ton)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-amber-700 font-bold">₹</span>
                  <input
                    type="number"
                    step="50"
                    min="500"
                    max="20000"
                    value={proposalPrice}
                    onChange={(e) => setProposalPrice(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border-2 border-amber-400 rounded-xl pl-8 pr-3 py-2 font-bold text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Total estimated for {proposalListing.quantity_in_tons} tons: ₹
                  {Math.round(proposalPrice * proposalListing.quantity_in_tons).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Quality Note / Initial Message to Farmer
                </label>
                <textarea
                  rows={2}
                  value={proposalNote}
                  onChange={(e) => setProposalNote(e.target.value)}
                  placeholder="e.g. Rate based on inspected photo condition. We will handle trailer logistics."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:bg-white"
                />
              </div>

              {proposalFeedback && (
                <p className="text-xs font-bold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {proposalFeedback}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProposalListing(null)}
                  className="px-4 py-2 text-xs text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProposal}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingProposal ? 'Submitting to Supabase...' : 'Submit Buying Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
