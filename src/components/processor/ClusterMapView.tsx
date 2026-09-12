import React, { useState, useMemo, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import {
  Layers,
  MapPin,
  Navigation,
  Fuel,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Truck,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { WasteCluster, ClusterPoint } from '../../lib/clusteringOptimizer';

// Helper component to smoothly fit map bounds to active cluster & depot points
const MapBoundsFitter: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 12, { animate: true });
      return;
    }
    try {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 14, animate: true });
    } catch (e) {
      console.warn('Map bounds fit error:', e);
    }
  }, [points, map]);

  return null;
};

// Facility / Depot Industrial Icon
const createDepotIcon = (name: string) =>
  L.divIcon({
    className: 'custom-depot-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        <div style="
          background: linear-gradient(135deg, #1E4330, #2D5A43);
          color: #ffffff;
          border: 2px solid #E5C378;
          box-shadow: 0 4px 14px rgba(45, 90, 67, 0.45);
          border-radius: 12px;
          padding: 5px 9px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: system-ui, sans-serif;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        ">
          <span style="font-size: 14px;">🏭</span>
          <span>DEPOT · ${name.slice(0, 14)}</span>
        </div>
        <div style="width: 2px; height: 8px; background: #2D5A43;"></div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: #E5C378; border: 2px solid #1E4330; box-shadow: 0 0 8px #E5C378;"></div>
      </div>
    `,
    iconSize: [110, 48],
    iconAnchor: [55, 48],
  });

// Numbered Farmer Pickup Waypoint Marker
const createWaypointIcon = (index: number, tons: number) =>
  L.divIcon({
    className: 'custom-waypoint-marker',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="
          background: linear-gradient(135deg, #9A6A15, #D4A34F);
          color: #1C1E21;
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 12px rgba(154, 106, 21, 0.45);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: monospace;
          font-size: 13px;
          font-weight: 900;
        ">
          ${index}
        </div>
        <div style="
          background: #1C1E21;
          color: #E5C378;
          font-family: system-ui, sans-serif;
          font-size: 10px;
          font-weight: 800;
          padding: 1.5px 6px;
          border-radius: 6px;
          margin-top: 2px;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.15);
        ">
          +${tons} Tons
        </div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
  });

// Central Hub Anchor Icon
const createHubCenterIcon = (name: string, tons: number) =>
  L.divIcon({
    className: 'custom-hub-center-marker',
    html: `
      <div style="
        background: rgba(45, 90, 67, 0.92);
        backdrop-filter: blur(4px);
        color: #ffffff;
        border: 2px solid #E5C378;
        border-radius: 9999px;
        padding: 4px 10px;
        font-family: system-ui, sans-serif;
        font-size: 10px;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 3px 12px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #25D366;"></span>
        <span>${name} (${tons}T)</span>
      </div>
    `,
    iconSize: [120, 26],
    iconAnchor: [60, 13],
  });

export interface ClusterMapViewProps {
  clusters: WasteCluster[];
  selectedCluster: WasteCluster;
  facilityLocation: { lat: number; lng: number; name: string };
  onSelectCluster?: (cluster: WasteCluster) => void;
  heightClass?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const ClusterMapView: React.FC<ClusterMapViewProps> = ({
  clusters,
  selectedCluster,
  facilityLocation,
  onSelectCluster,
  heightClass = 'h-[440px] sm:h-[480px]',
  isExpanded = false,
  onToggleExpand,
}) => {
  const [mapStyle, setMapStyle] = useState<'voyager' | 'osm'>('voyager');
  const [showAllClusters, setShowAllClusters] = useState(true);

  // Tile layer URL
  const tileUrl =
    mapStyle === 'voyager'
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}.png';

  // Points for bounding fit (Depot + all waypoints in active cluster)
  const fitPoints = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [
      [facilityLocation.lat, facilityLocation.lng],
      [selectedCluster.centerLat, selectedCluster.centerLng],
    ];
    selectedCluster.optimizedRouteSequence.forEach((p) => {
      pts.push([p.latitude, p.longitude]);
    });
    return pts;
  }, [facilityLocation, selectedCluster]);

  // Optimal loop polyline coordinates: Facility -> Stop 1 -> Stop 2 ... -> Facility
  const routePolylineCoords = useMemo<[number, number][]>(() => {
    const coords: [number, number][] = [[facilityLocation.lat, facilityLocation.lng]];
    selectedCluster.optimizedRouteSequence.forEach((point) => {
      coords.push([point.latitude, point.longitude]);
    });
    coords.push([facilityLocation.lat, facilityLocation.lng]);
    return coords;
  }, [facilityLocation, selectedCluster]);

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden border border-[#D6CEC2] shadow-sm bg-[#FAF8F5] transition-all duration-300 ${
        isExpanded ? 'fixed inset-4 z-60 h-[calc(100vh-32px)] shadow-2xl' : heightClass
      }`}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-1000 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Badge: GIS Operational HUD */}
        <div className="bg-[#1C1E21]/90 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl border border-white/15 shadow-md flex items-center gap-2.5 pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#E5C378] block leading-none">
              GIS Routing Engine
            </span>
            <span className="text-xs font-black text-white">
              {selectedCluster.name} · {selectedCluster.radiusKm} km Hub
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 bg-[#FAF8F5]/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#E7E1D7] shadow-md pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowAllClusters(!showAllClusters)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              showAllClusters
                ? 'bg-[#2D5A43] text-white shadow-2xs'
                : 'bg-white text-[#575B62] hover:text-[#1C1E21] border border-[#E7E1D7]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Hubs</span>
          </button>

          <button
            type="button"
            onClick={() => setMapStyle(mapStyle === 'voyager' ? 'osm' : 'voyager')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#575B62] hover:text-[#1C1E21] border border-[#E7E1D7] transition flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-[#9A6A15]" />
            <span className="hidden sm:inline">{mapStyle === 'voyager' ? 'Carto Voyager' : 'OpenStreetMap'}</span>
          </button>

          {onToggleExpand && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-2 rounded-xl bg-white text-[#575B62] hover:text-[#1C1E21] border border-[#E7E1D7] transition cursor-pointer"
              title={isExpanded ? 'Collapse Map' : 'Expand Fullscreen'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Leaflet Map Component */}
      <MapContainer
        center={[selectedCluster.centerLat, selectedCluster.centerLng]}
        zoom={12}
        className="w-full h-full z-0"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
        />

        {/* Auto-fitter */}
        <MapBoundsFitter points={fitPoints} />

        {/* 1. All other cluster radii if enabled */}
        {showAllClusters &&
          clusters
            .filter((c) => c.id !== selectedCluster.id)
            .map((c) => (
              <React.Fragment key={c.id}>
                <Circle
                  center={[c.centerLat, c.centerLng]}
                  radius={c.radiusKm * 1000}
                  pathOptions={{
                    color: '#828892',
                    fillColor: '#9A6A15',
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: '4, 6',
                  }}
                  eventHandlers={{
                    click: () => onSelectCluster && onSelectCluster(c),
                  }}
                />
                <Marker
                  position={[c.centerLat, c.centerLng]}
                  icon={createHubCenterIcon(c.name, c.totalQuantityTons)}
                  eventHandlers={{
                    click: () => onSelectCluster && onSelectCluster(c),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <strong className="text-[#1C1E21] block">{c.name}</strong>
                      <p className="text-[#575B62]">
                        {c.producersCount} Stops · {c.totalQuantityTons} Tons Payload
                      </p>
                      <button
                        onClick={() => onSelectCluster && onSelectCluster(c)}
                        className="mt-1 px-2.5 py-1 bg-[#2D5A43] text-white rounded-lg text-[10px] font-bold block cursor-pointer"
                      >
                        Switch Focus
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

        {/* 2. Active Cluster Radius Ring (Highlight circle with double ring) */}
        <Circle
          center={[selectedCluster.centerLat, selectedCluster.centerLng]}
          radius={selectedCluster.radiusKm * 1000}
          pathOptions={{
            color: '#2D5A43',
            fillColor: '#2D5A43',
            fillOpacity: 0.16,
            weight: 2.5,
            dashArray: '6, 8',
          }}
        />

        {/* Subtle Pulse Inner Boundary */}
        <Circle
          center={[selectedCluster.centerLat, selectedCluster.centerLng]}
          radius={selectedCluster.radiusKm * 500}
          pathOptions={{
            color: '#D4A34F',
            fillColor: '#D4A34F',
            fillOpacity: 0.06,
            weight: 1,
            dashArray: '2, 4',
          }}
        />

        {/* 3. Optimal Path Shadow Polyline (elevation depth) */}
        <Polyline
          positions={routePolylineCoords}
          pathOptions={{
            color: '#1E4330',
            weight: 8,
            opacity: 0.22,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* 4. Active Smart Polyline Route */}
        <Polyline
          positions={routePolylineCoords}
          pathOptions={{
            color: '#059669',
            weight: 4.5,
            opacity: 0.95,
            dashArray: '8, 6',
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* 5. Central Hub Center Marker */}
        <Marker
          position={[selectedCluster.centerLat, selectedCluster.centerLng]}
          icon={createHubCenterIcon(selectedCluster.name, selectedCluster.totalQuantityTons)}
        >
          <Popup>
            <div className="p-2 space-y-1 text-xs text-[#1C1E21]">
              <span className="text-[10px] font-black uppercase text-[#9A6A15] block">
                Cluster Geographic Centroid
              </span>
              <strong className="text-sm font-black">{selectedCluster.name}</strong>
              <p className="text-[#575B62]">
                Aggregation Zone: {selectedCluster.radiusKm} km radius · {selectedCluster.producersCount} farm sources
              </p>
              <div className="pt-1 font-mono font-bold text-[#2D5A43]">
                Total Load: {selectedCluster.totalQuantityTons} Metric Tons
              </div>
            </div>
          </Popup>
        </Marker>

        {/* 6. Facility HQ Depot Marker */}
        <Marker
          position={[facilityLocation.lat, facilityLocation.lng]}
          icon={createDepotIcon(facilityLocation.name)}
        >
          <Popup>
            <div className="p-2 space-y-1 text-xs text-[#1C1E21]">
              <span className="text-[10px] font-black uppercase text-[#2D5A43] block">
                Origin & Return Logistics Depot
              </span>
              <strong className="text-sm font-black">{facilityLocation.name}</strong>
              <p className="text-[#575B62]">
                Weighbridge Intake Bay & Thermal Bioreactor Receiving Dock
              </p>
              <div className="text-[11px] text-[#828892] font-mono">
                Coordinates: {facilityLocation.lat.toFixed(4)}, {facilityLocation.lng.toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>

        {/* 7. Waypoint Stops Markers */}
        {selectedCluster.optimizedRouteSequence.map((point, idx) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={createWaypointIcon(idx + 1, point.quantity_tons)}
          >
            <Popup>
              <div className="p-2 space-y-1.5 text-xs text-[#1C1E21] min-w-[200px]">
                <div className="flex items-center justify-between gap-2 border-b border-[#E7E1D7] pb-1">
                  <span className="text-[10px] font-bold bg-[#F4EDE2] text-[#9A6A15] px-2 py-0.5 rounded-md">
                    Stop #{idx + 1}
                  </span>
                  <span className="font-mono font-bold text-[#2D5A43]">
                    +{point.quantity_tons} Tons
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-[#1C1E21]">{point.producer_name}</h4>
                  <p className="text-[#575B62] text-[11px]">{point.location_name}</p>
                </div>

                <div className="bg-[#FAF8F5] p-1.5 rounded-lg border border-[#E7E1D7] text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-[#828892]">Item:</span>
                    <strong className="text-[#1C1E21]">{point.waste_subcategory}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#828892]">Phone:</span>
                    <span className="font-mono font-semibold text-[#1C1E21]">{point.producer_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#828892]">Ready Date:</span>
                    <span className="font-semibold text-[#1C1E21]">{point.proposed_date}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Bottom Telemetry HUD Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-1000 pointer-events-none">
        <div className="bg-[#1C1E21]/90 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl border border-white/15 shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pointer-events-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#D7DFD8] block">Loop Distance</span>
            <span className="text-sm sm:text-base font-black text-white font-mono flex items-center justify-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>{selectedCluster.estimatedTotalRouteDistanceKm} km</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#D7DFD8] block">Consolidated Load</span>
            <span className="text-sm sm:text-base font-black text-emerald-400 font-mono flex items-center justify-center gap-1">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{selectedCluster.totalQuantityTons} Tons</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#D7DFD8] block">Diesel Saved</span>
            <span className="text-sm sm:text-base font-black text-[#E5C378] font-mono flex items-center justify-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-[#E5C378]" />
              <span>{selectedCluster.dieselSavedLiters} L (~₹{(selectedCluster.dieselSavedLiters * 92).toLocaleString('en-IN')})</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#D7DFD8] block">CO2e Sequestration</span>
            <span className="text-sm sm:text-base font-black text-emerald-300 font-mono flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>{selectedCluster.totalCO2e} Tons</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
