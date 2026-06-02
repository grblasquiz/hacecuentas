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
  _insight?: any;
  _chart?: any;
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

  // Objetivo aeróbico: 75% de la reserva (centro de Z3), siempre dentro de las zonas y por debajo de FCmáx
  const objetivoAerobico = Math.round(hrReserve * 0.75 + restingHr);

  return {
    hr_max: hrMax,
    hr_reserve: hrReserve,
    zone1: formatZone(zoneValues[0].low, zoneValues[0].high),
    zone2: formatZone(zoneValues[1].low, zoneValues[1].high),
    zone3: formatZone(zoneValues[2].low, zoneValues[2].high),
    zone4: formatZone(zoneValues[3].low, zoneValues[3].high),
    zone5: formatZone(zoneValues[4].low, zoneValues[4].high),
    _insight: {
      title: 'Tus zonas de entrenamiento',
      text: `Tu FCmáx es **${hrMax} bpm** y tu reserva cardíaca **${hrReserve} bpm**. La base aeróbica (Z2-Z3) va de **${zoneValues[1].low} a ${zoneValues[2].high} bpm**: ahí pasás la mayor parte del tiempo. Las zonas 4-5 (${zoneValues[3].low} bpm en adelante) son para intervalos cortos.`,
      tone: 'neutral',
      icon: '🏃',
    },
    _chart: {
      type: 'scale',
      marker: objetivoAerobico,
      markerLabel: `Aeróbico ${objetivoAerobico}`,
      min: restingHr,
      segments: [
        { nombre: 'Z1', max: zoneValues[0].high, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Z2', max: zoneValues[1].high, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Z3', max: zoneValues[2].high, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Z4', max: zoneValues[3].high, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Z5 (FCmáx)', max: zoneValues[4].high, color: '#ef4444', colorDark: '#f87171' },
      ],
      ariaLabel: `Zonas de entrenamiento Karvonen de ${restingHr} a ${hrMax} bpm; objetivo aeróbico en ${objetivoAerobico} bpm`,
    },
  };
}
