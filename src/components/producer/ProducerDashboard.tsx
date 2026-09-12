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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AddWasteModal } from './AddWasteModal';
import { PickupRequest } from '../../types';

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

  // Negotiation modal / state
  const [negotiatingReq, setNegotiatingReq] = useState<PickupRequest | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState<number>(2800);
  const [negotiationNote, setNegotiationNote] = useState('');
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationFeedback, setNegotiationFeedback] = useState('');

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

  const handleSendCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!negotiatingReq) return;

    setIsNegotiating(true);
    setNegotiationFeedback('');

    const res = await negotiatePrice(negotiatingReq.id, Number(counterPriceInput), negotiationNote);
    setIsNegotiating(false);

    if (res.success) {
      setNegotiationFeedback(res.message);
      setTimeout(() => {
        setNegotiatingReq(null);
        setNegotiationFeedback('');
        setNegotiationNote('');
      }, 1500);
    } else {
      setNegotiationFeedback(res.message);
    }
  };

  const handleRespondToCounter = async (reqId: string, accept: boolean) => {
    await respondToNegotiation(reqId, accept);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with White - Gold - Emerald Styling */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-amber-700 rounded-3xl p-6 sm:p-8 shadow-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-emerald-950 shadow-sm">
              Waste Producer Portal
            </span>
            <span className="text-xs text-emerald-100 font-medium">
              · {currentUser?.city ? `${currentUser.city}, ${currentUser.state}` : currentUser?.formatted_address || 'Registered Location'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {currentUser?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl">
            List agricultural residue, negotiate high prices with verified processing plants, and get certified carbon credits.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5 shrink-0">
          {onOpenVoiceAssistant && (
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-emerald-950 font-black px-4 py-3 rounded-2xl shadow-lg transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-950" />
              <span>AgriCarbon AI Voice</span>
            </button>
          )}

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-4 py-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 text-white border border-emerald-600/40 text-xs font-bold transition"
            >
              Producer Profile
            </button>
          )}

          <button
            onClick={handleRefresh}
            title="Refresh database"
            className="p-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/40 transition"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center justify-center gap-2 bg-white text-emerald-800 hover:bg-emerald-50 font-black px-5 py-3.5 rounded-2xl shadow-lg transition"
          >
            <Plus className="w-5 h-5 text-emerald-800" />
            <span>+ List Waste Batch</span>
          </button>
        </div>
      </div>

      {/* Prominent Physical Handshake Code Card */}
      {activePickup && (
        <div className="bg-gradient-to-r from-amber-50 to-emerald-50 border-2 border-amber-400 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                  Pickup Scheduled & En Route!
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                {activePickup.processor_name} is arriving for collection
              </h3>
              <p className="text-xs text-slate-700">
                Feedstock: <strong>{activePickup.listing_title}</strong> ({activePickup.quantity_tons} Tons) · Agreed Rate:{' '}
                <strong className="text-emerald-800 font-black">
                  ₹{activePickup.proposed_price_per_ton.toLocaleString('en-IN')}/ton
                </strong>
              </p>
              <p className="text-xs text-amber-900">
                👉 <strong>Show the 6-digit code below to the driver</strong> upon arrival to verify delivery and release your carbon credits:
              </p>
            </div>

            <div className="bg-white border-2 border-amber-400 rounded-2xl px-6 py-3.5 text-center shadow-md shrink-0">
              <span className="text-[10px] text-amber-800 uppercase tracking-widest block font-bold">
                Pickup Handshake OTP
              </span>
              <span className="text-3xl sm:text-4xl font-mono font-black text-amber-600 tracking-widest block mt-0.5">
                {activePickup.verification_code}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards in Clean White / Gold Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <span className="text-xs font-semibold text-slate-500">Total Waste Diverted</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {totalDivertedTons} <span className="text-xs text-slate-500 font-normal">Tons</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Diverted from landfills</p>
        </div>

        <div className="bg-white border border-amber-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <span className="text-xs font-semibold text-amber-800">Carbon Credits Balance</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            {currentUser?.carbon_credits_balance || 0} <span className="text-xs text-slate-500 font-normal">Credits</span>
          </p>
          <p className="text-[11px] text-amber-700 font-medium mt-0.5">1 Credit = 1 Ton verified CO2e</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
          <span className="text-xs font-semibold text-slate-500">Active Listings</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {myListings.length} <span className="text-xs text-slate-500 font-normal">Batches</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Saved in Supabase</p>
        </div>
      </div>

      {/* Active Price Negotiations & Facility Offers */}
      {myRequests.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Price Negotiation & Facility Bids</h2>
                <p className="text-xs text-slate-500">Negotiate for a higher selling price per ton directly with processors</p>
              </div>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
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
                  className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3 relative hover:border-amber-400 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{req.listing_title}</h4>
                      <p className="text-xs text-slate-600">Buyer Facility: <strong>{req.processor_name}</strong></p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.negotiation_status === 'agreed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : req.negotiation_status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : req.negotiation_status?.startsWith('countered')
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-200 text-slate-700'
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

                  {/* Price comparison card */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Offered Price</span>
                      <span className="font-bold text-slate-700">
                        ₹{req.proposed_price_per_ton.toLocaleString('en-IN')}/ton
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Est. Payout</span>
                      <span className="font-black text-emerald-700">
                        ₹{Math.round(req.proposed_price_per_ton * req.quantity_tons).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* If processor countered */}
                  {isCounteredByProc && req.counter_price_per_ton && (
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs space-y-2">
                      <p className="text-amber-900 font-bold">
                        Processor proposed counter: ₹{req.counter_price_per_ton.toLocaleString('en-IN')} / ton
                      </p>
                      {req.negotiation_notes && (
                        <p className="text-slate-600 text-[11px] italic">"{req.negotiation_notes}"</p>
                      )}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleRespondToCounter(req.id, true)}
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 rounded-lg flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Price
                        </button>
                        <button
                          onClick={() => handleRespondToCounter(req.id, false)}
                          className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 rounded-lg text-xs"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If I countered */}
                  {isCounteredByMe && req.counter_price_per_ton && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-900">
                      You asked for <strong>₹{req.counter_price_per_ton.toLocaleString('en-IN')} / ton</strong>. Awaiting facility response.
                    </div>
                  )}

                  {/* Negotiation trigger button if status is none or open */}
                  {req.status === 'pending' && req.negotiation_status !== 'agreed' && (
                    <button
                      onClick={() => {
                        setNegotiatingReq(req);
                        setCounterPriceInput((req.counter_price_per_ton || req.proposed_price_per_ton) + 300);
                      }}
                      className="w-full py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" />
                      <span>Negotiate Higher Price (Counter Offer)</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Listings Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-black text-slate-900">Your Listed Waste Batches</h2>

        {myListings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-3">
            <Scale className="w-10 h-10 mx-auto opacity-40 text-emerald-700" />
            <p className="text-sm font-medium text-slate-600">You have not listed any waste batches yet.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 shadow transition"
            >
              + Create First Waste Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-[#fcfbf7] border border-slate-200 rounded-2xl p-5 space-y-3 hover:border-emerald-300 transition shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{listing.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Ready: {listing.expected_ready_date}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      listing.status === 'collected'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : listing.status === 'accepted'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {listing.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Carbon Sequestration</span>
                    <span className="font-bold text-emerald-700">
                      {listing.estimated_co2_sequestered} Tons CO2e
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Pickup Code</span>
                    <span className="font-mono font-bold text-amber-700">
                      {listing.verification_otp}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{listing.formatted_address || `${listing.city}, ${listing.state}`}</span>
                </div>

                {listing.assigned_processor_name && (
                  <p className="text-xs text-slate-600">
                    Assigned Buyer: <strong className="text-slate-900">{listing.assigned_processor_name}</strong>
                  </p>
                )}

                {listing.status === 'collected' && (
                  <div className="pt-2 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => {
                        const entry = ledger.find((l) => l.user_id === currentUser?.id);
                        if (entry) setSelectedCertificate(entry);
                        onOpenCertificate();
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-300 transition"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>View Carbon Certificate</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Negotiation Counter-Offer Modal */}
      {negotiatingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border-2 border-amber-300 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-amber-600" />
                <span>Negotiate Selling Price</span>
              </h3>
              <button
                onClick={() => setNegotiatingReq(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 text-xs space-y-1">
              <p className="text-slate-700 font-medium">Batch: <strong>{negotiatingReq.listing_title}</strong></p>
              <p className="text-slate-700">Buyer Plant: <strong>{negotiatingReq.processor_name}</strong></p>
              <p className="text-slate-700">
                Current Plant Offer: <strong>₹{negotiatingReq.proposed_price_per_ton.toLocaleString('en-IN')}/ton</strong>
              </p>
            </div>

            <form onSubmit={handleSendCounterOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Asking Price (₹ / Ton)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-amber-700 font-bold text-base">₹</span>
                  <input
                    type="number"
                    step="50"
                    min="500"
                    max="20000"
                    value={counterPriceInput}
                    onChange={(e) => setCounterPriceInput(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border-2 border-amber-400 rounded-2xl pl-8 pr-4 py-2.5 text-lg font-black text-slate-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Total for {negotiatingReq.quantity_tons} tons: ₹
                  {Math.round(counterPriceInput * negotiatingReq.quantity_tons).toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Note to Facility Operator (Optional)
                </label>
                <input
                  type="text"
                  value={negotiationNote}
                  onChange={(e) => setNegotiationNote(e.target.value)}
                  placeholder="e.g. High dry matter quality, baled & ready for quick loading"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {negotiationFeedback && (
                <p className="text-xs font-semibold text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {negotiationFeedback}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNegotiatingReq(null)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isNegotiating}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isNegotiating ? 'Submitting to Supabase...' : 'Submit Counter Offer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AddWasteModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
};
