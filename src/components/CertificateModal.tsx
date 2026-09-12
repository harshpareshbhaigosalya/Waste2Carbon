import React from 'react';
import { X, Award, ShieldCheck, Download, Printer, CheckCircle, Leaf, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CarbonLedgerEntry } from '../types';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateData?: CarbonLedgerEntry | null;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  certificateData,
}) => {
  const { currentUser, selectedCertificate } = useApp();

  if (!isOpen) return null;

  const data = certificateData || selectedCertificate || {
    id: 'sample-cert',
    user_id: currentUser?.id || 'demo-1',
    user_name: currentUser?.full_name || 'GreenField Agro Farms',
    user_role: currentUser?.role || 'producer',
    request_id: 'req-201',
    amount_credits: currentUser?.carbon_credits_balance || 14.5,
    waste_type: 'Dry Crop Residue / Stubble (12.5 Tons)',
    tons_diverted: 12.5,
    action_type: 'certified' as const,
    certificate_code: 'W2C-CERT-2026-08914',
    issuer: 'W2C Verified Sequestration Registry (IPCC MRV)',
    created_at: new Date().toISOString(),
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-emerald-950/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-4 border-amber-300 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Actions bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-amber-200 bg-amber-50/70 print:hidden">
          <span className="text-xs text-amber-900 font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            Official Environmental Attribute Certificate
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-xs font-semibold text-white transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-8 sm:p-12 relative overflow-hidden bg-gradient-to-b from-[#fdfbf7] via-white to-[#fcfaf2]">
          {/* Certificate Borders & Corner Accents */}
          <div className="absolute inset-3 sm:inset-5 border-2 border-amber-300/80 rounded-2xl pointer-events-none" />
          <div className="absolute inset-4 sm:inset-6 border border-emerald-700/20 rounded-xl pointer-events-none" />

          {/* Watermark Leaf Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Leaf className="w-96 h-96 text-emerald-700" />
          </div>

          <div className="relative z-10 space-y-6 text-center">
            {/* Seal & Badge */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-400/20 text-slate-950 font-bold">
                  <Award className="w-9 h-9 text-slate-950" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-emerald-700 text-white rounded-full p-1 border-2 border-white shadow">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Title Header */}
            <div>
              <span className="text-[10px] tracking-widest uppercase font-extrabold text-amber-700 block mb-1">
                W2C National Sequestration Registry
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Certificate of Carbon Sequestration
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Registry ID: {data.certificate_code}
              </p>
            </div>

            {/* Beneficiary */}
            <div className="py-2">
              <span className="text-xs text-slate-500 block">This is proudly awarded to</span>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-800 underline decoration-amber-400 decoration-2 underline-offset-4 mt-1">
                {data.user_name}
              </h3>
              <p className="text-xs text-slate-600 mt-1 capitalize font-medium">
                Verified {data.user_role} · Circular Carbon Value Chain
              </p>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-amber-50/80 border-2 border-amber-200/90 rounded-2xl p-4 text-center">
              <div>
                <span className="text-[10px] text-amber-800 uppercase font-bold block">
                  Feedstock Diverted
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {data.tons_diverted} <span className="text-xs font-normal text-slate-600">Tons</span>
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 truncate max-w-[140px] mx-auto">
                  {data.waste_type}
                </span>
              </div>
              <div className="border-l border-amber-200 pl-4">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                  CO2e Sequestered
                </span>
                <span className="text-2xl font-black text-emerald-700">
                  {data.amount_credits} <span className="text-xs font-normal text-emerald-800">Credits</span>
                </span>
                <span className="text-[10px] text-emerald-700 block mt-0.5 font-bold">
                  (1 Credit = 1 tCO2e)
                </span>
              </div>
            </div>

            {/* Attestation & IPCC Standard Text */}
            <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
              Attesting that the biomass feedstock listed above was successfully diverted from landfill
              or open field burning and permanently sequestered through pyrolysis into biochar or anaerobic digestion.
              Audited in compliance with <strong>IPCC MRV Guidelines</strong> and issued on the immutable W2C ledger.
            </p>

            {/* Signature & Verification QR */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white border border-slate-300 rounded-xl flex items-center justify-center p-1 shadow-xs">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">
                    Ledger Verification
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800">Verified On-Chain</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(data.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-serif italic font-bold text-base text-slate-800 tracking-wide">
                  W2C Registry Authority
                </div>
                <div className="h-0.5 w-32 bg-amber-400 my-1 mx-auto sm:ml-auto" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Authorized MRV Verifier
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
