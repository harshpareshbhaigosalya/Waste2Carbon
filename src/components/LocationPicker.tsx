import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Search, MapPin, Crosshair, Loader2 } from 'lucide-react';
import { AddressData } from '../types';

// Clean SVG pin for Leaflet
const pinIcon = L.divIcon({
  className: 'custom-pin-marker',
  html: `
    <div style="
      background: #047857;
      border: 3px solid #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: grab;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: #fbbf24;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

interface LocationPickerProps {
  value: AddressData;
  onChange: (data: AddressData) => void;
  label?: string;
}

// Map events handler component for click-to-pin
const MapClickHandler: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({
  onLocationSelect,
}) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Map flyTo controller
const MapFlyTo: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMapEvents({});
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1 });
  }, [center, map]);
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  label = 'Location Details',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Safe coordinates
  const currentPos: [number, number] = [
    value.latitude && !isNaN(value.latitude) ? value.latitude : 28.6139,
    value.longitude && !isNaN(value.longitude) ? value.longitude : 77.2090,
  ];

  // Reverse geocode lat/lng to get address components from OpenStreetMap Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const city = addr.city || addr.town || addr.village || addr.county || addr.district || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';
        const street = addr.road || addr.suburb || addr.neighbourhood || value.street_address || '';

        onChange({
          street_address: street || value.street_address,
          city: city || value.city,
          state: state || value.state,
          pincode: pincode || value.pincode,
          formatted_address: data.display_name || `${street}, ${city}, ${state}`,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
        });
      } else {
        onChange({
          ...value,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
        });
      }
    } catch (e) {
      onChange({
        ...value,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
      });
    }
  };

  // Forward geocode search query
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await res.json();

      if (results && results.length > 0) {
        const item = results[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);
        const addr = item.address || {};

        const city = addr.city || addr.town || addr.village || addr.county || addr.district || '';
        const state = addr.state || '';
        const pincode = addr.postcode || '';
        const street = addr.road || addr.suburb || value.street_address || searchQuery;

        onChange({
          street_address: street,
          city: city || value.city,
          state: state || value.state,
          pincode: pincode || value.pincode,
          formatted_address: item.display_name || `${street}, ${city}, ${state}`,
          latitude: Number(lat.toFixed(6)),
          longitude: Number(lng.toFixed(6)),
        });
      } else {
        setSearchError('Location not found. Try searching a city, district, or landmark.');
      }
    } catch (err) {
      setSearchError('Search service momentarily busy. You can click on the map to pin.');
    } finally {
      setIsSearching(false);
    }
  };

  // Browser GPS auto-locate
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsGeolocating(false);
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsGeolocating(false);
        alert('GPS access denied or unavailable. Please search or drop a pin on the map.');
      }
    );
  };

  const handleFieldChange = (field: keyof AddressData, val: string) => {
    const updated = {
      ...value,
      [field]: val,
    };
    updated.formatted_address = [
      updated.street_address,
      updated.city,
      updated.state ? `${updated.state} - ${updated.pincode}` : updated.pincode,
    ]
      .filter(Boolean)
      .join(', ');
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1C1E21] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#2D5A43]" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={handleUseGPS}
          disabled={isGeolocating}
          className="text-[11px] font-bold text-[#2D5A43] hover:text-[#1E4330] flex items-center gap-1 bg-[#FAF8F5] border border-[#2D5A43]/30 px-2.5 py-1 rounded-xl transition disabled:opacity-50 cursor-pointer"
        >
          {isGeolocating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Crosshair className="w-3 h-3" />}
          <span>{isGeolocating ? 'Detecting GPS...' : 'Use Current GPS'}</span>
        </button>
      </div>

      {/* Structured Address Form Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-medium text-[#828892] mb-1">
            Street Address / Farm Gate / Industrial Plot No. <span className="text-[#2D5A43]">*</span>
          </label>
          <input
            type="text"
            value={value.street_address}
            onChange={(e) => handleFieldChange('street_address', e.target.value)}
            required
            placeholder="e.g. Farm Gate 3, Canal Road, Plot 42"
            className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#828892] mb-1">
            City / Town / District <span className="text-[#2D5A43]">*</span>
          </label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            required
            placeholder="e.g. Karnal, Nashik, Ludhiana"
            className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#828892] mb-1">
            State / Region <span className="text-[#2D5A43]">*</span>
          </label>
          <input
            type="text"
            value={value.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            required
            placeholder="e.g. Haryana, Maharashtra, Punjab"
            className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#828892] mb-1">
            Pincode / Postal Code <span className="text-[#2D5A43]">*</span>
          </label>
          <input
            type="text"
            value={value.pincode}
            onChange={(e) => handleFieldChange('pincode', e.target.value)}
            required
            placeholder="e.g. 132001"
            className="w-full bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3.5 py-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43] focus:bg-white transition"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#828892] mb-1">
            Pin Coordinates (GPS)
          </label>
          <div className="bg-[#FAF8F5] border border-[#E7E1D7] rounded-xl px-3 py-2 text-xs font-mono text-[#2D5A43] flex items-center justify-between">
            <span>{value.latitude?.toFixed(4)}° N, {value.longitude?.toFixed(4)}° E</span>
            <span className="text-[10px] text-[#828892] font-sans font-medium">Auto-pinned</span>
          </div>
        </div>
      </div>

      {/* Map Search & Pin-Drop Container */}
      <div className="space-y-2.5 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E7E1D7]">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#1C1E21]">
            Interactive Geo-Pin (Drag pin or click map to recalibrate)
          </span>
          <span className="text-[10px] text-[#828892]">Click anywhere to move pin</span>
        </div>

        {/* Place Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#828892]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search city, village, landmark or pincode..."
              className="w-full bg-[#FFFFFF] border border-[#E7E1D7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1C1E21] focus:outline-none focus:border-[#2D5A43]"
            />
          </div>
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-[#2D5A43] hover:bg-[#1E4330] text-white font-bold text-xs px-4 py-2 rounded-xl transition disabled:opacity-50 flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Locate'}
          </button>
        </div>

        {searchError && (
          <p className="text-[11px] text-rose-600">{searchError}</p>
        )}

        {/* Leaflet Map */}
        <div className="w-full h-44 rounded-xl overflow-hidden border border-[#E7E1D7] relative z-0 mt-2 shadow-inner">
          <MapContainer
            center={currentPos}
            zoom={12}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            <MapFlyTo center={currentPos} />
            <MapClickHandler
              onLocationSelect={(lat, lng) => {
                reverseGeocode(lat, lng);
              }}
            />
            <Marker
              position={currentPos}
              icon={pinIcon}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target;
                  const pos = marker.getLatLng();
                  reverseGeocode(pos.lat, pos.lng);
                },
              }}
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};
