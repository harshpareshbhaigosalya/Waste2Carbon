// MapView.jsx
// Standalone GIS map component for CircuLoop.
// Renders waste generators and conversion facilities as markers using react-leaflet.
//
// Not yet wired into the app — safe to drop into src/components/ without
// affecting existing routes or state until you import and mount it.
//
// Requires: npm install leaflet react-leaflet

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Example shape of the data this component expects.
// Replace with real data from the backend /api/listings and /api/facilities endpoints.
const sampleGenerators = [
  { id: "g1", name: "Patel Farms", lat: 23.0225, lng: 72.5714, wasteType: "Dry organic (crop residue)" },
  { id: "g2", name: "Riverside Dairy", lat: 23.0410, lng: 72.5297, wasteType: "Wet organic (manure)" },
];

const sampleFacilities = [
  { id: "f1", name: "GreenChar Biochar Unit", lat: 23.0330, lng: 72.5850, accepts: "Dry organic" },
  { id: "f2", name: "Ahmedabad Biogas Plant", lat: 23.0100, lng: 72.5500, accepts: "Wet organic" },
];

export default function MapView({
  generators = sampleGenerators,
  facilities = sampleFacilities,
  center = [23.0225, 72.5714],
  zoom = 12,
}) {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: "500px", width: "100%" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {generators.map((g) => (
        <CircleMarker
          key={g.id}
          center={[g.lat, g.lng]}
          radius={8}
          pathOptions={{ color: "#2D6A4F", fillColor: "#74C69D", fillOpacity: 0.9 }}
        >
          <Popup>
            <strong>{g.name}</strong>
            <br />
            Waste type: {g.wasteType}
          </Popup>
        </CircleMarker>
      ))}

      {facilities.map((f) => (
        <Marker key={f.id} position={[f.lat, f.lng]}>
          <Popup>
            <strong>{f.name}</strong>
            <br />
            Accepts: {f.accepts}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}