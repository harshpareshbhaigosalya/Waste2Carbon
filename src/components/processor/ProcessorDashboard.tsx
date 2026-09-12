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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';
import { SmartClusterView } from './SmartClusterView';
import { generateWasteClusters, ClusterPoint, WasteCluster } from '../../lib/clusteringOptimizer';
import { Layers } from 'lucide-react';

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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'clusters'>('clusters');
  const [activeHandshakeReq, setActiveHandshakeReq] = useState<PickupRequest | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [handshakeError, setHandshakeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Price Edit inline state
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(currentUser?.price_per_ton || 2500);
  const [priceSaved, setPriceSaved] = useState(false);

  // Negotiation Modal
  const [counterReq, setCounterReq] = useState<PickupRequest | null>(null);
  const [procCounterPrice, setProcCounterPrice] = useState<number>(2400);
  const [procNote, setProcNote] = useState('');

  // Requests for this processor
  const myRequests = pickupRequests.filter((r) => r.processor_id === currentUser?.id);

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

  const handleSendCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterReq) return;
    await negotiatePrice(counterReq.id, Number(procCounterPrice), procNote);
    setCounterReq(null);
    setProcNote('');
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

      {/* Main Tabs: Smart Bulk Clusters vs Individual Queue */}
      <div className="flex items-center gap-3">
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
          <span>Individual Requests & Negotiations ({myRequests.length})</span>
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
          <h2 className="text-base font-black text-slate-900">Feedstock Intake & Negotiation Queue</h2>

          {myRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Truck className="w-10 h-10 mx-auto opacity-40 text-amber-600" />
              <p className="text-sm font-medium text-slate-700">No incoming waste requests in database yet.</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When a nearby farmer lists waste and selects your facility, their request will appear here in real time!
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
                      Producer: <strong>{req.producer_name}</strong> · Phone: <strong>{req.producer_phone}</strong>
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{req.producer_address}</span>
                    </div>

                    {/* Price & Negotiation Status Badge */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-slate-700 font-medium">
                        Current Price: <strong className="text-emerald-700">₹{req.proposed_price_per_ton.toLocaleString('en-IN')}/ton</strong>
                      </span>

                      {isCounteredByProducer && req.counter_price_per_ton && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                          <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" />
                          Producer countered asking: ₹{req.counter_price_per_ton.toLocaleString('en-IN')}/ton
                        </span>
                      )}

                      {isCounteredByMe && req.counter_price_per_ton && (
                        <span className="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-xl font-medium">
                          Your Counter: ₹{req.counter_price_per_ton.toLocaleString('en-IN')}/ton (Pending farmer reply)
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
                        Farmer Note: "{req.negotiation_notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                    {/* If producer sent counter, give accept / counter options */}
                    {isCounteredByProducer && req.status === 'pending' && (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => respondToNegotiation(req.id, true)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> Accept Farmer Price
                        </button>
                        <button
                          onClick={() => {
                            setCounterReq(req);
                            setProcCounterPrice(req.proposed_price_per_ton);
                          }}
                          className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs px-3 py-2.5 rounded-xl border border-amber-300 transition"
                        >
                          Counter Back
                        </button>
                      </div>
                    )}

                    {req.status === 'pending' && !isCounteredByProducer && (
                      <>
                        <button
                          onClick={() => acceptPickupRequest(req.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow transition"
                        >
                          Accept & Schedule Pickup
                        </button>
                        <button
                          onClick={() => {
                            setCounterReq(req);
                            setProcCounterPrice(req.proposed_price_per_ton - 100);
                          }}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs px-3 py-2.5 rounded-xl border border-amber-300 transition flex items-center gap-1"
                        >
                          <ArrowUpDown className="w-3.5 h-3.5" />
                          <span>Negotiate Price</span>
                        </button>
                      </>
                    )}

                    {req.status === 'accepted' && (
                      <button
                        onClick={() => setActiveHandshakeReq(req)}
                        className="bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-1.5"
                      >
                        <KeyRound className="w-4 h-4 text-slate-950" />
                        <span>Verify Pickup Handshake</span>
                      </button>
                    )}

                    {req.status === 'collected' && (
                      <button
                        onClick={() => {
                          const entry = ledger.find((l) => l.request_id === req.id);
                          if (entry) setSelectedCertificate(entry);
                          onOpenCertificate();
                        }}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-300 transition"
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
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || enteredOtp.length < 6}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying in Supabase...' : 'Confirm Delivery & Mint Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Processor Counter Offer Modal */}
      {counterReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border-2 border-amber-300 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-amber-600" />
              <span>Counter Offer to Producer</span>
            </h3>

            <p className="text-xs text-slate-600">
              Propose a revised buying rate for <strong>{counterReq.listing_title}</strong> to {counterReq.producer_name}.
            </p>

            <form onSubmit={handleSendCounter} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Counter Offer (₹ / Ton)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-amber-700 font-bold">₹</span>
                  <input
                    type="number"
                    step="50"
                    value={procCounterPrice}
                    onChange={(e) => setProcCounterPrice(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border-2 border-amber-400 rounded-xl pl-8 pr-3 py-2 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Note to Farmer</label>
                <input
                  type="text"
                  value={procNote}
                  onChange={(e) => setProcNote(e.target.value)}
                  placeholder="e.g. Includes transport costs and moisture allowance"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCounterReq(null)}
                  className="px-4 py-2 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl"
                >
                  Send Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
