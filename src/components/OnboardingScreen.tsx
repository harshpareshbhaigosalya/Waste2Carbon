import React, { useState } from 'react';
import {
  User,
  Phone,
  Building,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Sprout,
  Factory,
  AlertCircle,
  FileText,
  Upload,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, EntityType, AddressData } from '../types';
import { LocationPicker } from './LocationPicker';

export const OnboardingScreen: React.FC = () => {
  const { currentUser, completeOnboarding } = useApp();

  const [role, setRole] = useState<UserRole>('producer');
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState('');

  // Structured Address Data
  const [addressData, setAddressData] = useState<AddressData>({
    street_address: '',
    city: '',
    state: '',
    pincode: '',
    formatted_address: '',
    latitude: 28.6139,
    longitude: 77.2090,
  });

  // Processor settings
  const [facilityType, setFacilityType] = useState<'biochar' | 'biogas'>('biochar');
  const [pricePerTon, setPricePerTon] = useState<number>(2500);

  // Verification Document for Processors
  const [documentType, setDocumentType] = useState('SPCB Consent to Operate (CTO)');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFileName, setDocumentFileName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Please enter your person or business name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }
    if (!addressData.street_address.trim() || !addressData.city.trim()) {
      setErrorMessage('Please enter your street address and city.');
      return;
    }
    if (role === 'processor' && !documentNumber.trim()) {
      setErrorMessage('Please provide your compliance certificate/license number for admin verification.');
      return;
    }

    setIsSubmitting(true);

    const res = await completeOnboarding({
      full_name: fullName,
      phone,
      role,
      entity_type: role === 'producer' ? 'farm' : facilityType === 'biochar' ? 'biochar_facility' : 'biogas_facility',
      facility_type: role === 'processor' ? facilityType : undefined,
      price_per_ton: role === 'processor' ? pricePerTon : undefined,
      document_type: role === 'processor' ? documentType : undefined,
      document_number: role === 'processor' ? documentNumber : undefined,
      document_name: role === 'processor' ? documentFileName || 'compliance_doc.pdf' : undefined,
      addressData,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-center items-center p-4 sm:p-6 relative selection:bg-[#2D5A43] selection:text-white">
      <div className="absolute top-10 -left-20 w-80 h-80 bg-[#F4EEDF]/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-[#EDF6F0]/60 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FDF6E2] text-[#855B09] border border-[#EED99E]">
            Profile Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1E21] tracking-tight">
            Complete Your Waste2Carbon Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#575B62] max-w-md mx-auto">
            Choose your role in India's circular carbon value chain. Your physical coordinates help match local waste generators with conversion plants.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E7E1D7] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E21] mb-2">
                1. Select Your Platform Role <span className="text-[#2D5A43]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('producer')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    role === 'producer'
                      ? 'border-[#2D5A43] bg-[#EDF6F0]/60 shadow-2xs ring-1 ring-[#2D5A43]/20'
                      : 'border-[#E7E1D7] hover:border-[#D6CEC2] bg-[#FAF8F5]/50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      role === 'producer' ? 'bg-[#2D5A43] text-white' : 'bg-[#E7E1D7] text-[#575B62]'
                    }`}
                  >
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1E21]">Waste Producer</h3>
                    <p className="text-xs text-[#575B62] mt-0.5">
                      Farmer, FPO, Food Industry, Municipality generating organic waste.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('processor')}
                  className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 cursor-pointer ${
                    role === 'processor'
                      ? 'border-[#9A6A15] bg-[#FDF6E2]/60 shadow-2xs ring-1 ring-[#9A6A15]/20'
                      : 'border-[#E7E1D7] hover:border-[#D6CEC2] bg-[#FAF8F5]/50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      role === 'processor' ? 'bg-[#9A6A15] text-white' : 'bg-[#E7E1D7] text-[#575B62]'
                    }`}
                  >
                    <Factory className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1C1E21]">Conversion Facility</h3>
                    <p className="text-xs text-[#575B62] mt-0.5">
                      Biochar Pyrolysis or Biogas Digester plant converting biomass.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                  Full Name / Enterprise Name <span className="text-[#2D5A43]">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Green Valley Agro FPO / Ramesh Sharma"
                  required
                  className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                  Contact Phone Number <span className="text-[#2D5A43]">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
                />
              </div>
            </div>

            {/* Processor Specific: Facility Settings & Compliance Document */}
            {role === 'processor' && (
              <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-[#9A6A15]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1C1E21]">
                    Facility Details & Compliance Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1C1E21] mb-1">Plant Technology</label>
                    <select
                      value={facilityType}
                      onChange={(e) => setFacilityType(e.target.value as any)}
                      className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-medium text-[#1C1E21] focus:outline-none focus:border-[#2D5A43]"
                    >
                      <option value="biochar">Biochar Pyrolysis Plant</option>
                      <option value="biogas">Biogas / Bio-CNG Digester</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                      Offer Buying Rate (₹ / Ton)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={pricePerTon}
                      onChange={(e) => setPricePerTon(Number(e.target.value))}
                      className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-bold text-[#1C1E21] focus:outline-none focus:border-[#2D5A43]"
                    />
                  </div>
                </div>

                {/* Verification Document Upload */}
                <div className="pt-2 border-t border-[#E7E1D7] space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#9A6A15]" />
                    <span className="text-xs font-bold text-[#1C1E21]">
                      Compliance License / SPCB Verification Document
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#575B62] mb-1">
                        Document Type <span className="text-[#2D5A43]">*</span>
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs text-[#1C1E21] focus:outline-none"
                      >
                        <option value="SPCB Consent to Operate (CTO)">SPCB Consent to Operate (CTO)</option>
                        <option value="Pollution Control Board License">Pollution Control Board License</option>
                        <option value="Municipal Waste Processing Authorization">Municipal Waste Handling Permit</option>
                        <option value="Factory Inspectorate License">Factory Inspectorate License</option>
                        <option value="GST / MSME Registration">MSME / Udyam Certificate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#575B62] mb-1">
                        License / Registration Number <span className="text-[#2D5A43]">*</span>
                      </label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        required
                        placeholder="e.g. SPCB/CTO/2026/8941"
                        className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs text-[#1C1E21] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* File Upload Input */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#575B62] mb-1">
                      Upload Document Copy (PDF / Image)
                    </label>
                    <label className="flex items-center justify-center gap-2 border border-dashed border-[#D6CEC2] rounded-xl p-3 bg-white hover:bg-[#FAF8F5] cursor-pointer transition text-xs font-semibold text-[#1C1E21]">
                      <Upload className="w-4 h-4 text-[#9A6A15]" />
                      <span>{documentFileName || 'Choose File or Drag & Drop'}</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Structured Location Picker with Leaflet Interactive Map */}
            <div className="pt-2 border-t border-[#E7E1D7]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E21] mb-3">
                2. Farm / Facility Location & Address <span className="text-[#2D5A43]">*</span>
              </label>
              <LocationPicker
                value={addressData}
                onChange={setAddressData}
                label="Physical Address & Geocoded Coordinates"
              />
            </div>

            {errorMessage && (
              <div className="bg-[#FBEAE9] border border-[#F5C2C0] text-[#9E2A2B] text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs py-3.5 rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Saving to Database...' : 'Save Profile & Enter Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
