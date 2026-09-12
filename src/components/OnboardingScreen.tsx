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
    <div className="min-h-screen bg-[#fcfbf7] flex flex-col justify-center items-center p-4 sm:p-6 relative">
      <div className="absolute top-10 -left-20 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-80 h-80 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            Profile Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Complete Your W2C Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Choose your role in India's circular carbon value chain. Your address helps match local waste generators with conversion plants.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-amber-200/90 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Your Platform Role <span className="text-emerald-700">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('producer')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 cursor-pointer ${
                    role === 'producer'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      role === 'producer' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Sprout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Waste Producer</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Farmer, FPO, Food Industry, Municipality generating organic waste.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('processor')}
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 cursor-pointer ${
                    role === 'processor'
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      role === 'processor' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Factory className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Conversion Facility</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Biochar Pyrolysis or Biogas Digester plant converting biomass.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name / Enterprise Name <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Green Valley Agro FPO / Ramesh Sharma"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Processor Specific: Facility Settings & Compliance Document */}
            {role === 'processor' && (
              <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Factory className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Facility Details & Compliance Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Plant Technology</label>
                    <select
                      value={facilityType}
                      onChange={(e) => setFacilityType(e.target.value as any)}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-600"
                    >
                      <option value="biochar">Biochar Pyrolysis Plant</option>
                      <option value="biogas">Biogas / Bio-CNG Digester</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Offer Buying Rate (₹ / Ton)
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={pricePerTon}
                      onChange={(e) => setPricePerTon(Number(e.target.value))}
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                {/* Verification Document Upload */}
                <div className="pt-2 border-t border-amber-200/80 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-700" />
                    <span className="text-xs font-bold text-amber-900">
                      Compliance License / SPCB Verification Document
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Document Type <span className="text-emerald-700">*</span>
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                      >
                        <option value="SPCB Consent to Operate (CTO)">SPCB Consent to Operate (CTO)</option>
                        <option value="Pollution Control Board License">Pollution Control Board License</option>
                        <option value="Municipal Waste Processing Authorization">Municipal Waste Handling Permit</option>
                        <option value="Factory Inspectorate License">Factory Inspectorate License</option>
                        <option value="GST / MSME Registration">MSME / Udyam Certificate</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        License / Registration Number <span className="text-emerald-700">*</span>
                      </label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        required
                        placeholder="e.g. SPCB/CTO/2026/8941"
                        className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* File Upload Input */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Upload Document Copy (PDF / Image)
                    </label>
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-amber-300 rounded-xl p-3 bg-white hover:bg-amber-50 cursor-pointer transition text-xs font-semibold text-amber-900">
                      <Upload className="w-4 h-4 text-amber-700" />
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
            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                2. Farm / Facility Location & Address <span className="text-emerald-700">*</span>
              </label>
              <LocationPicker
                value={addressData}
                onChange={setAddressData}
                label="Physical Address & Geocoded Coordinates"
              />
            </div>

            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Saving to Supabase Database...' : 'Save Profile & Enter Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
