import React, { useState } from 'react';
import {
  Factory,
  Flame,
  Droplets,
  Truck,
  CheckCircle2,
  XCircle,
  Award,
  Scale,
  Calendar,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';
import { HandshakeModal } from './HandshakeModal';

interface ProcessorDashboardProps {
  onOpenCertificate: () => void;
}

export const ProcessorDashboard: React.FC<ProcessorDashboardProps> = ({ onOpenCertificate }) => {
  const {
    currentUser,
    processors,
    pickupRequests,
    acceptPickupRequest,
    rejectPickupRequest,
    ledger,
    setSelectedCertificate,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'requests' | 'active_pickups' | 'ledger'>('requests');
  const [selectedHandshakeReq, setSelectedHandshakeReq] = useState<PickupRequest | null>(null);
  const [isHandshakeModalOpen, setIsHandshakeModalOpen] = useState(false);

  // Match processor facility info
  const currentProcInfo =
    processors.find((p) => p.id === currentUser?.id) || processors[0]; // fallback to first facility

  // Filter requests routed to this processor
  const incomingRequests = pickupRequests.filter(
    (r) => r.processor_id === currentProcInfo.id || currentUser?.role === 'processor'
  );

  const pendingRequests = incomingRequests.filter((r) => r.status === 'pending');
  const acceptedRequests = incomingRequests.filter((r) => r.status === 'accepted');
  const collectedRequests = incomingRequests.filter((r) => r.status === 'collected');

  // Capacity calculation
  const capacityPercent = Math.min(
    100,
    Math.round((currentProcInfo.current_utilization_tons / currentProcInfo.capacity_tons_per_month) * 100)
  );

  const earnedFacilityCredits = currentUser?.carbon_credits_balance || 56.2;

  const handleOpenHandshake = (req: PickupRequest) => {
    setSelectedHandshakeReq(req);
    setIsHandshakeModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                Conversion Facility Hub
              </span>
              <span className="text-xs text-slate-400 capitalize">· {currentProcInfo.facility_type} Conversion Plant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5 flex items-center gap-2">
              <span>{currentProcInfo.name}</span>
                <span title="Verified Facility">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </span>
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Aggregate local organic feedstock clusters, process into biochar/biogas, and issue dual-party MRV carbon credits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-amber-500/40 rounded-xl px-4 py-2.5 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Buying Offer</span>
              <span className="text-xl font-bold text-amber-400">${currentProcInfo.price_per_ton}</span>
              <span className="text-xs text-slate-400"> / ton</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Capacity Utilization */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Monthly Capacity</span>
            <Factory className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white">
              {currentProcInfo.current_utilization_tons} <span className="text-xs font-normal text-slate-400">/ {currentProcInfo.capacity_tons_per_month} t</span>
            </span>
            <span className="text-xs font-bold text-amber-400">{capacityPercent}%</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Pending Pickup Requests</span>
            <Truck className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold text-sky-400 mt-2">
            {pendingRequests.length} <span className="text-sm font-normal text-slate-400">Batches</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {pendingRequests.reduce((acc, curr) => acc + curr.quantity_tons, 0)} tons awaiting approval
          </p>
        </div>

        {/* Scheduled Pickups */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Collections</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            {acceptedRequests.length} <span className="text-sm font-normal text-slate-400">Scheduled</span>
          </p>
          <p className="text-xs text-emerald-400/80 mt-1">Ready for physical OTP handshake</p>
        </div>

        {/* Carbon Credits Minted */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Facility Carbon Credits</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">
            {earnedFacilityCredits.toFixed(1)} <span className="text-sm font-normal text-slate-400">tCO2e</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">IPCC MRV verified credits balance</p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'requests'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Incoming Feedstock Requests</span>
              {pendingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('active_pickups')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'active_pickups'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>Scheduled Collections</span>
              {acceptedRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                  {acceptedRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'ledger'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Converted Feedstock & Credits
            </button>
          </div>
        </div>

        {/* Tab 1: Incoming Pending Requests */}
        {activeTab === 'requests' && (
          <div className="space-y-3">
            {pendingRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Truck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No pending requests awaiting approval right now.</p>
                <p className="text-xs text-slate-500 mt-1">
                  When nearby farms or food businesses list matching waste, their requests will appear here.
                </p>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 hover:border-slate-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base text-white">{req.listing_title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                        Pending Approval
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      From: <strong className="text-white">{req.producer_name}</strong> · {req.producer_address}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>Volume: <strong className="text-white">{req.quantity_tons} Tons</strong></span>
                      <span>Target Date: <strong className="text-amber-300">{req.proposed_pickup_date}</strong></span>
                      <span>Offered Price: <strong className="text-emerald-400">${req.proposed_price_per_ton}/ton</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => rejectPickupRequest(req.id)}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => acceptPickupRequest(req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950 transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept & Dispatch</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Scheduled Collections & Handshake Verification */}
        {activeTab === 'active_pickups' && (
          <div className="space-y-3">
            {acceptedRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No scheduled collections in progress.</p>
              </div>
            ) : (
              acceptedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <h4 className="font-bold text-base text-white">{req.listing_title}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        En Route / Scheduled
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Pickup Site: <strong className="text-white">{req.producer_address}</strong> ({req.producer_name})
                    </p>
                    <p className="text-xs text-slate-400">
                      Contact: {req.producer_phone} · Volume: <strong>{req.quantity_tons} Tons</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenHandshake(req)}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-950 transition shrink-0"
                  >
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Verify Handshake (OTP)</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: History & Converted Batches */}
        {activeTab === 'ledger' && (
          <div className="space-y-3">
            {collectedRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <FileCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No converted batches yet.</p>
              </div>
            ) : (
              collectedRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-white">{req.listing_title}</h4>
                    <p className="text-xs text-slate-400">
                      Verified Weight: {req.actual_weight_tons || req.quantity_tons} Tons · Delivered by {req.producer_name}
                    </p>
                    <p className="text-xs text-emerald-400 font-semibold mt-1">
                      🌱 Sequestered: {req.co2_sequestered_final || (req.quantity_tons * 1.3).toFixed(1)} tCO2e
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const entry = ledger.find((l) => l.user_role === 'processor');
                      if (entry) setSelectedCertificate(entry);
                      onOpenCertificate();
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-lg transition"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Certificate</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Handshake Modal */}
      <HandshakeModal
        request={selectedHandshakeReq}
        isOpen={isHandshakeModalOpen}
        onClose={() => setIsHandshakeModalOpen(false)}
        onOpenCertificate={onOpenCertificate}
      />
    </div>
  );
};
