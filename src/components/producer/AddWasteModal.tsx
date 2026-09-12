import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  Calculator,
  ShieldCheck,
  Star,
  Phone,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WasteCategory, WasteUnit, MoistureLevel, ProcessorInfo } from '../../types';
import { calculateCarbonMetrics, calculateDistanceKm } from '../../lib/carbonCalculator';

interface AddWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS: {
  value: WasteCategory;
  label: string;
  subtypes: { value: string; label: string }[];
  description: string;
  badge: string;
}[] = [
  {
    value: 'dry_organic',
    label: 'Dry Organic (Biochar Ready)',
    badge: 'Pyrolysis Pathway',
    description: 'Crop residue, stalks, straw, wood chips, husks. High fixed carbon potential.',
    subtypes: [
      { value: 'crop_residue', label: 'Crop Residue (Wheat / Rice Straw)' },
      { value: 'corn_stalks', label: 'Corn Stover & Stalks' },
      { value: 'wood_chips', label: 'Wood Chips & Tree Prunings' },
      { value: 'rice_husk', label: 'Rice Husk & Seed Shells' },
      { value: 'bagasse', label: 'Sugarcane Bagasse' },
    ],
  },
  {
    value: 'wet_organic',
    label: 'Wet Organic (Biogas Ready)',
    badge: 'Anaerobic Digestion',
    description: 'Food waste, fruit/vegetable scraps, animal manure. High methane avoidance.',
    subtypes: [
      { value: 'food_waste', label: 'Commercial & Canteen Food Waste' },
      { value: 'vegetable_peels', label: 'Market Vegetable & Fruit Scraps' },
      { value: 'dairy_manure', label: 'Dairy Cattle & Poultry Manure' },
      { value: 'brewery_sludge', label: 'Organic Sludge & Slurry' },
    ],
  },
  {
    value: 'industrial_organic',
    label: 'Industrial Organic (High Density)',
    badge: 'Circular Valorization',
    description: 'Spent brewery grain, processing mash, textile/paper fibers.',
    subtypes: [
      { value: 'spent_grain', label: 'Spent Brewery Grain & Mash' },
      { value: 'press_mud', label: 'Sugar Mill Press Mud' },
      { value: 'coffee_grounds', label: 'Commercial Coffee Grounds' },
      { value: 'paper_mill_sludge', label: 'De-inked Paper Sludge' },
    ],
  },
];

