import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Building,
  Award,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  Edit3,
  Save,
  Loader2,
} from 'lucide-react';
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

    if (currentUser.role === 'processor' && pricePerTon !== currentUser.price_per_ton) {
      await updateProcessorPrice(Number(pricePerTon));
    }

    setIsSaving(false);
    setNotice('Profile updated successfully in Supabase!');
    setTimeout(() => {
      setNotice('');
      setIsEditing(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-2 border-amber-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amber-100 bg-gradient-to-r from-emerald-50 via-amber-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-md font-bold">
              <User className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-slate-900">{currentUser.full_name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  {currentUser.role}
                </span>
                {currentUser.role === 'processor' && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      currentUser.verified
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {currentUser.verified ? 'Verified' : 'Under Verification'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {notice && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#fcfbf7] border border-slate-200 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 font-medium">Contact Phone</span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>{currentUser.phone || 'Not provided'}</span>
                  </p>
                </div>

                <div className="bg-[#fcfbf7] border border-slate-200 p-4 rounded-2xl space-y-1">
                  <span className="text-slate-500 font-medium">Carbon Balance</span>
                  <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    <span>{currentUser.carbon_credits_balance || 0} Credits</span>
                  </p>
                </div>

                {currentUser.role === 'processor' && (
                  <>
                    <div className="bg-[#fcfbf7] border border-slate-200 p-4 rounded-2xl space-y-1">
                      <span className="text-slate-500 font-medium">Facility Technology</span>
                      <p className="text-sm font-bold text-slate-900 capitalize">
                        {currentUser.facility_type === 'biochar' ? 'Biochar Pyrolysis Plant' : 'Biogas Digester Plant'}
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
                      <span className="text-amber-800 font-bold uppercase tracking-wider text-[10px]">
                        Active Buying Rate
                      </span>
                      <p className="text-lg font-black text-amber-700">
                        ₹{currentUser.price_per_ton ? currentUser.price_per_ton.toLocaleString('en-IN') : '2,500'}
                        <span className="text-xs text-slate-500 font-normal"> / ton</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Address card */}
              <div className="bg-[#fcfbf7] border border-slate-200 p-4 rounded-2xl space-y-2">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Registered Address</span>
                </span>
                <p className="font-semibold text-slate-900 text-sm">
                  {currentUser.formatted_address || `${currentUser.street_address || ''} ${currentUser.city || ''} ${currentUser.state || ''}`}
                </p>
                {currentUser.latitude && currentUser.longitude && (
                  <p className="font-mono text-emerald-700 text-[11px]">
                    Coordinates: {currentUser.latitude.toFixed(4)}° N, {currentUser.longitude.toFixed(4)}° E
                  </p>
                )}
              </div>

              {/* Document card for processors */}
              {currentUser.role === 'processor' && (
                <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2">
                  <span className="text-slate-500 font-medium">Compliance & Verification</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <p>
                      Document: <strong>{currentUser.document_type || 'SPCB Consent to Operate'}</strong>
                    </p>
                    <p>
                      License No: <strong>{currentUser.document_number || 'Under Review'}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2.5 rounded-xl shadow transition flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile & Location</span>
                </button>
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name / Entity Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {currentUser.role === 'processor' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Facility Buying Price (₹ / Ton)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={pricePerTon}
                    onChange={(e) => setPricePerTon(Number(e.target.value))}
                    required
                    className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2 text-sm font-black text-slate-900 focus:outline-none focus:border-amber-600"
                  />
                </div>
              )}

              {/* Location Picker with Interactive Map */}
              <div className="pt-2 border-t border-slate-200">
                <LocationPicker
                  value={addressData}
                  onChange={setAddressData}
                  label="Update Address & Coordinates"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
