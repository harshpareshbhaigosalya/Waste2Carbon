import React, { useState } from 'react';
import { User, Phone, MapPin, Building, CheckCircle2, ArrowRight, DollarSign, Sprout, Factory } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, EntityType, WasteCategory } from '../types';

export const OnboardingScreen: React.FC = () => {
  const { currentUser, completeOnboarding } = useApp();

  const [role, setRole] = useState<UserRole>('producer');
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Processor-specific fields
  const [facilityType, setFacilityType] = useState<'biochar' | 'biogas'>('biochar');
  const [pricePerTon, setPricePerTon] = useState<number>(45);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let entityType: EntityType = 'farm';
    let acceptedCategories: WasteCategory[] = ['dry_organic'];

    if (role === 'processor') {
      entityType = facilityType === 'biochar' ? 'biochar_facility' : 'biogas_facility';
      acceptedCategories = facilityType === 'biochar' ? ['dry_organic'] : ['wet_organic'];
    }

    await completeOnboarding({
      full_name: fullName,
      phone,
      address,
      role,
      entity_type: entityType,
      facility_type: role === 'processor' ? facilityType : undefined,
      price_per_ton: role === 'processor' ? pricePerTon : undefined,
      accepted_categories: role === 'processor' ? acceptedCategories : undefined,
    });

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Onboarding Header */}
        <div className="text-center space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
            Step 2 of 2 · One-Time Profile Setup
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome to W2C</h1>
          <p className="text-xs text-slate-400">
            Tell us about your organization to set up your dedicated workspace.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Choose Entity Role */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                What is your role on the platform?
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
                    I have agricultural, food, or industrial waste to sell and earn carbon credits.
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
                    I operate a Biochar pyrolysis kiln or Biogas plant that converts waste into value.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Basic Contact Details */}
            <div className="space-y-3.5 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {role === 'producer' ? 'Name of Person or Farm / Business' : 'Facility or Business Name'}
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder={role === 'producer' ? 'e.g. GreenField Farms (John)' : 'e.g. Apex Biochar Facility'}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="e.g. +1 (555) 234-8765"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location / Address (for pickup logistics)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="e.g. Sector 12 Agri Zone, Valley Road"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Processor-Specific Settings */}
            {role === 'processor' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-800 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Conversion Technology
                  </label>
                  <select
                    value={facilityType}
                    onChange={(e) => setFacilityType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="biochar">Biochar Pyrolysis Plant (Takes Dry Stubble/Wood Waste)</option>
                    <option value="biogas">Anaerobic Biogas Digester (Takes Wet Food/Manure)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Buying Price Offered to Producers ($ per ton)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={pricePerTon}
                      onChange={(e) => setPricePerTon(parseFloat(e.target.value) || 40)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
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
              <span>{isSubmitting ? 'Saving Profile...' : 'Save Profile & Enter Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
