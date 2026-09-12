import React, { useState } from 'react';
import { Factory, Truck, CheckCircle2, Award, Phone, MapPin, KeyRound, FileCheck, DollarSign, RefreshCw, ShieldAlert, User, Clock, FileText, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';

interface ProcessorDashboardProps {
  onOpenCertificate: () => void;
  onOpenProfile?: () => void;
}

export const ProcessorDashboard: React.FC<ProcessorDashboardProps> = ({ onOpenCertificate, onOpenProfile }) => {
  const {
    currentUser,
    pickupRequests,
    acceptPickupRequest,
    verifyPickupHandshake,
    ledger,
    setSelectedCertificate,
    refreshData,
    updateProcessorPrice,
  } = useApp();

  const [activeHandshakeReq, setActiveHandshakeReq] = useState<PickupRequest | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [handshakeError, setHandshakeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Price Edit inline state
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState(currentUser?.price_per_ton || 2500);
  const [priceSaved, setPriceSaved] = useState(false);

  // Requests for this processor
  const myRequests = pickupRequests.filter((r) => r.processor_id === currentUser?.id);

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

  // If Processor is NOT verified yet by Admin, show Under Verification Gate
  if (currentUser?.role === 'processor' && !currentUser?.verified) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <div className="bg-slate-900 border border-amber-800/60 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950 text-amber-300 border border-amber-800">
              Under Verification
            </span>
            <h1 className="text-2xl font-black text-white">Facility Verification in Progress</h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Your conversion plant registration and compliance documents have been submitted to the W2C Admin team for review.
            </p>
          </div>

          {/* Document Summary Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Submitted Verification Documents</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Facility Name</span>
                <span className="font-semibold text-white">{currentUser?.full_name}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Document Type</span>
                <span className="font-semibold text-white uppercase">{currentUser?.document_type || 'SPCB Consent to Operate'}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Registration / License No.</span>
                <span className="font-semibold text-white">{currentUser?.document_number || 'Under Review'}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-500 block">Status</span>
                <span className="font-bold text-amber-400">Pending Admin Approval</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Check Verification Status</span>
            </button>
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition"
              >
                <User className="w-4 h-4" />
                <span>View & Edit Profile</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            For testing: Log in with <code className="text-amber-300">admin@gmail.com</code> / <code className="text-amber-300">admin123</code> to approve this facility instantly!
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
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase">
              {currentUser?.facility_type === 'biochar' ? 'Biochar Pyrolysis Plant' : 'Biogas Digester Plant'}
            </span>
            <span className="text-xs text-slate-400">
              · {currentUser?.city ? `${currentUser.city}, ${currentUser.state}` : currentUser?.formatted_address || 'Registered Facility'}
            </span>
            {currentUser?.verified && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified Facility
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {currentUser?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Accept organic feedstock from nearby generators and convert it into verified carbon credits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Facility Profile</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            title="Refresh database"
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          {/* Quick Price Editor in Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-right shrink-0">
            <div className="flex items-center justify-end gap-1.5 mb-0.5">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                Your Buying Offer
              </span>
              {!isEditingPrice && (
                <button
                  onClick={() => {
                    setNewPrice(currentUser?.price_per_ton || 2500);
                    setIsEditingPrice(true);
                  }}
                  className="text-[10px] text-amber-400 hover:underline font-bold"
                >
                  (Edit)
                </button>
              )}
            </div>

            {isEditingPrice ? (
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm text-amber-400 font-bold">₹</span>
                <input
                  type="number"
                  step="50"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-amber-500 rounded-lg px-2 py-1 text-sm font-black text-amber-300 text-right focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleQuickPriceSave}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                  title="Save Price"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingPrice(false)}
                  className="text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div>
                <span className="text-2xl font-black text-amber-400">
                  ₹{currentUser?.price_per_ton ? currentUser.price_per_ton.toLocaleString('en-IN') : '2,500'}
                </span>
                <span className="text-xs text-slate-400"> / ton</span>
                {priceSaved && <p className="text-[10px] text-emerald-400 font-bold">Price Updated!</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-xs text-slate-400">Incoming Feedstock Requests</span>
          <p className="text-2xl font-black text-amber-400 mt-1">
            {myRequests.filter((r) => r.status === 'pending').length}{' '}
            <span className="text-xs text-slate-400 font-normal">Pending</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">In Supabase queue</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-xs text-slate-400">Scheduled Pickups</span>
          <p className="text-2xl font-black text-sky-400 mt-1">
            {myRequests.filter((r) => r.status === 'accepted').length}{' '}
            <span className="text-xs text-slate-400 font-normal">In Progress</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting OTP verification</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
          <span className="text-xs text-slate-400">Facility Carbon Credits</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {currentUser?.carbon_credits_balance || 0}{' '}
            <span className="text-xs text-slate-400 font-normal">Credits</span>
          </p>
          <p className="text-[11px] text-emerald-500 mt-0.5">Minted upon delivery</p>
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white">Feedstock Pickup & Intake Queue</h2>

        {myRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Truck className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">No incoming waste requests in database yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When a nearby farmer lists waste and selects your facility, their request will appear here in real time!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-white">{req.listing_title}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        req.status === 'collected'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : req.status === 'accepted'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Producer: <strong className="text-white">{req.producer_name}</strong> ·{' '}
                    <span className="text-slate-400">📍 {req.producer_address}</span>
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>Volume: <strong className="text-white">{req.quantity_tons} Tons</strong></span>
                    <span>Date: <strong className="text-amber-300">{req.proposed_pickup_date}</strong></span>
                    <span>📞 {req.producer_phone}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'pending' && (
                    <button
                      onClick={() => acceptPickupRequest(req.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept Pickup</span>
                    </button>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      onClick={() => {
                        setActiveHandshakeReq(req);
                        setEnteredOtp('');
                        setHandshakeError('');
                      }}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-950 transition flex items-center gap-1.5"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Enter 6-Digit Pickup Code (OTP)</span>
                    </button>
                  )}

                  {req.status === 'collected' && (
                    <button
                      onClick={() => {
                        const entry = ledger.find((l) => l.request_id === req.id);
                        if (entry) setSelectedCertificate(entry);
                        onOpenCertificate();
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-800 transition"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>View Certificate</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handshake OTP Verification Modal */}
      {activeHandshakeReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <span>Verify Pickup Handshake</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ask <strong>{activeHandshakeReq.producer_name}</strong> for the 6-digit code displayed on their screen to confirm delivery in Supabase.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.trim())}
                  placeholder="e.g. 749210"
                  required
                  className="w-full text-center text-3xl font-mono font-black tracking-widest bg-slate-950 border-2 border-slate-700 rounded-2xl py-3 text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>

              {handshakeError && (
                <p className="text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded-xl border border-rose-800">
                  {handshakeError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveHandshakeReq(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || enteredOtp.length < 6}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition disabled:opacity-50"
                >
                  {isVerifying ? 'Verifying in Supabase...' : 'Confirm Delivery & Mint Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
