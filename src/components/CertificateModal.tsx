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
    user_name: currentUser?.full_name || 'GreenField Farms (John Miller)',
    user_role: currentUser?.role || 'producer',
    request_id: 'req-201',
    amount_credits: currentUser?.carbon_credits_balance || 14.5,
    waste_type: 'Dry Crop Residue / Wheat Straw (12.5 Tons)',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Actions bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-950/50 print:hidden">
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Official Environmental Attribute Certificate
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Certificate Design */}
        <div className="p-8 sm:p-10 bg-gradient-to-b from-slate-900 via-slate-900/95 to-emerald-950/20 relative border-4 border-double border-emerald-500/40 m-4 rounded-2xl space-y-6">
          {/* Watermark Leaf */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Leaf className="w-96 h-96 text-emerald-400" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 relative z-10">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-wider text-white font-mono">W2C</span>
            </div>
            <p className="text-xs tracking-widest uppercase font-bold text-emerald-400">
              CIRCULAR CARBON ECOSYSTEM REGISTRY
            </p>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide uppercase pt-2">
              Certificate of Verified Carbon Sequestration
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent mx-auto mt-2" />
          </div>

          {/* Certificate Body */}
          <div className="text-center space-y-4 relative z-10 py-2">
            <p className="text-xs text-slate-300">
              This official document certifies that the participant listed below has successfully diverted organic feedstock from landfills into permanent, carbon-negative processing pathways:
            </p>

            <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 max-w-lg mx-auto">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Beneficiary Entity</span>
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-300 mt-0.5">
                {data.user_name}
              </h2>
              <span className="text-xs text-slate-300 capitalize">
                Role: {data.user_role} · W2C Network Participant
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto text-left">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase">Feedstock Diverted</span>
                <span className="font-bold text-sm text-white">{data.waste_type}</span>
              </div>
              <div className="bg-slate-900/90 border border-emerald-800/80 p-3 rounded-xl bg-emerald-950/30">
                <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Net CO2e Sequestered</span>
                <span className="font-extrabold text-base text-emerald-300">
                  {data.amount_credits} Metric Tons (tCO2e)
                </span>
              </div>
            </div>
          </div>

          {/* Footer Seals & Verification */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-xs">
            {/* Serial & Standard */}
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-[11px] text-slate-400">
                Certificate Serial:{' '}
                <strong className="font-mono text-amber-400">{data.certificate_code}</strong>
              </p>
              <p className="text-[10px] text-slate-500">
                Methodology: IPCC MRV Protocol & European Biochar Standard (EBC)
              </p>
              <p className="text-[10px] text-slate-500">
                Issued Date: {new Date(data.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Verification Badge */}
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-slate-950 border border-emerald-500/50 rounded-lg flex items-center justify-center p-1">
                <QrCode className="w-10 h-10 text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified & Sealed</span>
                </div>
                <span className="text-[9px] text-slate-400 block">
                  W2C Registry Authority
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
