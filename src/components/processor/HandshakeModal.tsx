import React, { useState } from 'react';
import { X, CheckCircle2, ShieldAlert, Award, Scale, KeyRound, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PickupRequest } from '../../types';

interface HandshakeModalProps {
  request: PickupRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenCertificate: () => void;
}

export const HandshakeModal: React.FC<HandshakeModalProps> = ({
  request,
  isOpen,
  onClose,
  onOpenCertificate,
}) => {
  const { completeHandshake } = useApp();
  const [enteredOtp, setEnteredOtp] = useState('');
  const [verifiedWeight, setVerifiedWeight] = useState<number>(request?.quantity_tons || 10);
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ credits: number; weight: number } | null>(null);

  // Sync weight when request changes
  React.useEffect(() => {
    if (request) {
      setVerifiedWeight(request.quantity_tons);
      setEnteredOtp('');
      setErrorMsg('');
      setSuccessInfo(null);
    }
  }, [request]);

  if (!isOpen || !request) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsVerifying(true);

    const res = await completeHandshake(request.id, enteredOtp, verifiedWeight);
    setIsVerifying(false);

    if (!res.success) {
      setErrorMsg(res.message);
    } else {
      setSuccessInfo({ credits: res.credits || 0, weight: verifiedWeight });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Collection Handshake Verification</h2>
              <p className="text-xs text-slate-400">Validate physical feedstock intake & mint carbon credits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {successInfo ? (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                <Award className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Handshake Verified!</h3>
              <p className="text-sm text-slate-300 max-w-sm mx-auto">
                Successfully recorded intake of <strong className="text-white">{successInfo.weight} Tons</strong>.
                Minted <strong className="text-emerald-400">{successInfo.credits} Certified Carbon Credits</strong> to both the generator and facility ledger.
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCertificate();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition"
                >
                  View Issued Carbon Certificate
                </button>
                <button
                  onClick={onClose}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              {/* Pickup Summary Card */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Waste Generator:</span>
                  <span className="font-semibold text-white">{request.producer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Feedstock Type:</span>
                  <span className="font-semibold text-emerald-400 capitalize">
                    {request.waste_subcategory.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="text-slate-300">{request.producer_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Offered Price:</span>
                  <span className="font-bold text-amber-400">${request.proposed_price_per_ton}/ton</span>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generator's 6-Digit Handshake OTP</span>
                </label>
                <p className="text-[11px] text-slate-400">
                  Ask the farmer or generator for the 6-digit code shown on their screen.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.trim())}
                  placeholder="e.g. 749210"
                  required
                  className="w-full text-center tracking-widest text-2xl font-mono font-extrabold bg-slate-950 border-2 border-slate-700 rounded-xl py-3 text-amber-400 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              {/* Scale Weight Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actual Weighed Gross Volume (Metric Tons)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={verifiedWeight}
                  onChange={(e) => setVerifiedWeight(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Error Banner */}
              {errorMsg && (
                <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isVerifying || enteredOtp.length < 6}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isVerifying ? 'Verifying...' : 'Verify Handshake & Mint Credits'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
