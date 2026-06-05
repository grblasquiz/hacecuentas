/**
 * Unit Converter — EN, audience global. Length, mass, volume (linear factors to a base unit)
 * plus temperature (special offset conversions). From/to must share a dimension.
 */
export interface Inputs {
  value: number | string;
  from_unit: string;
  to_unit: string;
}
export interface Outputs {
  result: number;
  conversion: string;
  _insight?: any;
}

const num = (v: number | string | undefined, d = NaN): number => {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// unit -> { dim, factor to base }. Base: length=m, mass=kg, volume=L.
const UNITS: Record<string, { dim: string; f: number; label: string }> = {
  m: { dim: 'length', f: 1, label: 'meters' },
  km: { dim: 'length', f: 1000, label: 'kilometers' },
  cm: { dim: 'length', f: 0.01, label: 'centimeters' },
  mm: { dim: 'length', f: 0.001, label: 'millimeters' },
  mi: { dim: 'length', f: 1609.344, label: 'miles' },
  yd: { dim: 'length', f: 0.9144, label: 'yards' },
  ft: { dim: 'length', f: 0.3048, label: 'feet' },
  in: { dim: 'length', f: 0.0254, label: 'inches' },
  kg: { dim: 'mass', f: 1, label: 'kilograms' },
  g: { dim: 'mass', f: 0.001, label: 'grams' },
  mg: { dim: 'mass', f: 0.000001, label: 'milligrams' },
  lb: { dim: 'mass', f: 0.45359237, label: 'pounds' },
  oz: { dim: 'mass', f: 0.028349523125, label: 'ounces' },
  st: { dim: 'mass', f: 6.35029318, label: 'stone' },
  l: { dim: 'volume', f: 1, label: 'liters' },
  ml: { dim: 'volume', f: 0.001, label: 'milliliters' },
  gal: { dim: 'volume', f: 3.785411784, label: 'US gallons' },
  qt: { dim: 'volume', f: 0.946352946, label: 'US quarts' },
  pt: { dim: 'volume', f: 0.473176473, label: 'US pints' },
  cup: { dim: 'volume', f: 0.2365882365, label: 'US cups' },
  floz: { dim: 'volume', f: 0.0295735295625, label: 'US fluid ounces' },
};

function toCelsius(v: number, u: string): number {
  if (u === 'C') return v;
  if (u === 'F') return (v - 32) * 5 / 9;
  return v - 273.15; // K
}
function fromCelsius(c: number, u: string): number {
  if (u === 'C') return c;
  if (u === 'F') return c * 9 / 5 + 32;
  return c + 273.15;
}
const TEMP = new Set(['C', 'F', 'K']);
const TEMP_LABEL: Record<string, string> = { C: '°C', F: '°F', K: 'K' };

export function unitConverter(i: Inputs): Outputs {
  const value = num(i.value);
  const from = String(i.from_unit || '');
  const to = String(i.to_unit || '');
  if (!Number.isFinite(value)) throw new Error('Enter a numeric value to convert');
  if (!from || !to) throw new Error('Pick a unit to convert from and to');

  let result: number, fromLabel: string, toLabel: string;
  if (TEMP.has(from) || TEMP.has(to)) {
    if (!(TEMP.has(from) && TEMP.has(to))) throw new Error('Temperature can only convert to another temperature unit');
    result = fromCelsius(toCelsius(value, from), to);
    fromLabel = TEMP_LABEL[from]; toLabel = TEMP_LABEL[to];
  } else {
    const a = UNITS[from], b = UNITS[to];
    if (!a || !b) throw new Error('Unknown unit');
    if (a.dim !== b.dim) throw new Error(`Can't convert ${a.label} (${a.dim}) to ${b.label} (${b.dim})`);
    result = (value * a.f) / b.f;
    fromLabel = a.label; toLabel = b.label;
  }

  const resultR = Math.round(result * 1e6) / 1e6;
  const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 6 });

  return {
    result: resultR,
    conversion: `${fmt(value)} ${fromLabel} = ${fmt(resultR)} ${toLabel}`,
    _insight: {
      title: 'Converted',
      text: `**${fmt(value)} ${fromLabel}** = **${fmt(resultR)} ${toLabel}**.`,
      tone: 'neutral',
      icon: '📐',
    },
  };
}
