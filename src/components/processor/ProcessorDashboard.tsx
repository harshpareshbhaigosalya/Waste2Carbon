import React, { useState } from 'react';
import { Factory, Truck, CheckCircle2, Award, Phone, MapPin, KeyRound, FileCheck, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';

interface ProcessorDashboardProps {
  onOpenCertificate: () => void;
}

export const ProcessorDashboard: React.FC<ProcessorDashboardProps> = ({ onOpenCertificate }) => {
  const {
    currentUser,
    pickupRequests,
    acceptPickupRequest,
    verifyPickupHandshake,
    ledger,
    setSelectedCertificate,
  } = useApp();

  const [activeHandshakeReq, setActiveHandshakeReq] = useState<PickupRequest | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [handshakeError, setHandshakeError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Requests for this processor
  const myRequests = pickupRequests.filter((r) => r.processor_id === currentUser?.id);

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
            <span className="text-xs text-slate-400">· {currentUser?.address}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            {currentUser?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Accept organic feedstock from nearby generators and convert it into carbon credits.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-right shrink-0">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-medium">
            Your Buying Price
          </span>
          <span className="text-2xl font-black text-amber-400">${currentUser?.price_per_ton || 45}</span>
          <span className="text-xs text-slate-400"> / ton</span>
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
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting your approval</p>
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
            <p className="text-sm">No incoming waste requests yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When a nearby farmer or waste producer creates a listing and chooses your facility, their pickup request will appear right here!
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
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-950 transition flex items-center gap-1.5 animate-pulse-slow"
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
              Ask <strong>{activeHandshakeReq.producer_name}</strong> for the 6-digit code displayed on their screen to confirm pickup.
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
                  {isVerifying ? 'Verifying...' : 'Confirm Delivery & Mint Credits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
