import React, { useState, useMemo } from 'react';
import { X, Sprout, CheckCircle2, Calendar, Truck, AlertCircle, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WasteCategory, WasteUnit, AddressData } from '../../types';
import { calculateCarbonMetrics } from '../../lib/carbonCalculator';
import { LocationPicker } from '../LocationPicker';

interface AddWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddWasteModal: React.FC<AddWasteModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, allUsers, addListing } = useApp();

  const [category, setCategory] = useState<WasteCategory>('dry_organic');
  const [subcategoryName, setSubcategoryName] = useState('Crop Residue / Stubble');
  const [quantity, setQuantity] = useState<number>(5);
  const [unit, setUnit] = useState<WasteUnit>('ton');
  const [expectedDate, setExpectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });

  // Pre-fill location from producer's profile
  const [addressData, setAddressData] = useState<AddressData>({
    street_address: currentUser?.street_address || '',
    city: currentUser?.city || '',
    state: currentUser?.state || '',
    pincode: currentUser?.pincode || '',
    formatted_address: currentUser?.formatted_address || '',
    latitude: currentUser?.latitude || 28.6139,
    longitude: currentUser?.longitude || 77.2090,
  });

  const [selectedProcessorId, setSelectedProcessorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Live Carbon calculation
  const carbon = useMemo(() => {
    return calculateCarbonMetrics(category, quantity, unit);
  }, [category, quantity, unit]);

  // Find registered processors in database matching category
  const availableProcessors = useMemo(() => {
    return allUsers.filter(
      (u) => u.role === 'processor' && (!u.facility_type || (category === 'dry_organic' ? u.facility_type === 'biochar' : u.facility_type === 'biogas'))
    );
  }, [allUsers, category]);

  // Default select first processor if available
  React.useEffect(() => {
    if (availableProcessors.length > 0 && !selectedProcessorId) {
      setSelectedProcessorId(availableProcessors[0].id);
    }
  }, [availableProcessors, selectedProcessorId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!subcategoryName.trim()) {
      setErrorMessage('Please specify the waste item name.');
      return;
    }
    if (!addressData.street_address.trim() || !addressData.city.trim()) {
      setErrorMessage('Please provide a street address and city for pickup.');
      return;
    }

    setIsSubmitting(true);

    const title = `${quantity} ${unit.toUpperCase()} of ${subcategoryName}`;
    const res = await addListing({
      title,
      waste_category: category,
      waste_subcategory: subcategoryName,
      quantity,
      unit,
      expected_ready_date: expectedDate,
      addressData,
      processor_id: selectedProcessorId || undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.message);
    } else {
      setSuccessNotice('Saved successfully to Supabase database!');
      setTimeout(() => {
        setSuccessNotice('');
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">List Waste Feedstock</h2>
              <p className="text-xs text-slate-400">Calculates CO2 savings and routes to nearby buyer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {errorMessage && (
            <div className="p-3.5 rounded-xl border border-rose-800 bg-rose-950/70 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3.5 rounded-xl border border-emerald-800 bg-emerald-950/70 text-emerald-300 text-xs flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Step 1: Waste Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Waste Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => {
                  setCategory('dry_organic');
                  setSubcategoryName('Crop Residue / Stubble');
                }}
                className={`cursor-pointer p-3.5 rounded-2xl border text-left transition ${
                  category === 'dry_organic'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-emerald-300 block">Dry Organic (Biochar)</span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Crop straw, stalks, wood chips, husks.
                </span>
              </div>

              <div
                onClick={() => {
                  setCategory('wet_organic');
                  setSubcategoryName('Food Waste / Slurry');
                }}
                className={`cursor-pointer p-3.5 rounded-2xl border text-left transition ${
                  category === 'wet_organic'
                    ? 'bg-amber-950/70 border-amber-500 text-white ring-1 ring-amber-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-amber-300 block">Wet Organic (Biogas)</span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Food waste, fruit peels, manure, slurry.
                </span>
              </div>
            </div>

            <input
              type="text"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              placeholder="e.g. Wheat Straw Bales, Rice Husks, Fruit Mash"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 mt-2"
            />
          </div>

          {/* Step 2: Quantity & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ton">Metric Tons (t)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="quintal">Quintals (100 kg)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Ready Date</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Carbon Preview */}
          <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">🌱 Carbon Impact (IPCC Model)</span>
              <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                {carbon.pathway}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">CO2 Prevented</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {carbon.totalCO2e} <span className="text-xs font-normal">Tons</span>
                </span>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Estimated Carbon Credits</span>
                <span className="text-lg font-extrabold text-white">
                  {carbon.carbonCredits} <span className="text-xs font-normal text-emerald-400">Credits</span>
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Location Picker with Map & Search */}
          <div className="pt-2 border-t border-slate-800">
            <LocationPicker
              value={addressData}
              onChange={setAddressData}
              label="Pickup Location / Farm Gate"
            />
          </div>

          {/* Step 4: Choose Registered Nearby Facility */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Registered Buyers / Conversion Facilities
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">
                {availableProcessors.length} Facility Available
              </span>
            </div>

            {availableProcessors.length === 0 ? (
              <div className="bg-slate-950 border border-dashed border-slate-800 p-4 rounded-2xl text-center space-y-1">
                <p className="text-slate-300 font-semibold">No registered buyer in database yet.</p>
                <p className="text-[11px] text-slate-500">
                  Your waste will be listed as "Available" in the database. Any facility can accept it!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableProcessors.map((proc) => (
                  <div
                    key={proc.id}
                    onClick={() => setSelectedProcessorId(proc.id)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      selectedProcessorId === proc.id
                        ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{proc.full_name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                          {proc.facility_type || 'Processor'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        📍 {proc.city || proc.street_address || 'Registered Location'} · 📞 {proc.phone}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-amber-400">
                        ${proc.price_per_ton || 45}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ ton offer</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>List Waste & Send Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
