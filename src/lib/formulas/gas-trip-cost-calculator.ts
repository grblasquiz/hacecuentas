export interface Inputs {
  unit_system: string; // 'imperial' | 'metric'
  distance: number;    // miles (imperial) or km (metric)
  efficiency: number;  // MPG (imperial) or L/100km (metric)
  gas_price: number;   // USD per gallon (imperial) or per liter (metric)
  passengers: number;  // number of people splitting cost
}

export interface Outputs {
  fuel_needed: number;      // gallons or liters
  total_cost: number;       // total fuel cost in user currency
  cost_per_person: number;  // total_cost / passengers
  summary: string;          // human-readable trip summary
}

// Reference: EIA national avg regular gas price, early 2026
const DEFAULT_GAS_PRICE_USD_PER_GAL = 3.45;
// Reference: EPA 2025 model year fleet average combined
const AVG_MPG_2026 = 28;

export function compute(i: Inputs): Outputs {
  const unitSystem = i.unit_system === 'metric' ? 'metric' : 'imperial';
  const distance = Number(i.distance) || 0;
  const efficiency = Number(i.efficiency) || 0;
  const gasPrice = Number(i.gas_price) || 0;
  const passengers = Math.max(1, Math.round(Number(i.passengers) || 1));

  // Guard: invalid inputs
  if (distance <= 0 || efficiency <= 0 || gasPrice <= 0) {
    return {
      fuel_needed: 0,
      total_cost: 0,
      cost_per_person: 0,
      summary: 'Please enter valid distance, fuel efficiency, and gas price.',
    };
  }

  let fuelNeeded: number;
  let fuelUnit: string;
  let distanceUnit: string;
  let efficiencyLabel: string;
  let priceUnit: string;

  if (unitSystem === 'imperial') {
    // Gallons needed = miles / MPG
    fuelNeeded = distance / efficiency;
    fuelUnit = 'gal';
    distanceUnit = 'mi';
    efficiencyLabel = `${efficiency.toFixed(1)} MPG`;
    priceUnit = '/gal';
  } else {
    // Liters needed = km * (L/100km / 100)
    fuelNeeded = distance * (efficiency / 100);
    fuelUnit = 'L';
    distanceUnit = 'km';
    efficiencyLabel = `${efficiency.toFixed(1)} L/100km`;
    priceUnit = '/L';
  }

  const totalCost = fuelNeeded * gasPrice;
  const costPerPerson = totalCost / passengers;

  // Build summary string
  const fuelRounded = fuelNeeded.toFixed(2);
  const totalRounded = totalCost.toFixed(2);
  const perPersonRounded = costPerPerson.toFixed(2);

  let summary =
    `${distance.toLocaleString()} ${distanceUnit} at ${efficiencyLabel} → ` +
    `${fuelRounded} ${fuelUnit} of fuel → $${totalRounded} total`;

  if (passengers > 1) {
    summary += ` → $${perPersonRounded} per person (${passengers} passengers)`;
  }

  return {
    fuel_needed: Math.round(fuelNeeded * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
    cost_per_person: Math.round(costPerPerson * 100) / 100,
    summary,
  };
}
