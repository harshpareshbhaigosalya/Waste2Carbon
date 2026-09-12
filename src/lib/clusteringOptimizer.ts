// Smart Clustering & Logistics Route Optimizer for W2C
// Solves: High individual pickup logistics cost by grouping nearby waste generators into clusters
// and calculating optimal route sequence, total tonnage, economic value, and CO2 emissions saved.

export interface GeoLocation {
  latitude: number;
  longitude: number;
  label?: string;
}

export interface ClusterPoint {
  id: string; // listing_id or request_id
  producer_name: string;
  producer_phone: string;
  location_name: string;
  latitude: number;
  longitude: number;
  quantity_tons: number;
  waste_subcategory: string;
  proposed_date: string;
  price_per_ton: number;
  status: string;
  distance_from_facility_km?: number;
}

export interface WasteCluster {
  id: string;
  name: string; // e.g., "Karnal North Agricultural Hub"
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  totalQuantityTons: number;
  totalEconomicValueINR: number;
  totalCO2e: number;
  producersCount: number;
  points: ClusterPoint[];
  recommendedDate: string;
  status: 'available' | 'scheduled' | 'dispatched';
  scheduledDate?: string;
  optimizedRouteSequence: ClusterPoint[];
  estimatedTotalRouteDistanceKm: number;
  dieselSavedLiters: number;
}

// Haversine distance formula in kilometers
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
};

// Nearest Neighbor Route Sequencer (Traveling Salesperson heuristic starting from Facility)
export const optimizePickupRoute = (
  facilityLat: number,
  facilityLng: number,
  points: ClusterPoint[]
): { route: ClusterPoint[]; totalKm: number } => {
  if (points.length === 0) return { route: [], totalKm: 0 };
  if (points.length === 1) {
    const d = calculateDistanceKm(facilityLat, facilityLng, points[0].latitude, points[0].longitude);
    return { route: points, totalKm: Number((d * 2).toFixed(1)) }; // round trip
  }

  const unvisited = [...points];
  const orderedRoute: ClusterPoint[] = [];
  let currentLat = facilityLat;
  let currentLng = facilityLng;
  let totalKm = 0;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistanceKm(currentLat, currentLng, unvisited[i].latitude, unvisited[i].longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    const nextPoint = unvisited.splice(nearestIndex, 1)[0];
    totalKm += minDistance;
    orderedRoute.push(nextPoint);
    currentLat = nextPoint.latitude;
    currentLng = nextPoint.longitude;
  }

  // Return back to facility
  totalKm += calculateDistanceKm(currentLat, currentLng, facilityLat, facilityLng);

  return { route: orderedRoute, totalKm: Number(totalKm.toFixed(1)) };
};

// Generate Intelligent Clusters from listings or pickup requests
export const generateWasteClusters = (
  facilityLat: number,
  facilityLng: number,
  items: ClusterPoint[],
  maxClusterRadiusKm = 25
): WasteCluster[] => {
  if (items.length === 0) return [];

  // Group by geographical proximity (within maxClusterRadiusKm)
  const clusters: WasteCluster[] = [];
  const assigned = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (assigned.has(item.id)) continue;

    const clusterPoints: ClusterPoint[] = [item];
    assigned.add(item.id);

    for (let j = i + 1; j < items.length; j++) {
      const other = items[j];
      if (assigned.has(other.id)) continue;

      const dist = calculateDistanceKm(item.latitude, item.longitude, other.latitude, other.longitude);
      if (dist <= maxClusterRadiusKm) {
        clusterPoints.push(other);
        assigned.add(other.id);
      }
    }

    // Calculate cluster center
    const avgLat =
      clusterPoints.reduce((acc, p) => acc + p.latitude, 0) / clusterPoints.length;
    const avgLng =
      clusterPoints.reduce((acc, p) => acc + p.longitude, 0) / clusterPoints.length;

    const totalQty = clusterPoints.reduce((acc, p) => acc + p.quantity_tons, 0);
    const totalVal = clusterPoints.reduce(
      (acc, p) => acc + p.quantity_tons * (p.price_per_ton || 2500),
      0
    );

    // Approximate CO2e sequestration (1.45 tCO2e per ton of biomass average)
    const totalCO2 = Number((totalQty * 1.45).toFixed(1));

    // Optimize route
    const { route, totalKm } = optimizePickupRoute(facilityLat, facilityLng, clusterPoints);

    // Individual trips vs 1 aggregated multi-stop route calculation:
    // If truck went individually to each: 2 * distance to each point
    const individualDistanceKm = clusterPoints.reduce(
      (acc, p) => acc + 2 * calculateDistanceKm(facilityLat, facilityLng, p.latitude, p.longitude),
      0
    );
    const distanceSaved = Math.max(0, individualDistanceKm - totalKm);
    // Standard diesel truck consumes ~0.25 L per km
    const dieselSaved = Math.round(distanceSaved * 0.25);

    // Give a friendly name based on location
    const firstCity = item.location_name.split(',')[0].trim();
    const clusterName = `${firstCity} Cluster (${clusterPoints.length} Generators)`;

    // Common ready date (earliest date in group)
    const dates = clusterPoints.map((p) => p.proposed_date).filter(Boolean);
    dates.sort();
    const recommendedDate = dates[0] || new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

    clusters.push({
      id: `cluster-${i + 1}-${Date.now().toString().slice(-4)}`,
      name: clusterName,
      centerLat: Number(avgLat.toFixed(5)),
      centerLng: Number(avgLng.toFixed(5)),
      radiusKm: maxClusterRadiusKm,
      totalQuantityTons: Number(totalQty.toFixed(1)),
      totalEconomicValueINR: Math.round(totalVal),
      totalCO2e: totalCO2,
      producersCount: clusterPoints.length,
      points: clusterPoints,
      recommendedDate,
      status: 'available',
      optimizedRouteSequence: route,
      estimatedTotalRouteDistanceKm: totalKm,
      dieselSavedLiters: dieselSaved,
    });
  }

  // Sort clusters by largest aggregate tonnage first
  clusters.sort((a, b) => b.totalQuantityTons - a.totalQuantityTons);

  return clusters;
};
