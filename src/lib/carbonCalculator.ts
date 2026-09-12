import { WasteCategory, WasteUnit } from '../types';

export function calculateCarbonMetrics(
  category: WasteCategory,
  quantity: number,
  unit: WasteUnit
) {
  let tons = Number(quantity) || 0;
  if (unit === 'kg') {
    tons = quantity / 1000;
  } else if (unit === 'quintal') {
    tons = quantity / 10;
  }

  const safeTons = Math.max(0, tons);

  // Carbon factor per ton
  // Dry organic (crop residue / wheat straw / wood) -> Biochar pyrolysis fixes carbon permanently
  // Wet organic (food waste / manure) -> Anaerobic digestion stops landfill methane
  const factor = category === 'dry_organic' ? 1.32 : 1.58;
  const totalCO2e = Number((safeTons * factor).toFixed(2));
  
  // Indian Carbon Market Rate (~₹2,500 to ₹3,500 per verified tCO2e credit)
  const estimatedMarketValueINR = Number((totalCO2e * 2500).toFixed(0));

  const pathway = category === 'dry_organic' ? 'Biochar Pyrolysis' : 'Biogas Digester';

  return {
    tons: Number(safeTons.toFixed(2)),
    totalCO2e,
    carbonCredits: totalCO2e,
    estimatedMarketValueINR,
    estimatedMarketValueUSD: estimatedMarketValueINR, // stored in table column
    pathway,
  };
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0;
  const R = 6371;
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
}
