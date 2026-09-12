import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Sprout,
  CheckCircle2,
  Calendar,
  Truck,
  AlertCircle,
  Loader2,
  Camera,
  Upload,
  Trash2,
  Layers,
  Sparkles,
  ShieldCheck,
  Video,
  Eye,
} from 'lucide-react';
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

  // Quality Inspection State
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [qualityGrade, setQualityGrade] = useState<
    'Grade A (Low Moisture)' | 'Grade B (Standard)' | 'Grade C (Mixed / High Moisture)'
  >('Grade B (Standard)');
  const [qualityNotes, setQualityNotes] = useState('');

  // Live Camera Stream State
  const [showLiveCam, setShowLiveCam] = useState(false);
  const [camError, setCamError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Hidden file/camera inputs
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Destination option: 'marketplace' or 'specific'
  const [allocationMode, setAllocationMode] = useState<'marketplace' | 'specific'>('specific');
  const [selectedProcessorId, setSelectedProcessorId] = useState<string>('');

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
      (u) =>
        u.role === 'processor' &&
        (!u.facility_type ||
          (category === 'dry_organic' ? u.facility_type === 'biochar' : u.facility_type === 'biogas'))
    );
  }, [allUsers, category]);

  // Default select first processor if available
  useEffect(() => {
    if (availableProcessors.length > 0 && !selectedProcessorId) {
      setSelectedProcessorId(availableProcessors[0].id);
    }
  }, [availableProcessors, selectedProcessorId]);

  // Stop camera when modal unmounts or live cam closes
  const stopLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowLiveCam(false);
  };

  useEffect(() => {
    return () => {
      stopLiveCamera();
    };
  }, []);

  if (!isOpen) return null;

  // Start live webcam view
  const startLiveCamera = async () => {
    setCamError('');
    setShowLiveCam(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Live camera error:', err);
      setCamError('Unable to open live webcam stream. Please use the "Take Photo" button or upload file.');
      setShowLiveCam(false);
      // Fallback: trigger native camera input
      cameraInputRef.current?.click();
    }
  };

  // Capture snapshot from live video stream
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      setPhotoUrl(dataUrl);
    }
    stopLiveCamera();
  };

  // Compress image file to lightweight Base64
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPhotoUrl(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

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
    const destinationProcessorId =
      allocationMode === 'specific' && selectedProcessorId ? selectedProcessorId : undefined;

    const res = await addListing({
      title,
      waste_category: category,
      waste_subcategory: subcategoryName,
      quantity,
      unit,
      expected_ready_date: expectedDate,
      addressData,
      processor_id: destinationProcessorId,
      photo_url: photoUrl || undefined,
      quality_grade: qualityGrade,
      quality_notes: qualityNotes.trim() || undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#1C1E21]/50 backdrop-blur-xs animate-in fade-in duration-200 selection:bg-[#2D5A43] selection:text-white">
      <div className="relative w-full max-w-2xl bg-white border border-[#E7E1D7] rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E7E1D7] bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#2D5A43] text-white flex items-center justify-center font-bold shadow-2xs">
              <Sprout className="w-5 h-5 text-[#E5C378]" />
            </div>
            <div>
              <h3 className="font-black text-lg text-[#1C1E21]">List Organic Waste Batch</h3>
              <p className="text-xs text-[#575B62]">
                Upload actual quality photos and negotiate optimal rates with verified plants
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopLiveCamera();
              onClose();
            }}
            className="p-1.5 rounded-xl text-[#828892] hover:text-[#1C1E21] hover:bg-[#F8F5EE] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6">
          {errorMessage && (
            <div className="bg-[#FBEAE9] border border-[#F5C2C0] text-[#9E2A2B] text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {camError && (
            <div className="bg-[#FDF6E2] border border-[#EED99E] text-[#855B09] text-xs p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#9A6A15]" />
              <span>{camError}</span>
            </div>
          )}

          {successNotice && (
            <div className="bg-[#EDF6F0] border border-[#BCE1C8] text-[#1D5E34] text-xs p-3 rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Section 1: Quality Inspection Photo (In-App Camera) */}
          <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1E21] uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#9A6A15]" />
                <span>1. Waste Quality Photo (Camera Inspection)</span>
              </label>
              <span className="text-[11px] text-[#855B09] font-bold bg-[#FDF6E2] border border-[#EED99E] px-2 py-0.5 rounded-full">
                Enables Fair Quality-Based Price Negotiation
              </span>
            </div>

            <p className="text-xs text-[#575B62]">
              Capture or upload actual photos of your crop residue or slurry so buyers can inspect purity, moisture, and agree on fair pricing before pickup.
            </p>

            {/* Live Camera Viewfinder if active */}
            {showLiveCam && (
              <div className="relative rounded-2xl overflow-hidden bg-black border border-[#D6CEC2] aspect-video flex flex-col items-center justify-center">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute bottom-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Snapshot</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopLiveCamera}
                    className="bg-[#1C1E21]/80 hover:bg-[#1C1E21] text-white text-xs px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Photo Preview if captured */}
            {photoUrl && !showLiveCam ? (
              <div className="relative rounded-2xl overflow-hidden border border-[#2D5A43] bg-white p-2 flex items-center gap-4">
                <img
                  src={photoUrl}
                  alt="Waste Inspection"
                  className="w-28 h-24 object-cover rounded-xl border border-[#E7E1D7] shrink-0 shadow-2xs"
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1D5E34] font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-[#2D5A43]" />
                    <span>Quality Photo Attached</span>
                  </div>
                  <p className="text-[11px] text-[#575B62]">
                    Buyers will inspect this image to verify moisture and purity during price negotiations.
                  </p>
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="text-xs font-bold text-[#9E2A2B] hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove & Retake Photo
                  </button>
                </div>
              </div>
            ) : !showLiveCam ? (
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Native Smartphone Camera input */}
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageFile}
                />
                {/* Regular File Upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFile}
                />

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9A6A15] hover:bg-[#7D540E] text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-white" />
                  <span>Open Camera / Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={startLiveCamera}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs shadow-2xs transition cursor-pointer"
                >
                  <Video className="w-4 h-4 text-white" />
                  <span>Live Webcam</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F8F5EE] text-[#1C1E21] font-bold text-xs border border-[#E7E1D7] transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#828892]" />
                  <span>Upload Image</span>
                </button>
              </div>
            ) : null}

            {/* Quality Grade Options */}
            <div className="pt-2 border-t border-[#E7E1D7] space-y-2">
              <label className="block text-xs font-bold text-[#1C1E21]">Self-Assessed Quality Condition</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    grade: 'Grade A (Low Moisture)',
                    desc: 'Sun-dried, <12% moisture, clean straw',
                  },
                  {
                    grade: 'Grade B (Standard)',
                    desc: 'Fresh harvest, 12-20% moisture',
                  },
                  {
                    grade: 'Grade C (Mixed / High Moisture)',
                    desc: 'Wet or mixed residue, >20% moisture',
                  },
                ].map((item) => (
                  <button
                    key={item.grade}
                    type="button"
                    onClick={() => setQualityGrade(item.grade as any)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      qualityGrade === item.grade
                        ? 'border-[#2D5A43] bg-white shadow-2xs ring-1 ring-[#2D5A43]/20'
                        : 'border-[#E7E1D7] bg-white/70 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[#1C1E21]">{item.grade}</span>
                    <span className="text-[10px] text-[#828892]">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Quality Notes */}
              <div>
                <input
                  type="text"
                  value={qualityNotes}
                  onChange={(e) => setQualityNotes(e.target.value)}
                  placeholder="Optional quality notes (e.g. baled into 25kg bundles, stored indoors)"
                  className="w-full bg-white border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs text-[#1C1E21] placeholder:text-[#828892] focus:outline-none focus:border-[#2D5A43]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Waste Category & Type */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#1C1E21] uppercase tracking-wider">
              2. Waste Category & Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setCategory('dry_organic');
                  setSubcategoryName('Crop Residue / Stubble');
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  category === 'dry_organic'
                    ? 'border-[#2D5A43] bg-[#EDF6F0]/60 shadow-2xs ring-1 ring-[#2D5A43]/20'
                    : 'border-[#E7E1D7] hover:border-[#D6CEC2] bg-[#FAF8F5]'
                }`}
              >
                <span className="font-bold text-sm block text-[#1C1E21]">Dry Biomass / Stubble</span>
                <span className="text-[11px] text-[#575B62]">Paddy straw, bagasse, stalks & wood chips (Biochar)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('wet_organic');
                  setSubcategoryName('Cattle Dung / Slurry');
                }}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                  category === 'wet_organic'
                    ? 'border-[#9A6A15] bg-[#FDF6E2]/60 shadow-2xs ring-1 ring-[#9A6A15]/20'
                    : 'border-[#E7E1D7] hover:border-[#D6CEC2] bg-[#FAF8F5]'
                }`}
              >
                <span className="font-bold text-sm block text-[#1C1E21]">Wet / Slurry Waste</span>
                <span className="text-[11px] text-[#575B62]">Cattle dung, food pulp, press-mud (Biogas & Bio-CNG)</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1E21] mb-1">
                Waste Subcategory Description
              </label>
              <input
                type="text"
                value={subcategoryName}
                onChange={(e) => setSubcategoryName(e.target.value)}
                required
                placeholder="e.g. Wheat Straw, Sugarcane Bagasse, Dairy Slurry"
                className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white"
              />
            </div>
          </div>

          {/* Section 3: Quantity & Expected Date */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#1C1E21] uppercase tracking-wider">
              3. Quantity & Pickup Schedule
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#575B62] mb-1">Quantity</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  required
                  className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#575B62] mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as WasteUnit)}
                  className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium text-[#1C1E21] focus:outline-none focus:border-[#2D5A43]"
                >
                  <option value="ton">Metric Tons (t)</option>
                  <option value="quintal">Quintals (q)</option>
                  <option value="kg">Kilograms (kg)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#575B62] mb-1">Ready for Pickup By</label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  required
                  className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43]"
                />
              </div>
            </div>

            {/* Environmental & Market Value Summary */}
            <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#828892] font-medium block">CO2e Sequestration Potential</span>
                <span className="text-lg font-black text-[#2D5A43] tabular-nums">
                  {carbon.totalCO2e} <span className="text-xs font-normal">Tons CO2e</span>
                </span>
                <span className="text-[10px] text-[#1D5E34] block font-semibold mt-0.5">
                  Eligible for ~{carbon.carbonCredits} Carbon Credits
                </span>
              </div>

              <div>
                <span className="text-[#828892] font-medium block">Baseline Economic Value</span>
                <span className="text-lg font-black text-[#9A6A15] tabular-nums">
                  ₹{carbon.estimatedMarketValueINR.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-[#855B09] block font-semibold mt-0.5">
                  Open for interactive two-way negotiation!
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Choose Destination: Open Marketplace vs Specific Processor */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E21] flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#2D5A43]" />
              <span>4. Listing Allocation & Negotiation Mode</span>
            </label>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => setAllocationMode('marketplace')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  allocationMode === 'marketplace'
                    ? 'border-[#2D5A43] bg-[#EDF6F0]/60 font-bold'
                    : 'border-[#E7E1D7] bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <span className="text-xs text-[#1C1E21] block font-black">Open Marketplace</span>
                <span className="text-[10px] text-[#575B62]">
                  Allow multiple nearby facilities to inspect photos and bid/negotiate
                </span>
              </button>

              <button
                type="button"
                onClick={() => setAllocationMode('specific')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                  allocationMode === 'specific'
                    ? 'border-[#2D5A43] bg-[#EDF6F0]/60 font-bold'
                    : 'border-[#E7E1D7] bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <span className="text-xs text-[#1C1E21] block font-black">Select Specific Facility</span>
                <span className="text-[10px] text-[#575B62]">
                  Directly send to one plant and negotiate price privately
                </span>
              </button>
            </div>

            {allocationMode === 'specific' && (
              <>
                {availableProcessors.length === 0 ? (
                  <p className="text-xs text-[#575B62] italic p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E1D7]">
                    No matching verified processors in database yet. Listing will be posted to open marketplace.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {availableProcessors.map((proc) => (
                      <label
                        key={proc.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                          selectedProcessorId === proc.id
                            ? 'border-[#2D5A43] bg-[#EDF6F0]/60 shadow-2xs'
                            : 'border-[#E7E1D7] hover:border-[#D6CEC2] bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="radio"
                            name="processorSelection"
                            checked={selectedProcessorId === proc.id}
                            onChange={() => setSelectedProcessorId(proc.id)}
                            className="text-[#2D5A43] focus:ring-[#2D5A43]"
                          />
                          <div>
                            <p className="font-bold text-xs text-[#1C1E21]">{proc.full_name}</p>
                            <p className="text-[11px] text-[#828892]">
                              {proc.city ? `${proc.city}, ${proc.state}` : proc.formatted_address || 'India'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#828892] block">Baseline Rate</span>
                          <span className="font-black text-[#2D5A43] text-sm tabular-nums">
                            ₹{proc.price_per_ton ? proc.price_per_ton.toLocaleString('en-IN') : '2,500'}/t
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Section 5: Location Picker with Interactive Map */}
          <div className="pt-2 border-t border-[#E7E1D7]">
            <LocationPicker
              value={addressData}
              onChange={setAddressData}
              label="5. Pickup Location & Farm Gate Coordinates"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-[#E7E1D7] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                stopLiveCamera();
                onClose();
              }}
              className="px-4 py-2 text-xs text-[#575B62] hover:text-[#1C1E21] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <span>Publish Waste Listing</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

