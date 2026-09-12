import React, { useState } from 'react';
import { Plus, Award, Scale, Clock, CheckCircle2, Truck, Calendar, MapPin, FileCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AddWasteModal } from './AddWasteModal';

interface ProducerDashboardProps {
  onOpenCertificate: () => void;
  onOpenProfile?: () => void;
}

export const ProducerDashboard: React.FC<ProducerDashboardProps> = ({ onOpenCertificate, onOpenProfile }) => {
  const { currentUser, listings, pickupRequests, ledger, setSelectedCertificate, refreshData } = useApp();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Listings for this producer
  const myListings = listings.filter((l) => l.producer_id === currentUser?.id);

  // Active accepted request awaiting pickup
  const activePickup = pickupRequests.find(
    (r) => r.producer_id === currentUser?.id && r.status === 'accepted'
  );

  const totalDivertedTons = myListings
    .filter((l) => l.status === 'collected')
    .reduce((acc, curr) => acc + curr.quantity_in_tons, 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
              Waste Producer Portal
            </span>
            <span className="text-xs text-slate-400">
              · {currentUser?.city ? `${currentUser.city}, ${currentUser.state}` : currentUser?.formatted_address || 'Registered Location'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {currentUser?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            List your agricultural and organic waste, connect with nearby processing plants, and get certified carbon credits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition"
            >
              Producer Profile
            </button>
          )}
          <button
            onClick={handleRefresh}
            title="Refresh database"
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-emerald-950 transition"
          >
            <Plus className="w-5 h-5" />
            <span>+ List Waste Batch</span>
          </button>
        </div>
      </div>

      {/* Prominent Physical Handshake Code Card */}
      {activePickup && (
        <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-2xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Pickup Scheduled & En Route!
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {activePickup.processor_name} is arriving for collection
              </h3>
              <p className="text-xs text-slate-300">
                Feedstock: <strong>{activePickup.listing_title}</strong> ({activePickup.quantity_tons} Tons)
              </p>
              <p className="text-xs text-amber-300">
                👉 <strong>Show the 6-digit code below to the driver</strong> upon arrival to verify delivery and release your carbon credits:
              </p>
            </div>

            <div className="bg-slate-950 border-2 border-amber-500/80 rounded-2xl px-6 py-3.5 text-center shrink-0">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
                Pickup Handshake OTP
              </span>
              <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-widest block mt-0.5">
                {activePickup.verification_code}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-xs text-slate-400">Total Waste Diverted</span>
          <p className="text-2xl font-black text-white mt-1">
            {totalDivertedTons} <span className="text-xs text-slate-400 font-normal">Tons</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Diverted from landfills</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-xs text-slate-400">Carbon Credits Balance</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {currentUser?.carbon_credits_balance || 0} <span className="text-xs text-slate-400 font-normal">Credits</span>
          </p>
          <p className="text-[11px] text-emerald-500 mt-0.5">1 Credit = 1 Ton verified CO2e</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-xs text-slate-400">Active Listings</span>
          <p className="text-2xl font-black text-sky-400 mt-1">
            {myListings.length} <span className="text-xs text-slate-400 font-normal">Batches</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Saved in Supabase</p>
        </div>
      </div>

      {/* Listings Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Your Listed Waste Batches</h2>

        {myListings.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <Scale className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">You have not listed any waste batches yet.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 text-xs font-bold hover:bg-emerald-600 hover:text-white transition"
            >
              + Create First Waste Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-white">{listing.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Ready: {listing.expected_ready_date}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      listing.status === 'collected'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : listing.status === 'accepted'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Carbon Sequestration</span>
                    <span className="font-bold text-emerald-400">
                      {listing.estimated_co2_sequestered} Tons CO2e
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Pickup Code</span>
                    <span className="font-mono font-bold text-amber-400">
                      {listing.verification_otp}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{listing.formatted_address || `${listing.city}, ${listing.state}`}</span>
                </div>

                {listing.assigned_processor_name && (
                  <p className="text-xs text-slate-400">
                    Buyer: <strong className="text-white">{listing.assigned_processor_name}</strong>
                  </p>
                )}

                {listing.status === 'collected' && (
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => {
                        const entry = ledger.find((l) => l.user_id === currentUser?.id);
                        if (entry) setSelectedCertificate(entry);
                        onOpenCertificate();
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800 transition"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>View Carbon Certificate</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AddWasteModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
};
