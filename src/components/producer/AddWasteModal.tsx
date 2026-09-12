import React, { useState, useMemo } from 'react';
import { X, Sprout, CheckCircle2, DollarSign, Calendar, MapPin, Truck, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WasteCategory, WasteUnit } from '../../types';
import { calculateCarbonMetrics } from '../../lib/carbonCalculator';

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
  const [address, setAddress] = useState(currentUser?.address || '');
  const [selectedProcessorId, setSelectedProcessorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carbon calculation in real-time
  const carbon = useMemo(() => {
    return calculateCarbonMetrics(category, quantity, unit);
  }, [category, quantity, unit]);

  // Find all registered processors on the platform that accept this waste
  const availableProcessors = useMemo(() => {
    return allUsers.filter(
      (u) => u.role === 'processor' && (!u.accepted_categories || u.accepted_categories.includes(category))
    );
  }, [allUsers, category]);

  // Select first processor by default if available
  React.useEffect(() => {
    if (availableProcessors.length > 0 && !selectedProcessorId) {
      setSelectedProcessorId(availableProcessors[0].id);
    }
  }, [availableProcessors, selectedProcessorId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const title = `${quantity} ${unit.toUpperCase()} of ${subcategoryName}`;
    await addListing({
      title,
      waste_category: category,
      waste_subcategory: subcategoryName,
      quantity,
      unit,
      expected_ready_date: expectedDate,
      location_address: address,
      processor_id: selectedProcessorId || undefined,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sell Waste & Claim Carbon Credits</h2>
              <p className="text-xs text-slate-400">List your organic feedstock for nearby facility pickup</p>
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
          {/* Step 1: Waste Type */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              1. What Type of Waste Do You Have?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => {
                  setCategory('dry_organic');
                  setSubcategoryName('Crop Residue / Stubble');
                }}
                className={`cursor-pointer p-3.5 rounded-2xl border text-left transition ${
                  category === 'dry_organic'
                    ? 'bg-emerald-950/70 border-emerald-500 text-white'
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
                    ? 'bg-amber-950/70 border-amber-500 text-white'
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
              placeholder="e.g. Wheat Straw Bales, Rice Husks, Tomato Waste"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 mt-2"
            />
          </div>

          {/* Step 2: Quantity and Unit */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
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
          </div>

          {/* Real-Time Carbon Value Preview Card */}
          <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">🌱 Carbon Impact Calculation</span>
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
                <span className="text-[10px] text-slate-400 block uppercase">Est. Carbon Credits</span>
                <span className="text-lg font-extrabold text-white">
                  {carbon.carbonCredits} <span className="text-xs font-normal text-emerald-400">Credits</span>
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Date & Pickup Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expected Date Ready
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pickup Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Farm gate or pickup location"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Choose Registered Nearby Facility */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Choose Registered Buyer / Processor
              </label>
              <span className="text-[11px] text-emerald-400 font-medium">
                {availableProcessors.length} Processor(s) Registered
              </span>
            </div>

            {availableProcessors.length === 0 ? (
              <div className="bg-slate-950 border border-dashed border-slate-800 p-4 rounded-2xl text-center space-y-1">
                <p className="text-slate-300 font-semibold">No processor profile created yet.</p>
                <p className="text-[11px] text-slate-500">
                  Your waste will be listed as "Available" on the platform. Any processor can view and claim it!
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
                        📍 {proc.address || 'Local Region'} · 📞 {proc.phone || 'Phone verified'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-extrabold text-amber-400">
                        ${proc.price_per_ton || 45}
                      </span>
                      <span className="text-[10px] text-slate-400 block">/ ton paid to you</span>
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition flex items-center gap-2"
            >
              <Truck className="w-4 h-4" />
              <span>{isSubmitting ? 'Posting...' : 'List Waste & Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
