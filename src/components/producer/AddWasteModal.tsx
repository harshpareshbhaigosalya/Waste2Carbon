import React, { useState, useMemo } from 'react';
import { X, Sprout, CheckCircle2, Calendar, Truck, AlertCircle, Loader2, ArrowUpDown, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-emerald-950/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border-2 border-amber-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amber-100 bg-gradient-to-r from-emerald-50 via-amber-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-bold shadow-md">
              <Sprout className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">List Organic Waste Batch</h3>
              <p className="text-xs text-slate-500">
                Connect directly with certified biochar & biogas conversion plants
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* 1. Waste Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Waste Category & Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCategory('dry_organic');
                  setSubcategoryName('Crop Residue / Stubble');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                  category === 'dry_organic'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <span className="font-bold text-sm block text-slate-900">Dry Biomass / Stubble</span>
                <span className="text-[11px] text-slate-500">Paddy straw, bagasse, stalks & wood chips (Biochar)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('wet_organic');
                  setSubcategoryName('Cattle Dung / Slurry');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                  category === 'wet_organic'
                    ? 'border-amber-500 bg-amber-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <span className="font-bold text-sm block text-slate-900">Wet / Slurry Waste</span>
                <span className="text-[11px] text-slate-500">Cattle dung, food pulp, press-mud (Biogas & Bio-CNG)</span>
              </button>
            </div>
          </div>

          {/* Subcategory Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Waste Subcategory Description
            </label>
            <input
              type="text"
              value={subcategoryName}
              onChange={(e) => setSubcategoryName(e.target.value)}
              required
              placeholder="e.g. Wheat Straw, Sugarcane Bagasse, Dairy Slurry"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          {/* 2. Quantity & Expected Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as WasteUnit)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
              >
                <option value="ton">Metric Tons (t)</option>
                <option value="quintal">Quintals (q)</option>
                <option value="kg">Kilograms (kg)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ready for Pickup By</label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Live Environmental & Market Value Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-amber-50 border-2 border-amber-200 rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">CO2e Sequestration Potential</span>
              <span className="text-lg font-black text-emerald-800">
                {carbon.totalCO2e} <span className="text-xs font-normal">Tons CO2e</span>
              </span>
              <span className="text-[10px] text-emerald-700 block font-semibold mt-0.5">
                Eligible for ~{carbon.carbonCredits} Carbon Credits
              </span>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Baseline Economic Value</span>
              <span className="text-lg font-black text-amber-800">
                ₹{carbon.estimatedMarketValueINR.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-700 block font-semibold mt-0.5">
                Can be negotiated with buyer!
              </span>
            </div>
          </div>

          {/* 3. Choose Destination Processor */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Select Destination Conversion Facility</span>
            </label>

            {availableProcessors.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl border border-slate-200">
                No matching verified processors in database yet. Listing will be posted to open marketplace.
              </p>
            ) : (
              <div className="space-y-2">
                {availableProcessors.map((proc) => (
                  <label
                    key={proc.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition ${
                      selectedProcessorId === proc.id
                        ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="processorSelection"
                        checked={selectedProcessorId === proc.id}
                        onChange={() => setSelectedProcessorId(proc.id)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-900">{proc.full_name}</p>
                        <p className="text-[11px] text-slate-500">
                          {proc.city ? `${proc.city}, ${proc.state}` : proc.formatted_address || 'India'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Offer Buying Rate</span>
                      <span className="font-black text-emerald-700 text-sm">
                        ₹{proc.price_per_ton ? proc.price_per_ton.toLocaleString('en-IN') : '2,500'}/t
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* 4. Location Picker with Interactive Map */}
          <div className="pt-2 border-t border-slate-200">
            <LocationPicker
              value={addressData}
              onChange={setAddressData}
              label="Pickup Location & Farm Gate Coordinates"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <span>Publish Listing to Marketplace</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
