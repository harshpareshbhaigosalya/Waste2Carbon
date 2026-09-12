import React, { useState } from 'react';
import {
  Plus,
  Scale,
  Award,
  DollarSign,
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AddWasteModal } from './AddWasteModal';

interface ProducerDashboardProps {
  onOpenCertificate: () => void;
}

export const ProducerDashboard: React.FC<ProducerDashboardProps> = ({ onOpenCertificate }) => {
  const { currentUser, listings, pickupRequests, ledger, setSelectedCertificate } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter listings by current user or demo
  const userListings = listings.filter(
    (l) => l.producer_id === currentUser?.id || currentUser?.role === 'producer'
  );

  // Compute stats
  const totalDivertedTons = userListings
    .filter((l) => l.status === 'collected')
    .reduce((acc, curr) => acc + curr.quantity_in_tons, 0);

  const totalPotentialTons = userListings.reduce((acc, curr) => acc + curr.quantity_in_tons, 0);

  const earnedCredits = currentUser?.carbon_credits_balance || 0;

  const estimatedTotalEarnings = userListings.reduce(
    (acc, curr) => acc + (curr.estimated_credit_value || 0),
    0
  );

  // Active accepted pickup that needs handshake
  const activeHandshakeRequest = pickupRequests.find(
    (r) => (r.producer_id === currentUser?.id || currentUser?.role === 'producer') && r.status === 'accepted'
  );

  const filteredListings = userListings.filter((l) => {
    if (statusFilter === 'all') return true;
    return l.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">Available</span>;
      case 'requested':
        return <span className="bg-amber-950/60 text-amber-400 border border-amber-800 px-2.5 py-1 rounded-full text-xs font-semibold">Requested</span>;
      case 'matched':
        return <span className="bg-sky-950/60 text-sky-400 border border-sky-800 px-2.5 py-1 rounded-full text-xs font-semibold">Matched / Scheduled</span>;
      case 'collected':
        return <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> Collected & Converted
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Action Banner */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wide">
                Waste Generator Portal
              </span>
              <span className="text-xs text-slate-400">· {currentUser?.entity_type.replace('_', ' ').toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1.5">
              Welcome, {currentUser?.full_name || 'Partner'}
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Turn your organic and agricultural residues into verified permanent carbon credits and guaranteed revenue streams.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-950 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>List New Waste Batch</span>
          </button>
        </div>
      </div>

      {/* Prominent Physical Handshake Card if Pickup Scheduled */}
      {activeHandshakeRequest && (
        <div className="bg-amber-950/40 border-2 border-amber-500/60 rounded-2xl p-5 shadow-2xl animate-pulse-slow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Scheduled Collection Handshake
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200">
                    Pickup Scheduled
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {activeHandshakeRequest.processor_name} is arriving for pickup!
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Feedstock: <strong>{activeHandshakeRequest.listing_title}</strong> ({activeHandshakeRequest.quantity_tons} tons)
                </p>
                <p className="text-xs text-amber-300/90 mt-1">
                  👉 <strong>Driver will ask for your 6-digit verification code</strong> before loading to certify tonnages.
                </p>
              </div>
            </div>

            {/* Verification Code Box */}
            <div className="bg-slate-900/90 border border-amber-500/50 rounded-xl px-5 py-3 text-center sm:text-right shrink-0 w-full sm:w-auto">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Your Handshake OTP
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 tracking-widest block">
                {activeHandshakeRequest.verification_code}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Share this with driver on arrival
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Diverted from Landfills</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">
            {totalDivertedTons} <span className="text-sm font-normal text-slate-400">Tons</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Total active feedstock: {totalPotentialTons} t
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Certified Carbon Credits</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            {earnedCredits.toFixed(1)} <span className="text-sm font-normal text-slate-400">tCO2e</span>
          </p>
          <p className="text-xs text-emerald-400/80 mt-1">
            1 Credit = 1 Ton verified CO2e
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Expected Value</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">
            ${estimatedTotalEarnings.toFixed(0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Feedstock sale + Carbon incentive
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active Listings</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-sky-400 mt-2">
            {userListings.length} <span className="text-sm font-normal text-slate-400">Batches</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {userListings.filter((l) => l.status === 'available').length} Available for matching
          </p>
        </div>
      </div>

      {/* Listings Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Your Feedstock Listings & Pickup Status</h2>
            <p className="text-xs text-slate-400">Track listings, scheduled collections, and certified credits</p>
          </div>

          <div className="flex items-center gap-2">
            {['all', 'available', 'requested', 'collected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                  statusFilter === st
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredListings.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No waste listings match this filter.</p>
            </div>
          ) : (
            filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 hover:border-slate-600 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-white">{listing.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Ready by: {listing.expected_ready_date}
                    </p>
                  </div>
                  {getStatusBadge(listing.status)}
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg text-xs border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Quantity</span>
                    <span className="font-semibold text-slate-200">
                      {listing.quantity} {listing.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">CO2 Sequestration</span>
                    <span className="font-semibold text-emerald-400">
                      {listing.estimated_co2_sequestered} tCO2e
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Credit Value</span>
                    <span className="font-semibold text-amber-400">
                      ${listing.estimated_credit_value}
                    </span>
                  </div>
                </div>

                {/* Status Specific Information */}
                {listing.assigned_processor_name && (
                  <div className="text-xs text-slate-300 bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400">Matched Processor: </span>
                    <span className="font-semibold text-white">{listing.assigned_processor_name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">OTP Code:</span>
                    <span className="font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-slate-700">
                      {listing.verification_otp}
                    </span>
                  </div>

                  {listing.status === 'collected' ? (
                    <button
                      onClick={() => {
                        const entry = ledger.find((l) => l.user_id === currentUser?.id || l.user_role === 'producer');
                        if (entry) setSelectedCertificate(entry);
                        onOpenCertificate();
                      }}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg transition"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>View Certificate</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Awaiting processor pickup</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddWasteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
