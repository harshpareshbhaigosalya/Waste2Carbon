import React, { useState } from 'react';
import { User, Phone, Building, CheckCircle2, ArrowRight, DollarSign, Sprout, Factory, AlertCircle, FileText, Upload, ShieldAlert } from 'lucide-react';
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

    const entityType: EntityType =
      role === 'producer'
        ? 'farm'
        : facilityType === 'biochar'
        ? 'biochar_facility'
        : 'biogas_facility';

    const res = await completeOnboarding({
      full_name: fullName,
      phone,
      role,
      entity_type: entityType,
      facility_type: role === 'processor' ? facilityType : undefined,
      price_per_ton: role === 'processor' ? pricePerTon : undefined,
      document_type: role === 'processor' ? documentType : undefined,
      document_number: role === 'processor' ? documentNumber : undefined,
      document_name: role === 'processor' ? (documentFileName || 'Compliance_Certificate.pdf') : undefined,
      addressData,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-2xl relative z-10 space-y-6 my-8">
        {/* Onboarding Header */}
        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            One-Time Profile Setup · Stored in Supabase
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Complete Your Organization Profile</h1>
          <p className="text-xs text-slate-400">
            Set up your entity type, contact number, and precise pickup/facility location.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-800 bg-rose-950/70 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Entity Role Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                1. Select Platform Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setRole('producer')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all text-left ${
                    role === 'producer'
                      ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Sprout className={`w-5 h-5 ${role === 'producer' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    {role === 'producer' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <h3 className="font-bold text-sm text-white mt-2">Waste Producer / Seller</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Farms, food industries, and municipal generators who have waste to divert.
                  </p>
                </div>

                <div
                  onClick={() => setRole('processor')}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all text-left ${
                    role === 'processor'
                      ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Factory className={`w-5 h-5 ${role === 'processor' ? 'text-amber-400' : 'text-slate-500'}`} />
                    {role === 'processor' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <h3 className="font-bold text-sm text-white mt-2">Waste Processor / Buyer</h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Biochar pyrolysis and anaerobic biogas plants buying organic waste.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Basic Info */}
            <div className="space-y-3.5 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                2. Contact & Organization Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {role === 'producer' ? 'Farmer / Business Name' : 'Facility / Company Name'} <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder={role === 'producer' ? 'e.g. GreenField Farms (John)' : 'e.g. Apex Biochar Plant'}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Contact Phone Number <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Location Picker with Map & Search */}
            <div className="pt-2 border-t border-slate-800">
              <LocationPicker
                value={addressData}
                onChange={setAddressData}
                label={role === 'producer' ? 'Farm / Pickup Location' : 'Processing Facility Location'}
              />
            </div>

            {/* 4. Processor Specific Details & Verification Documents */}
            {role === 'processor' && (
              <div className="space-y-4 pt-3 border-t border-slate-800 bg-slate-950/70 p-5 rounded-2xl border border-amber-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Factory className="w-4 h-4" />
                    <span>Facility Intake & Verification Settings</span>
                  </span>
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded-full font-semibold">
                    Admin Approval Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Conversion Technology
                    </label>
                    <select
                      value={facilityType}
                      onChange={(e) => setFacilityType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="biochar">Biochar Pyrolysis (Dry Stubble/Wood)</option>
                      <option value="biogas">Anaerobic Biogas (Wet Food/Manure)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Offered Buying Price (₹ per ton)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-bold text-amber-400">₹</span>
                      <input
                        type="number"
                        min="200"
                        max="20000"
                        step="50"
                        value={pricePerTon}
                        onChange={(e) => setPricePerTon(parseFloat(e.target.value) || 2500)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance & Verification Document Upload Section */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Compliance & Certification Document (For Admin Verification)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Document Classification <span className="text-amber-400">*</span>
                      </label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="SPCB Consent to Operate (CTO)">State Pollution Board (SPCB) CTO License</option>
                        <option value="Factory / Industrial Kiln Permit">Factory License / Pyrolysis Permit</option>
                        <option value="MSME / GST Registration Certificate">MSME / GST Registration Certificate</option>
                        <option value="EBC / Biochar Quality Certification">European Biochar (EBC) / ISO Standard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Document / License Number <span className="text-amber-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={documentNumber}
                        onChange={(e) => setDocumentNumber(e.target.value)}
                        required={role === 'processor'}
                        placeholder="e.g. SPCB/CTO/2026/0892"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* File Upload simulation */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Upload Certificate Copy (PDF / Image)
                    </label>
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-500/60 bg-slate-900/60 cursor-pointer transition text-xs text-slate-400 hover:text-white">
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>{documentFileName ? `Uploaded: ${documentFileName}` : 'Choose Certificate File (PDF / PNG / JPG)'}</span>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Saving to Database...' : 'Save Profile in Supabase & Enter Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
