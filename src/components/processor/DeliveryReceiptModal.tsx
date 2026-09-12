import React, { useRef } from 'react';
import {
  FileText,
  Printer,
  Share2,
  X,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Scale,
  Award,
  Building2,
  User,
  QrCode,
  Calendar,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { DeliveryReceipt } from '../../types';

interface DeliveryReceiptModalProps {
  receipt: DeliveryReceipt;
  onClose: () => void;
}

export const DeliveryReceiptModal: React.FC<DeliveryReceiptModalProps> = ({ receipt, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const formattedDate = new Date(receipt.timestamp).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(receipt.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handlePrint = () => {
    window.print();
  };

  // Pre-formatted official WhatsApp Dispatch template
  const waText = encodeURIComponent(
    `*OFFICIAL GOODS RECEIPT NOTE (GRN) - WASTE2CARBON*\n\n` +
    `*Receipt No:* ${receipt.receiptId}\n` +
    `*Date:* ${formattedDate} at ${formattedTime}\n` +
    `*Seller / Farmer:* ${receipt.producerName}\n` +
    `*Buyer / Plant:* ${receipt.processorName}\n` +
    `*Biomass Feedstock:* ${receipt.listingTitle}\n` +
    `*Net Weight:* ${receipt.quantityTons} MT (Metric Tons)\n` +
    `*Rate per MT:* Rs ${receipt.ratePerTon.toLocaleString('en-IN')}\n` +
    `*Total Payout:* Rs ${receipt.totalPayoutINR.toLocaleString('en-IN')}\n` +
    `*Carbon Credits Issued:* ${receipt.carbonCreditsAwarded} tCO2e\n` +
    `*Carbon Cert Code:* ${receipt.certificateCode}\n` +
    `*Physical OTP Authenticated:* ${receipt.otpVerified}\n` +
    `*Regulatory Compliance:* IPCC Tier-2 MRV Verified\n\n` +
    `View & verify securely on Waste2Carbon Platform.`
  );

  const waUrl = `https://wa.me/?text=${waText}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#1C1E21]/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#D6CEC2] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Top Management Bar (Screen Only) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E7E1D7] bg-[#FAF8F5] print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D5A43]" />
            <span className="text-xs font-bold text-[#1C1E21] uppercase tracking-wider">
              Official Commercial Settlement Document
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share via WhatsApp</span>
              <span className="sm:hidden">WhatsApp</span>
            </a>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-white text-xs font-bold shadow-xs transition cursor-pointer"
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

        {/* Email Notification Dispatch Status Banner (Screen Only) */}
        <div className="bg-[#EDF6F0] border-b border-[#BCE1C8] px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-[#1D5E34] print:hidden">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#2D5A43] shrink-0" />
            <span>
              Automated email vouchers sent to <strong>{receipt.producerEmail}</strong> and <strong>{receipt.processorEmail}</strong>
            </span>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white text-[#1D5E34] border border-[#BCE1C8]">
            Dispatched
          </span>
        </div>

        {/* Scrollable Formal Printable Invoice Canvas */}
        <div ref={receiptRef} className="overflow-y-auto p-6 sm:p-10 space-y-6 text-[#1C1E21] bg-white font-sans text-xs">
          
          {/* Formal Letterhead */}
          <div className="border-b-2 border-[#1C1E21] pb-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#2D5A43] text-white flex items-center justify-center font-black">
                    W
                  </div>
                  <div>
                    <h1 className="font-serif font-black text-xl text-[#1C1E21] tracking-tight">
                      WASTE2CARBON TECHNOLOGIES INDIA
                    </h1>
                    <p className="text-[10px] text-[#575B62] uppercase tracking-wider font-semibold">
                      Agri-Biomass Exchange & National Carbon Sequestration Registry
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[#575B62] pt-1">
                  GSTIN: 07AAACW2026C1ZP · Reg: DL-ND-2026-MRV09 · Support: compliance@wastetocarbon.in
                </p>
              </div>

              <div className="sm:text-right border sm:border-0 border-[#E7E1D7] p-3 sm:p-0 rounded-xl bg-[#FAF8F5] sm:bg-transparent">
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#1C1E21] text-white">
                  Goods Receipt Note (GRN)
                </span>
                <p className="text-sm font-mono font-bold text-[#1C1E21] mt-1.5">
                  {receipt.receiptId}
                </p>
                <p className="text-[11px] text-[#575B62]">
                  Date: {formattedDate} | {formattedTime}
                </p>
              </div>
            </div>
          </div>

          {/* Parties Grid (Buyer & Seller Official Record) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Seller */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl p-4 space-y-1.5">
              <span className="text-[10px] text-[#828892] uppercase font-bold tracking-wider block border-b border-[#E7E1D7] pb-1">
                1. Biomass Producer / Seller
              </span>
              <p className="font-bold text-sm text-[#1C1E21] pt-0.5">{receipt.producerName}</p>
              <p className="text-[#575B62]">Role: Agricultural Feedstock Producer</p>
              <p className="text-[#575B62]">Phone: {receipt.producerPhone}</p>
              <p className="text-[#575B62] truncate">Email: {receipt.producerEmail}</p>
            </div>

            {/* Buyer */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl p-4 space-y-1.5">
              <span className="text-[10px] text-[#828892] uppercase font-bold tracking-wider block border-b border-[#E7E1D7] pb-1">
                2. Processing Plant / Buyer
              </span>
              <p className="font-bold text-sm text-[#1C1E21] pt-0.5">{receipt.processorName}</p>
              <p className="text-[#575B62]">Facility: Industrial Biochar Pyrolysis / CBG Plant</p>
              <p className="text-[#575B62]">Status: Verified Conversion Facility</p>
              <p className="text-[#575B62] truncate">Email: {receipt.processorEmail}</p>
            </div>
          </div>

          {/* Delivery & Weighbridge Specifications Table */}
          <div className="border border-[#1C1E21] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#1C1E21] text-[11px] uppercase tracking-wider text-[#1C1E21]">
                  <th className="py-2.5 px-3 border-r border-[#E7E1D7]">No.</th>
                  <th className="py-2.5 px-3 border-r border-[#E7E1D7]">Biomass Description</th>
                  <th className="py-2.5 px-3 border-r border-[#E7E1D7] text-center">Net Qty (Tons)</th>
                  <th className="py-2.5 px-3 border-r border-[#E7E1D7] text-right">Agreed Rate / Ton</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E1D7]">
                <tr>
                  <td className="py-3 px-3 font-mono text-center border-r border-[#E7E1D7]">01</td>
                  <td className="py-3 px-3 border-r border-[#E7E1D7]">
                    <p className="font-bold text-[#1C1E21]">{receipt.listingTitle}</p>
                    <p className="text-[10px] text-[#575B62]">
                      Diverted Stubble Residue · Handshake Verification Code: {receipt.otpVerified}
                    </p>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-center border-r border-[#E7E1D7]">
                    {receipt.quantityTons} MT
                  </td>
                  <td className="py-3 px-3 font-mono text-right border-r border-[#E7E1D7]">
                    ?{receipt.ratePerTon.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-right text-[#1C1E21]">
                    ?{receipt.totalPayoutINR.toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Financial Summary Calculation Table */}
            <div className="bg-[#FAF8F5] p-4 border-t border-[#1C1E21] flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1 sm:max-w-xs text-[11px] text-[#575B62]">
                <p className="font-bold text-[#1C1E21]">Payment Terms & Disbursement:</p>
                <p>Direct electronic bank settlement (IMPS/NEFT) upon weighbridge tare confirmation.</p>
                <p className="font-mono text-[10px]">Settlement Ref: W2C-STMT-{receipt.requestId.slice(-8).toUpperCase()}</p>
              </div>

              <div className="w-full sm:w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-[#575B62]">
                  <span>Gross Feedstock Value:</span>
                  <span className="font-mono">?{receipt.totalPayoutINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#575B62]">
                  <span>Platform Brokerage (2.5%):</span>
                  <span className="font-mono">?{receipt.platformFeeINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#575B62]">
                  <span>Applicable GST / Taxes:</span>
                  <span className="font-mono">Exempt (Agri Feedstock)</span>
                </div>
                <div className="flex justify-between font-black text-sm text-[#1D5E34] pt-2 border-t border-[#1C1E21]">
                  <span>Net Payable to Farmer:</span>
                  <span className="font-mono">?{receipt.producerNetPayoutINR.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Environmental Sequestration Audit & Carbon Ledger Stamp */}
          <div className="bg-[#EDF6F0] border-2 border-[#BCE1C8] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Award className="w-4 h-4 text-[#2D5A43]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#1D5E34]">
                  Official Carbon Sequestration Registry Entry
                </span>
              </div>
              <p className="font-bold text-sm text-[#1C1E21]">
                {receipt.carbonCreditsAwarded} Metric Tonnes CO2 Equivalent (tCO2e) Minted
              </p>
              <p className="text-[11px] text-[#575B62]">
                Permanent avoidance of open burning GHG emissions. Calculated via IPCC Tier-2 equations.
              </p>
              <p className="font-mono font-bold text-xs text-[#2D5A43] pt-0.5">
                Ledger Certificate Code: {receipt.certificateCode}
              </p>
            </div>

            <div className="w-20 h-20 bg-white border border-[#BCE1C8] rounded-xl flex flex-col items-center justify-center text-center p-1.5 shrink-0 shadow-xs">
              <QrCode className="w-11 h-11 text-[#1C1E21]" />
              <span className="text-[8px] font-mono text-[#575B62] mt-0.5">SCAN AUDIT</span>
            </div>
          </div>

          {/* Legal Signatures & Attestation */}
          <div className="pt-4 border-t border-[#E7E1D7] grid grid-cols-2 gap-8 text-[11px]">
            <div className="space-y-8">
              <div className="space-y-1">
                <p className="font-bold text-[#1C1E21]">Authorized Weighbridge Inspector</p>
                <p className="text-[#828892]">Conversion Plant Receiving Facility</p>
              </div>
              <div className="border-b border-[#1C1E21] w-40" />
              <p className="text-[10px] text-[#828892]">Physically Weighed & Verified</p>
            </div>

            <div className="space-y-8 text-right flex flex-col items-end">
              <div className="space-y-1">
                <p className="font-bold text-[#1C1E21]">For Waste2Carbon Registry</p>
                <p className="text-[#828892]">Digital Compliance Officer</p>
              </div>
              <div className="border-b border-[#1C1E21] w-40" />
              <p className="text-[10px] font-mono text-[#2D5A43] font-bold">DIGITALLY SIGNED & SEALED</p>
            </div>
          </div>

          {/* Formal Footnote */}
          <div className="pt-2 text-center text-[10px] text-[#828892] border-t border-[#E7E1D7]">
            This is a computer-generated official Goods Receipt Note (GRN) issued under the Waste2Carbon circular biomass framework. No manual signature required.
          </div>
        </div>

        {/* Modal Action Footer (Screen Only) */}
        <div className="p-4 bg-[#FAF8F5] border-t border-[#E7E1D7] flex items-center justify-between gap-3 print:hidden">
          <span className="text-xs text-[#575B62] hidden sm:inline">
            Receipt ID: <strong className="font-mono text-[#1C1E21]">{receipt.receiptId}</strong>
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
