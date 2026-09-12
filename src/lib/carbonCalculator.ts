import { WasteCategory, WasteUnit, MoistureLevel, CarbonCalculationResult } from '../types';

/**
 * IPCC & Verra Biochar Methodology compliant Carbon Sequestration Engine
 * Calculates:
 * 1. Methane avoidance from diverted landfilling / open-field crop burning
 * 2. Net stable carbon sequestration (Biochar recalcitrance or Biogas clean offset)
 * 3. Net Carbon Credits (1 Credit = 1 metric ton CO2e)
 * 4. Estimated monetary value ($40/credit baseline)
 */
export function calculateCarbonMetrics(
  category: WasteCategory,
  quantity: number,
  unit: WasteUnit,
  moisture: MoistureLevel = 'medium'
): CarbonCalculationResult {
  // 1. Convert to metric tons
  let tons = quantity;
  if (unit === 'kg') {
    tons = quantity / 1000;
  } else if (unit === 'quintal') {
    tons = quantity / 10;
  }

  // Prevent negative or zero
  const safeTons = Math.max(0, tons);

  // Moisture factor adjustments
  let dryMatterRatio = 0.65;
  if (moisture === 'low') dryMatterRatio = 0.85;
  if (moisture === 'high') dryMatterRatio = 0.35;

  let landfillAvoidancePerTon = 0;
  let sequestrationPerTon = 0;
  let recommendedPathway: CarbonCalculationResult['recommendedPathway'] = 'Biochar Pyrolysis';
  let explanation = '';

  switch (category) {
    case 'dry_organic':
      // Pyrolysis to Biochar Pathway
      // Biochar has high permanence (100-1000+ years carbon sink)
      landfillAvoidancePerTon = 0.48; // Avoids open burning / field decay
      sequestrationPerTon = 0.82 * (dryMatterRatio / 0.7); // Direct biochar fixed carbon
      recommendedPathway = 'Biochar Pyrolysis';
      explanation = 'Optimal for high-temperature pyrolysis. Fixes raw organic carbon into permanent biochar for soil regeneration and 100+ year sequestration.';
      break;

    case 'wet_organic':
      // Anaerobic Digestion to Biogas Pathway
      // Prevents high-potency fugitive methane (CH4) emissions from wet landfill degradation
      landfillAvoidancePerTon = 1.28; // High methane avoidance
      sequestrationPerTon = 0.38; // Fossil fuel displacement via biomethane & bio-fertilizer
      recommendedPathway = 'Anaerobic Biogas Digestion';
      explanation = 'Ideal for anaerobic digestion. Captures fugitive methane to generate renewable electricity or biomethane, diverting potent greenhouse gases from landfills.';
      break;

    case 'industrial_organic':
      // High-volume industrial organic pathway (spent grain, bagasse, pulp)
      landfillAvoidancePerTon = 0.72;
      sequestrationPerTon = 0.68;
      recommendedPathway = 'Industrial Valorization';
      explanation = 'High thermal and organic density. Can be converted into activated carbon, engineered biochar, or industrial thermal energy.';
      break;
  }

  const landfillAvoidanceCO2 = Number((safeTons * landfillAvoidancePerTon).toFixed(2));
  const sequestrationCO2 = Number((safeTons * sequestrationPerTon).toFixed(2));
  const totalCO2e = Number((landfillAvoidanceCO2 + sequestrationCO2).toFixed(2));
  const carbonCredits = totalCO2e;
  
  // Baseline carbon credit price: $38 - $45 per ton of verified biochar/methane avoidance credit
  const estimatedMarketValueUSD = Number((carbonCredits * 42).toFixed(2));

  return {
    tons: Number(safeTons.toFixed(2)),
    landfillAvoidanceCO2,
    sequestrationCO2,
    totalCO2e,
    carbonCredits,
    estimatedMarketValueUSD,
    recommendedPathway,
    explanation,
  };
}

/**
 * Haversine formula to compute distance in kilometers between two GPS coordinates
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
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
