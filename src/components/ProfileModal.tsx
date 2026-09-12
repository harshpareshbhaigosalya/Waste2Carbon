import React, { useState } from 'react';
import { X, User, Phone, MapPin, Building, Award, CheckCircle2, ShieldAlert, ShieldCheck, DollarSign, Edit3, Save, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AddressData } from '../types';
import { LocationPicker } from './LocationPicker';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, updateProcessorPrice } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [addressData, setAddressData] = useState<AddressData>({
    street_address: currentUser?.street_address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || '',
    formatted_address: currentUser?.formatted_address || '',
    latitude: currentUser?.latitude || 28.6139,
    longitude: currentUser?.longitude || 77.2090,
  });

  // Processor quick price edit
  const [pricePerTon, setPricePerTon] = useState<number>(currentUser?.price_per_ton || 2500);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');

  // Keep state in sync with currentUser
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name);
      setPhone(currentUser.phone);
      setPricePerTon(currentUser.price_per_ton || 2500);
      setAddressData({
        street_address: currentUser.street_address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        pincode: currentUser.pincode || '',
        formatted_address: currentUser.formatted_address || '',
        latitude: currentUser.latitude || 28.6139,
        longitude: currentUser.longitude || 77.2090,
      });
    }
  }, [currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice('');

    await updateUserProfile({
      full_name: fullName,
      phone,
      addressData,
    });

    if (currentUser.role === 'processor') {
      await updateProcessorPrice(pricePerTon);
    }

    setIsSaving(false);
    setIsEditing(false);
    setNotice('Profile updated in Supabase database!');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Your Profile & Settings</h2>
              <p className="text-xs text-slate-400">Manage account information and location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {notice && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{notice}</span>
            </div>
          )}

          {/* User Status Bar */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">{currentUser.full_name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5">{currentUser.email}</p>
            </div>

            {/* Verification Badge */}
            <div>
              {currentUser.verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Facility
                </span>
              ) : currentUser.role === 'processor' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950 border border-amber-800 px-3 py-1 rounded-full">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Under Verification
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active Generator
                </span>
              )}
            </div>
          </div>

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Phone Number</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5 block">
                    {currentUser.phone || 'Not provided'}
                  </span>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 block">Carbon Credits Balance</span>
                  <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    {currentUser.carbon_credits_balance} Credits
                  </span>
                </div>
              </div>

              {/* Processor Specific Details */}
              {currentUser.role === 'processor' && (
                <div className="bg-amber-950/30 border border-amber-500/30 p-4 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-amber-300 block">
                    Processor Buying Offer & Compliance
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Current Buying Price</span>
                      <span className="text-base font-black text-amber-400">
                        ₹{currentUser.price_per_ton ? currentUser.price_per_ton.toLocaleString('en-IN') : '2,500'}
                      </span>
                      <span className="text-[10px] text-slate-400"> / ton</span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block uppercase">Conversion Technology</span>
                      <span className="text-xs font-bold text-white capitalize mt-0.5 block">
                        {currentUser.facility_type === 'biochar' ? 'Biochar Pyrolysis' : 'Biogas Digester'}
                      </span>
                    </div>
                  </div>

                  {currentUser.document_number && (
                    <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Submitted Certificate:</span>
                      <strong className="text-white">{currentUser.document_type}</strong> (No: {currentUser.document_number})
                    </div>
                  )}
                </div>
              )}

              {/* Address View */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registered Location / Address</span>
                </span>
                <p className="text-sm font-semibold text-white">
                  {currentUser.formatted_address || `${currentUser.city}, ${currentUser.state}` || 'No address set'}
                </p>
                {currentUser.latitude && (
                  <p className="text-[11px] font-mono text-emerald-400">
                    GPS: {currentUser.latitude.toFixed(4)}° N, {currentUser.longitude?.toFixed(4)}° E
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                <span className="text-[11px] text-slate-500">Stored in Supabase database</span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile & Prices</span>
                </button>
              </div>
            </div>
          ) : (
            /* Edit Mode Form */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Name / Organization Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Processor Buying Price Edit */}
              {currentUser.role === 'processor' && (
                <div className="bg-amber-950/40 border border-amber-500/40 p-3.5 rounded-2xl space-y-1.5">
                  <label className="block text-xs font-bold text-amber-400">
                    Update Offered Buying Price (₹ per ton)
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
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Producers will immediately see this updated rate when choosing your facility.
                  </p>
                </div>
              )}

              {/* Address Editor with LocationPicker */}
              <div className="pt-2 border-t border-slate-800">
                <LocationPicker
                  value={addressData}
                  onChange={setAddressData}
                  label="Update Location / Pin"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950 transition disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{isSaving ? 'Saving...' : 'Save Changes in Supabase'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
