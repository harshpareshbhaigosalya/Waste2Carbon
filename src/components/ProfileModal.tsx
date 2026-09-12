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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C1E21]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border border-[#E7E1D7] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7E1D7] bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2D5A43] text-white flex items-center justify-center shadow-xs font-bold">
              <User className="w-5 h-5 text-[#D4A34F]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-[#1C1E21]">{currentUser.full_name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#F4EDE2] text-[#9A6A15] border border-[#E7E1D7]">
                  {currentUser.role}
                </span>
                {currentUser.role === 'processor' && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      currentUser.verified
                        ? 'bg-[#FAF8F5] text-[#2D5A43] border border-[#2D5A43]/40'
                        : 'bg-[#F4EDE2] text-[#9A6A15] border border-[#D4A34F]'
                    }`}
                  >
                    {currentUser.verified ? 'Verified Facility' : 'Under Compliance Review'}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#828892] font-mono">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#828892] hover:text-[#1C1E21] hover:bg-[#FAF8F5] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {notice && (
            <div className="bg-[#FAF8F5] border border-[#2D5A43]/40 text-[#2D5A43] text-xs p-3 rounded-2xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {!isEditing ? (
            /* View Mode */
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FAF8F5] border border-[#E7E1D7] p-4 rounded-2xl space-y-1">
                  <span className="text-[#828892] font-medium">Contact Phone</span>
                  <p className="text-sm font-bold text-[#1C1E21] flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-[#2D5A43]" />
                    <span>{currentUser.phone || 'Not provided'}</span>
                  </p>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E7E1D7] p-4 rounded-2xl space-y-1">
                  <span className="text-[#828892] font-medium">Carbon Balance</span>
                  <p className="text-sm font-bold text-[#2D5A43] flex items-center gap-1.5 font-mono">
                    <Award className="w-4 h-4 text-[#9A6A15]" />
                    <span>{currentUser.carbon_credits_balance || 0} tCO2e</span>
                  </p>
                </div>

                {currentUser.role === 'processor' && (
                  <>
                    <div className="bg-[#FAF8F5] border border-[#E7E1D7] p-4 rounded-2xl space-y-1">
                      <span className="text-[#828892] font-medium">Facility Technology</span>
                      <p className="text-sm font-bold text-[#1C1E21] capitalize">
                        {currentUser.facility_type === 'biochar' ? 'Biochar Pyrolysis Plant' : 'Biogas Digester Plant'}
                      </p>
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#E7E1D7] p-4 rounded-2xl space-y-1">
                      <span className="text-[#9A6A15] font-bold uppercase tracking-wider text-[10px]">
                        Active Intake Rate
                      </span>
                      <p className="text-lg font-black text-[#2D5A43] font-mono">
                        ₹{currentUser.price_per_ton ? currentUser.price_per_ton.toLocaleString('en-IN') : '2,500'}
                        <span className="text-xs text-[#828892] font-normal"> / ton</span>
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Address card */}
              <div className="bg-[#FAF8F5] border border-[#E7E1D7] p-4 rounded-2xl space-y-1.5">
                <span className="text-[#828892] font-medium flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#2D5A43]" />
                  <span>Registered Depot / Farm Address</span>
                </span>
                <p className="font-semibold text-[#1C1E21] text-sm">
                  {currentUser.formatted_address || `${currentUser.street_address || ''} ${currentUser.city || ''} ${currentUser.state || ''}`}
                </p>
                {currentUser.latitude && currentUser.longitude && (
                  <p className="font-mono text-[#2D5A43] text-[11px]">
                    Coordinates: {currentUser.latitude.toFixed(4)}° N, {currentUser.longitude.toFixed(4)}° E
                  </p>
                )}
              </div>

              {/* Document card for processors */}
              {currentUser.role === 'processor' && (
                <div className="bg-[#FFFFFF] border border-[#E7E1D7] p-4 rounded-2xl space-y-2">
                  <span className="text-[#828892] font-medium">Regulatory Documentation</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <p className="text-[#1C1E21]">
                      Type: <strong>{currentUser.document_type || 'SPCB Consent to Operate'}</strong>
                    </p>
                    <p className="text-[#1C1E21]">
                      License No: <strong className="font-mono">{currentUser.document_number || 'Under Review'}</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
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
                  <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                    Full Name / Registered Entity
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1E21] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white"
                  />
                </div>
              </div>

              {currentUser.role === 'processor' && (
                <div>
                  <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                    Facility Buying Price (₹ / Ton)
                  </label>
                  <input
                    type="number"
                    step="50"
                    value={pricePerTon}
                    onChange={(e) => setPricePerTon(Number(e.target.value))}
                    required
                    className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-[#1C1E21] focus:outline-none focus:border-[#2D5A43]"
                  />
                </div>
              )}

              {/* Location Picker with Interactive Map */}
              <div className="pt-2 border-t border-[#E7E1D7]">
                <LocationPicker
                  value={addressData}
                  onChange={setAddressData}
                  label="Update Address & Geolocation Coordinates"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E1D7]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-[#828892] hover:text-[#1C1E21] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
