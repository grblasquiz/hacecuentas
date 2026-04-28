export interface Inputs {
  age: number;
  resting_hr: number;
  formula: string;
}

export interface Outputs {
  hr_max: number;
  hr_reserve: number;
  zone1: string;
  zone2: string;
  zone3: string;
  zone4: string;
  zone5: string;
}

// Porcentajes de FC de Reserva para cada zona (método Karvonen)
// Fuente: Karvonen MJ et al. (1957), AHA Target Heart Rates (2024)
const ZONES: Array<{ name: string; low: number; high: number }> = [
  { name: "Z1", low: 0.50, high: 0.60 },
  { name: "Z2", low: 0.60, high: 0.70 },
  { name: "Z3", low: 0.70, high: 0.80 },
  { name: "Z4", low: 0.80, high: 0.90 },
  { name: "Z5", low: 0.90, high: 1.00 },
];

function calcHrMax(age: number, formula: string): number {
  if (formula === "tanaka") {
    // Tanaka H et al. (2001): 208 − 0.7 × edad
    return Math.round(208 - 0.7 * age);
  }
  // Estándar: 220 − edad
  return Math.round(220 - age);
}

function formatZone(low: number, high: number): string {
  return `${low} – ${high} bpm`;
}

export function compute(i: Inputs): Outputs {
  const age = Math.round(Number(i.age) || 0);
  const restingHr = Math.round(Number(i.resting_hr) || 0);
  const formula = i.formula || "standard";

  // Validaciones defensivas
  if (age <= 0 || age > 120) {
    return {
      hr_max: 0,
      hr_reserve: 0,
      zone1: "Ingresa una edad válida (1–120 años)",
      zone2: "—",
      zone3: "—",
      zone4: "—",
      zone5: "—",
    };
  }

  if (restingHr <= 0 || restingHr > 220) {
    return {
      hr_max: 0,
      hr_reserve: 0,
      zone1: "Ingresa una FC en reposo válida (20–220 bpm)",
      zone2: "—",
      zone3: "—",
      zone4: "—",
      zone5: "—",
    };
  }

  const hrMax = calcHrMax(age, formula);
  const hrReserve = hrMax - restingHr;

  if (hrReserve <= 0) {
    return {
      hr_max: hrMax,
      hr_reserve: 0,
      zone1: "La FC en reposo no puede ser mayor o igual a la FCmáx",
      zone2: "—",
      zone3: "—",
      zone4: "—",
      zone5: "—",
    };
  }

  // Calcular límites de cada zona: (FCR × %) + FC_reposo
  const zoneValues = ZONES.map((z) => ({
    low: Math.round(hrReserve * z.low + restingHr),
    high: Math.round(hrReserve * z.high + restingHr),
  }));

  return {
    hr_max: hrMax,
    hr_reserve: hrReserve,
    zone1: formatZone(zoneValues[0].low, zoneValues[0].high),
    zone2: formatZone(zoneValues[1].low, zoneValues[1].high),
    zone3: formatZone(zoneValues[2].low, zoneValues[2].high),
    zone4: formatZone(zoneValues[3].low, zoneValues[3].high),
    zone5: formatZone(zoneValues[4].low, zoneValues[4].high),
  };
}
