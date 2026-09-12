// geoClustering.js
// Standalone utility for CircuLoop's clustering engine.
// Groups nearby waste listings of compatible types so a pickup route
// only triggers once a cluster crosses a minimum viable volume.
//
// Pure functions, no external dependencies — safe to import anywhere
// (or leave unused) without touching existing app logic.

const EARTH_RADIUS_KM = 6371;

/** Haversine distance between two lat/lng points, in kilometers. */
function distanceKm(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/**
 * Groups listings into clusters using simple radius-based grouping.
 *
 * @param {Array} listings - [{ id, lat, lng, wasteType, quantityTons }, ...]
 * @param {Object} options
 * @param {number} options.radiusKm - max distance between listings in a cluster
 * @param {number} options.minVolumeTons - minimum combined volume to trigger a pickup
 * @returns {Array} clusters - [{ listings, totalTons, ready }]
 */
export function clusterListings(listings, { radiusKm = 15, minVolumeTons = 5 } = {}) {
  const byType = {};
  for (const item of listings) {
    byType[item.wasteType] = byType[item.wasteType] || [];
    byType[item.wasteType].push(item);
  }

  const clusters = [];

  for (const wasteType of Object.keys(byType)) {
    const remaining = [...byType[wasteType]];

    while (remaining.length) {
      const seed = remaining.shift();
      const group = [seed];

      for (let i = remaining.length - 1; i >= 0; i--) {
        if (distanceKm(seed, remaining[i]) <= radiusKm) {
          group.push(remaining[i]);
          remaining.splice(i, 1);
        }
      }

      const totalTons = group.reduce((sum, g) => sum + (g.quantityTons || 0), 0);
      clusters.push({
        wasteType,
        listings: group,
        totalTons,
        ready: totalTons >= minVolumeTons,
      });
    }
  }

  return clusters;
}

// Example usage (not executed unless you run this file directly):
if (require.main === module) {
  const demo = [
    { id: "1", lat: 23.02, lng: 72.57, wasteType: "dry", quantityTons: 2 },
    { id: "2", lat: 23.03, lng: 72.58, wasteType: "dry", quantityTons: 2.5 },
    { id: "3", lat: 23.5, lng: 72.9, wasteType: "dry", quantityTons: 1 },
  ];
  console.log(clusterListings(demo, { radiusKm: 10, minVolumeTons: 4 }));
}