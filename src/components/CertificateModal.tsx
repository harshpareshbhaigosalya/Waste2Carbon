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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#1C1E21]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border-2 border-[#D4A34F] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Actions bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E7E1D7] bg-[#FAF8F5] print:hidden">
          <span className="text-xs text-[#1C1E21] font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2D5A43]" />
            Official Environmental Attribute Certificate
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-xs font-bold text-white transition cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#828892] hover:text-[#1C1E21] p-1.5 rounded-xl hover:bg-[#E7E1D7]/50 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-8 sm:p-12 relative overflow-hidden bg-[#FAF8F5]">
          {/* Certificate Borders & Corner Accents */}
          <div className="absolute inset-3 sm:inset-5 border-2 border-[#D4A34F]/70 rounded-2xl pointer-events-none" />
          <div className="absolute inset-4 sm:inset-6 border border-[#2D5A43]/20 rounded-xl pointer-events-none" />

          {/* Watermark Leaf Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <Leaf className="w-96 h-96 text-[#2D5A43]" />
          </div>

          <div className="relative z-10 space-y-6 text-center">
            {/* Seal & Badge */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D4A34F] to-[#F4EDE2] flex items-center justify-center shadow-md text-[#1C1E21] font-bold border border-[#D4A34F]">
                  <Award className="w-9 h-9 text-[#1C1E21]" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-[#2D5A43] text-white rounded-full p-1 border-2 border-white shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Title Header */}
            <div>
              <span className="text-[10px] tracking-widest uppercase font-black text-[#9A6A15] block mb-1">
                Waste2Carbon National MRV Registry
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1E21] tracking-tight">
                Certificate of Carbon Sequestration
              </h2>
              <p className="text-xs text-[#828892] mt-1 font-mono">
                Registry ID: {data.certificate_code}
              </p>
            </div>

            {/* Beneficiary */}
            <div className="py-2">
              <span className="text-xs text-[#828892] block">This certificate is awarded to</span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D5A43] underline decoration-[#D4A34F] decoration-2 underline-offset-4 mt-1">
                {data.user_name}
              </h3>
              <p className="text-xs text-[#828892] mt-1 capitalize font-medium">
                Verified {data.user_role} · Circular Carbon Value Chain
              </p>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto bg-[#FFFFFF] border border-[#E7E1D7] rounded-2xl p-4 text-center shadow-xs">
              <div>
                <span className="text-[10px] text-[#828892] uppercase font-bold block">
                  Feedstock Diverted
                </span>
                <span className="text-2xl font-black text-[#1C1E21] font-mono">
                  {data.tons_diverted} <span className="text-xs font-normal text-[#828892]">Tons</span>
                </span>
                <span className="text-[10px] text-[#828892] block mt-0.5 truncate max-w-[140px] mx-auto">
                  {data.waste_type}
                </span>
              </div>
              <div className="border-l border-[#E7E1D7] pl-4">
                <span className="text-[10px] text-[#2D5A43] uppercase font-bold block">
                  CO2e Sequestered
                </span>
                <span className="text-2xl font-black text-[#2D5A43] font-mono">
                  {data.amount_credits} <span className="text-xs font-normal text-[#2D5A43]">Credits</span>
                </span>
                <span className="text-[10px] text-[#2D5A43] block mt-0.5 font-bold">
                  (1 Credit = 1 tCO2e)
                </span>
              </div>
            </div>

            {/* Attestation & IPCC Standard Text */}
            <p className="text-xs text-[#828892] max-w-lg mx-auto leading-relaxed">
              Attesting that the agricultural biomass listed above was diverted from open field burning
              and permanently sequestered through certified pyrolysis into biochar or anaerobic biomethanation.
              Audited in accordance with <strong>IPCC MRV Guidelines</strong> on the immutable Waste2Carbon registry.
            </p>

            {/* Signature & Verification QR */}
            <div className="pt-6 border-t border-[#E7E1D7] flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FFFFFF] border border-[#E7E1D7] rounded-xl flex items-center justify-center p-1 shadow-xs">
                  <QrCode className="w-10 h-10 text-[#1C1E21]" />
                </div>
                <div>
                  <span className="text-[10px] text-[#828892] uppercase tracking-wider block font-bold">
                    Ledger Verification
                  </span>
                  <p className="text-xs font-mono font-bold text-[#1C1E21]">Verified On-Chain</p>
                  <p className="text-[10px] text-[#828892]">
                    {new Date(data.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="font-serif italic font-bold text-base text-[#1C1E21] tracking-wide">
                  Waste2Carbon Registry Authority
                </div>
                <div className="h-0.5 w-32 bg-[#D4A34F] my-1 mx-auto sm:ml-auto" />
                <span className="text-[10px] text-[#828892] uppercase tracking-wider block">
                  Authorized MRV Auditor
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