export const AddWasteModal: React.FC<AddWasteModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, processors, addListing, sendPickupRequest } = useApp();

  const [category, setCategory] = useState<WasteCategory>('dry_organic');
  const [subcategory, setSubcategory] = useState<string>('crop_residue');
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState<WasteUnit>('ton');
  const [moisture, setMoisture] = useState<MoistureLevel>('medium');
  const [expectedDate, setExpectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [locationAddress, setLocationAddress] = useState<string>(
    currentUser?.address || 'GreenField Agri Estate, Sector 12'
  );
  const [latitude, setLatitude] = useState<number>(currentUser?.latitude || 28.6280);
  const [longitude, setLongitude] = useState<number>(currentUser?.longitude || 77.1950);
  const [notes, setNotes] = useState<string>('');
  const [selectedProcessorId, setSelectedProcessorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Dynamic real-time carbon calculation
  const carbonMetrics = useMemo(() => {
    return calculateCarbonMetrics(category, quantity, unit, moisture);
  }, [category, quantity, unit, moisture]);

  // Nearby & recommended processors matching this waste category
  const matchingProcessors = useMemo(() => {
    return processors
      .filter((p) => p.accepted_categories.includes(category))
      .map((p) => {
        const distance = calculateDistanceKm(latitude, longitude, p.latitude, p.longitude);
        const withinRadius = distance <= p.operating_radius_km;
        return {
          ...p,
          distanceKm: distance,
          withinRadius,
          isRecommended: withinRadius && p.rating >= 4.8,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [processors, category, latitude, longitude]);

  // Set default selected processor if none selected
  React.useEffect(() => {
    if (matchingProcessors.length > 0 && !selectedProcessorId) {
      setSelectedProcessorId(matchingProcessors[0].id);
    }
  }, [matchingProcessors, selectedProcessorId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedSubtypeObj = CATEGORY_OPTIONS.find((c) => c.value === category)?.subtypes.find(
        (s) => s.value === subcategory
      );
      const title = `${quantity} ${unit.toUpperCase()} of ${selectedSubtypeObj?.label || 'Organic Biomass'}`;

      const newListing = await addListing({
        title,
        waste_category: category,
        waste_subcategory: subcategory,
        quantity,
        unit,
        quantity_in_tons: carbonMetrics.tons,
        moisture_level: moisture,
        expected_ready_date: expectedDate,
        location_address: locationAddress,
        latitude,
        longitude,
        estimated_co2_sequestered: carbonMetrics.totalCO2e,
        estimated_credit_value: carbonMetrics.estimatedMarketValueUSD,
        notes,
      });

      // Send pickup request if processor selected
      if (selectedProcessorId) {
        await sendPickupRequest(newListing.id, selectedProcessorId, notes);
      }

      setSubmittedSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmittedSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">List Waste & Calculate Carbon Value</h2>
              <p className="text-xs text-slate-400">
                Connect feedstock with certified biochar or biogas conversion facilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {submittedSuccess ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white">Waste Listed & Matched!</h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Your listing of <strong className="text-emerald-400">{carbonMetrics.tons} tons</strong> has been posted. A pickup request has been routed to the selected conversion facility.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Category & Subtype */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Waste Stream Classification
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <div
                      key={cat.value}
                      onClick={() => {
                        setCategory(cat.value);
                        setSubcategory(cat.subtypes[0].value);
                      }}
                      className={`cursor-pointer p-4 rounded-xl border transition-all text-left ${
                        category === cat.value
                          ? 'bg-emerald-950/60 border-emerald-500 shadow-md shadow-emerald-950/50'
                          : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-300 border border-slate-700">
                          {cat.badge}
                        </span>
                        {category === cat.value && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <h4 className="font-bold text-sm text-white mt-2">{cat.label}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{cat.description}</p>
                    </div>
                  ))}
                </div>

                {/* Subcategory dropdown */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Specific Feedstock Type
                  </label>
                  <select
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORY_OPTIONS.find((c) => c.value === category)?.subtypes.map((sub) => (
                      <option key={sub.value} value={sub.value}>
                        {sub.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Quantity, Units, Moisture, Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as WasteUnit)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ton">Metric Tons (t)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="quintal">Quintals (100kg)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Moisture Level</label>
                  <select
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value as MoistureLevel)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low (&lt;20% - Ideal Biochar)</option>
                    <option value="medium">Medium (20-60%)</option>
                    <option value="high">High (&gt;60% - Ideal Biogas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Expected Ready Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                      required
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Real-time Carbon Calculation Box */}
              <div className="bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950/60 p-4 rounded-xl border border-emerald-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Carbon Sequestration Model (IPCC Factor)</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700 font-medium">
                    Pathway: {carbonMetrics.recommendedPathway}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase">Input Feedstock</p>
                    <p className="text-base sm:text-lg font-bold text-white mt-0.5">
                      {carbonMetrics.tons} <span className="text-xs font-normal text-slate-400">tons</span>
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase">Avoided Methane</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
                      {carbonMetrics.landfillAvoidanceCO2} <span className="text-xs font-normal text-slate-400">tCO2e</span>
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase">Net Sequestration</p>
                    <p className="text-base sm:text-lg font-bold text-teal-300 mt-0.5">
                      {carbonMetrics.sequestrationCO2} <span className="text-xs font-normal text-slate-400">tCO2e</span>
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-lg border border-emerald-800/80 bg-emerald-950/30">
                    <p className="text-[10px] text-emerald-300 uppercase font-semibold">Certified Credits</p>
                    <p className="text-base sm:text-lg font-extrabold text-emerald-300 mt-0.5">
                      {carbonMetrics.carbonCredits} <span className="text-xs font-normal">Credits</span>
                    </p>
                    <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                      ~${carbonMetrics.estimatedMarketValueUSD} Value
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800">
                  {carbonMetrics.explanation}
                </p>
              </div>

              {/* Location and Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Pickup Location / Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                      required
                      placeholder="e.g. Farm Gate 4, Sector 12"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Additional Instructions / Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Baled in 500kg bundles, moisture tested"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Step 3: Recommended & Nearby Processors */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Nearby & Recommended Conversion Facilities
                    </h4>
                    <p className="text-xs text-slate-400">
                      Matched by waste attributes, distance, and verified capacity
                    </p>
                  </div>
                  <span className="text-xs font-medium text-emerald-400">
                    {matchingProcessors.length} Facilities Available
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchingProcessors.map((proc) => {
                    const isSelected = selectedProcessorId === proc.id;
                    return (
                      <div
                        key={proc.id}
                        onClick={() => setSelectedProcessorId(proc.id)}
                        className={`cursor-pointer p-3.5 rounded-xl border transition-all text-left relative ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500/50'
                            : 'bg-slate-800/70 border-slate-700/80 hover:border-slate-600'
                        }`}
                      >
                        {proc.isRecommended && (
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                            ★ Recommended
                          </span>
                        )}

                        <div className="flex items-start gap-2.5 pr-16">
                          <div className="w-4 h-4 rounded-full border border-slate-500 flex items-center justify-center mt-0.5 shrink-0">
                            {isSelected && <div className="w-2 h-2 rounded-full bg-emerald-400" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="font-bold text-sm text-white">{proc.name}</h5>
                              {proc.is_verified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 capitalize">
                              {proc.facility_type} Conversion Plant
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Offer Price</span>
                            <span className="font-bold text-emerald-300">${proc.price_per_ton}/ton</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Distance</span>
                            <span className="font-medium text-slate-200">{proc.distanceKm} km</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Sellers</span>
                            <span className="text-slate-300">👥 {proc.active_sellers_count}</span>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            {proc.rating} Rating
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {proc.contact_phone}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition disabled:opacity-50"
                >
                  <Truck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Routing...' : 'Confirm Listing & Send Pickup Request'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
