import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Flame, Droplets, Sprout, Navigation, Star, Phone } from 'lucide-react';

// Custom modern SVG icons using L.divIcon
const createCustomIcon = (bgColor: string, borderColor: string, iconHtml: string) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background: ${bgColor};
        border: 2px solid ${borderColor};
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.6);
        cursor: pointer;
      ">
        ${iconHtml}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

const producerIcon = createCustomIcon(
  '#059669',
  '#34d399',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>'
);

const biocharIcon = createCustomIcon(
  '#d97706',
  '#fbbf24',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3.5z"/></svg>'
);

const biogasIcon = createCustomIcon(
  '#0284c7',
  '#38bdf8',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'
);

const compostIcon = createCustomIcon(
  '#16a34a',
  '#4ade80',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
);

interface MapViewProps {
  highlightedListingId?: string;
  onSelectProcessor?: (processorId: string) => void;
  heightClass?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  highlightedListingId,
  onSelectProcessor,
  heightClass = 'h-[450px]',
}) => {
  const { listings, processors, pickupRequests } = useApp();

  // Center coordinate around Delhi / NCR region where sample coords are anchored
  const defaultCenter: [number, number] = [28.6139, 77.2090];

  // Active collection routes (matched or accepted requests)
  const activeRoutes = pickupRequests
    .filter((req) => req.status === 'accepted' || req.status === 'in_transit')
    .map((req) => {
      const listing = listings.find((l) => l.id === req.listing_id);
      const proc = processors.find((p) => p.id === req.processor_id);
      if (listing && proc) {
        return {
          id: req.id,
          positions: [
            [listing.latitude, listing.longitude] as [number, number],
            [proc.latitude, proc.longitude] as [number, number],
          ],
          label: `${listing.producer_name} → ${proc.name}`,
        };
      }
      return null;
    })
    .filter(Boolean) as { id: string; positions: [number, number][]; label: string }[];

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-800 shadow-2xl`}>
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Processor Facilities */}
        {processors.map((proc) => {
          let icon = biocharIcon;
          if (proc.facility_type === 'biogas') icon = biogasIcon;
          if (proc.facility_type === 'compost') icon = compostIcon;

          return (
            <React.Fragment key={proc.id}>
              {/* Operating cluster coverage radius circle */}
              <Circle
                center={[proc.latitude, proc.longitude]}
                radius={proc.operating_radius_km * 400} // visual display scaled
                pathOptions={{
                  color: proc.facility_type === 'biochar' ? '#f59e0b' : '#0284c7',
                  fillColor: proc.facility_type === 'biochar' ? '#f59e0b' : '#0284c7',
                  fillOpacity: 0.08,
                  weight: 1,
                  dashArray: '4, 4',
                }}
              />
              <Marker position={[proc.latitude, proc.longitude]} icon={icon}>
                <Popup>
                  <div className="p-1 space-y-2 text-slate-100 max-w-xs">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100">{proc.name}</span>
                      </div>
                      {proc.is_verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p>
                        <span className="text-slate-400">Type: </span>
                        <span className="capitalize font-semibold text-emerald-300">{proc.facility_type} Facility</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Buying Price: </span>
                        <span className="font-bold text-amber-400">${proc.price_per_ton}/ton</span>
                      </p>
                      <p>
                        <span className="text-slate-400">Monthly Capacity: </span>
                        <span>{proc.current_utilization_tons} / {proc.capacity_tons_per_month} tons</span>
                      </p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-300">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {proc.rating}
                        </span>
                        <span>👥 {proc.active_sellers_count} sellers</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{proc.contact_phone}</span>
                      </div>
                    </div>

                    {onSelectProcessor && (
                      <button
                        onClick={() => onSelectProcessor(proc.id)}
                        className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-1.5 px-3 rounded-lg transition"
                      >
                        Request Pickup
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {/* Waste Producer Listings */}
        {listings.map((list) => {
          return (
            <Marker key={list.id} position={[list.latitude, list.longitude]} icon={producerIcon}>
              <Popup>
                <div className="p-1 space-y-2 text-slate-100 max-w-xs">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                    <span className="font-bold text-sm text-slate-100">{list.title}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                      {list.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>
                      <span className="text-slate-400">Producer: </span>
                      <span className="font-medium text-slate-200">{list.producer_name}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Quantity: </span>
                      <span className="font-bold text-white">{list.quantity} {list.unit} ({list.quantity_in_tons} tons)</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Expected Ready: </span>
                      <span className="text-amber-300 font-medium">{list.expected_ready_date}</span>
                    </p>
                    <div className="bg-emerald-950/70 p-1.5 rounded-lg border border-emerald-900 mt-1">
                      <p className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                        <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                        Est. Sequestration: {list.estimated_co2_sequestered} tCO2e
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Active Collection Routes */}
        {activeRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.positions}
            pathOptions={{
              color: '#10b981',
              weight: 3,
              dashArray: '6, 8',
              opacity: 0.9,
            }}
          />
        ))}
      </MapContainer>

      {/* Map Legend & Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-xs space-y-1.5 shadow-lg max-w-[200px] sm:max-w-xs">
        <p className="font-bold text-slate-200 text-[11px] tracking-wider uppercase">GIS Network Legend</p>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-400 shrink-0"></span>
          <span>Waste Producer / Farm</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-400 shrink-0"></span>
          <span>Biochar Pyrolysis Facility</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-3 h-3 rounded-full bg-sky-500 border border-sky-400 shrink-0"></span>
          <span>Biogas / Digester Plant</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-300">
          <span className="w-4 h-0.5 bg-emerald-400 shrink-0 border-t border-dashed border-emerald-300"></span>
          <span>Active Collection Route</span>
        </div>
      </div>
    </div>
  );
};
