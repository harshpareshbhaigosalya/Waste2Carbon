import React, { useState } from 'react';
import { X, User, Phone, MapPin, Building, CheckCircle2, ShieldCheck, Crosshair } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, EntityType } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useApp();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [role, setRole] = useState<UserRole>(currentUser?.role || 'producer');
  const [entityType, setEntityType] = useState<EntityType>(currentUser?.entity_type || 'farm');
  const [latitude, setLatitude] = useState(currentUser?.latitude || 28.6280);
  const [longitude, setLongitude] = useState(currentUser?.longitude || 77.1950);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name);
      setPhone(currentUser.phone);
      setAddress(currentUser.address);
      setRole(currentUser.role);
      setEntityType(currentUser.entity_type);
      setLatitude(currentUser.latitude);
      setLongitude(currentUser.longitude);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setAddress(`GPS: ${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°E`);
        },
        () => {
          alert('Location access denied or unavailable. Using default coordinates.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    await updateUserProfile({
      full_name: fullName,
      phone,
      address,
      role,
      entity_type: entityType,
      latitude,
      longitude,
    });

    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Profile Onboarding & Entity Setup</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {savedSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-lg font-bold text-white">Profile Successfully Updated!</h3>
              <p className="text-xs text-slate-400">
                Your role and entity settings are permanently saved to your W2C profile.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Entity Role Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Your Platform Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      setRole('producer');
                      setEntityType('farm');
                    }}
                    className={`cursor-pointer p-3 rounded-xl border text-left transition ${
                      role === 'producer'
                        ? 'bg-emerald-950/70 border-emerald-500 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-sm text-emerald-300">Waste Producer / Seller</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Farms, food factories, or municipal generators
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setRole('processor');
                      setEntityType('biochar_facility');
                    }}
                    className={`cursor-pointer p-3 rounded-xl border text-left transition ${
                      role === 'processor'
                        ? 'bg-amber-950/70 border-amber-500 text-white'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-bold text-sm text-amber-300">Waste Processor</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Biochar pyrolysis & biogas conversion facilities
                    </p>
                  </div>
                </div>
              </div>

              {/* Specific Entity Type */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Organization / Entity Classification
                </label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value as EntityType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {role === 'producer' ? (
                    <>
                      <option value="farm">Agricultural Farm / Grower</option>
                      <option value="food_industry">Food Processing Industry</option>
                      <option value="municipality">Municipality / Urban Local Body</option>
                      <option value="household">Commercial / Bulk Generator</option>
                    </>
                  ) : (
                    <>
                      <option value="biochar_facility">Biochar Pyrolysis Facility</option>
                      <option value="biogas_facility">Anaerobic Biogas Plant</option>
                      <option value="composting_plant">Commercial Composting Facility</option>
                    </>
                  )}
                </select>
              </div>

              {/* Full / Business Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Name of Person or Business
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. GreenField Farms (John Miller)"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="+1 (555) 234-8765"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Physical Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Pickup / Facility Address
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
                  >
                    <Crosshair className="w-3 h-3" />
                    <span>Auto-detect GPS</span>
                  </button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    placeholder="Sector 12, Agri Hub or Industrial Area"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving Profile...' : 'Save & Continue'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
