export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Boiler power per room — S × O × A × Z × 85
 * Formula widely used in residential HVAC sizing (Spain/Latin America).
 * Reference: caloryfrio.com, calefaccionygassaiz.com
 *
 * S  = room area (m²)
 * O  = orientation factor: Norte/N=1.12, Sur/S=0.92, Este-Oeste/EO=1.00
 * A  = insulation factor:  bien=0.93, sencillo=1.00, sin=1.10
 * Z  = climate zone factor: A=0.88, B=0.95, C=1.04, D=1.12, E=1.19
 *      (Código Técnico de la Edificación, Spain)
 *      EN equivalents mapped: mild=0.88, moderate=0.95, average=1.04, cold=1.12, very-cold=1.19
 * 85 = base specific heat load (W/m²), valid for ceiling height ≤ 2.5 m
 *
 * Ceiling height correction: if ceiling > 2.5 m, multiply result by (h / 2.5)
 *
 * Output: potenciaW (watts), potenciaKw (kW, 2 decimals), resumen (text)
 */

const ORIENTATION_FACTOR: Record<string, number> = {
  norte: 1.12, north: 1.12,
  este: 1.00,  east: 1.00,
  oeste: 1.00, west: 1.00,
  sur: 0.92,   south: 0.92,
};

const INSULATION_FACTOR: Record<string, number> = {
  bien: 0.93,     good: 0.93,
  sencillo: 1.00, standard: 1.00,
  sin: 1.10,      none: 1.10,
};

const ZONE_FACTOR: Record<string, number> = {
  a: 0.88, mild: 0.88,
  b: 0.95, moderate: 0.95,
  c: 1.04, average: 1.04,
  d: 1.12, cold: 1.12,
  e: 1.19, 'very-cold': 1.19,
};

export function calderaPotenciaKwAmbienteMetros(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const area = Math.max(0, Number(i.area) || 0);

  const orientKey = String(i.orientacion || i.orientation || 'este').toLowerCase().trim();
  const insulKey  = String(i.aislamiento || i.insulation || 'sencillo').toLowerCase().trim();
  const zoneKey   = String(i.zona || i.zone || 'c').toLowerCase().trim();
  const altura    = Math.max(0, Number(i.altura) || 2.5);

  const O = ORIENTATION_FACTOR[orientKey] ?? 1.00;
  const A = INSULATION_FACTOR[insulKey]   ?? 1.00;
  const Z = ZONE_FACTOR[zoneKey]          ?? 1.04;

  // Base power (W), valid for h ≤ 2.5 m
  let potenciaW = area * O * A * Z * 85;

  // Ceiling height correction: extra volume above 2.5 m
  if (altura > 2.5) {
    potenciaW *= altura / 2.5;
  }

  const potenciaKw = potenciaW / 1000;
  const kwRounded  = Math.ceil(potenciaKw * 10) / 10; // round up to nearest 0.1 kW
  // Safety margin recommendation: +20%
  const kwConMargen = Math.ceil(potenciaKw * 1.2 * 10) / 10;

  // Orientation label
  const orientLabel: Record<string, { es: string; en: string }> = {
    norte:  { es: 'Norte', en: 'North' },
    north:  { es: 'Norte', en: 'North' },
    sur:    { es: 'Sur',   en: 'South' },
    south:  { es: 'Sur',   en: 'South' },
    este:   { es: 'Este',  en: 'East/West' },
    east:   { es: 'Este',  en: 'East/West' },
    oeste:  { es: 'Oeste', en: 'East/West' },
    west:   { es: 'Oeste', en: 'East/West' },
  };
  const insulLabel: Record<string, { es: string; en: string }> = {
    bien:     { es: 'Buen aislamiento',     en: 'Good insulation' },
    good:     { es: 'Buen aislamiento',     en: 'Good insulation' },
    sencillo: { es: 'Aislamiento estándar', en: 'Standard insulation' },
    standard: { es: 'Aislamiento estándar', en: 'Standard insulation' },
    sin:      { es: 'Sin aislamiento',      en: 'No insulation' },
    none:     { es: 'Sin aislamiento',      en: 'No insulation' },
  };
  const zoneLabel: Record<string, { es: string; en: string }> = {
    a:          { es: 'Zona A (muy suave)', en: 'Zone A (very mild)' },
    mild:       { es: 'Zona A (muy suave)', en: 'Zone A (very mild)' },
    b:          { es: 'Zona B (suave)',     en: 'Zone B (mild)' },
    moderate:   { es: 'Zona B (suave)',     en: 'Zone B (mild)' },
    c:          { es: 'Zona C (media)',     en: 'Zone C (average)' },
    average:    { es: 'Zona C (media)',     en: 'Zone C (average)' },
    d:          { es: 'Zona D (fría)',      en: 'Zone D (cold)' },
    cold:       { es: 'Zona D (fría)',      en: 'Zone D (cold)' },
    e:          { es: 'Zona E (muy fría)',  en: 'Zone E (very cold)' },
    'very-cold':{ es: 'Zona E (muy fría)',  en: 'Zone E (very cold)' },
  };

  const oL = orientLabel[orientKey]?.[__lang] ?? orientKey;
  const aL = insulLabel[insulKey]?.[__lang]   ?? insulKey;
  const zL = zoneLabel[zoneKey]?.[__lang]     ?? zoneKey;
  const ceilNote = altura > 2.5
    ? (__lang === 'en' ? ` (corrected for ${altura} m ceiling)` : ` (corregido por techo de ${altura} m)`)
    : '';

  const resumen = __lang === 'en'
    ? `${area} m² · ${oL} · ${aL} · ${zL}${ceilNote} → **${kwRounded.toFixed(1)} kW** needed. With 20% safety margin: **${kwConMargen.toFixed(1)} kW** (recommended boiler size).`
    : `${area} m² · ${oL} · ${aL} · ${zL}${ceilNote} → necesitás **${kwRounded.toFixed(1)} kW**. Con margen de seguridad del 20%: **${kwConMargen.toFixed(1)} kW** (potencia mínima de caldera recomendada).`;

  const insightTitle = __lang === 'en' ? 'Boiler Power Required' : 'Potencia de caldera necesaria';
  const insightText  = __lang === 'en'
    ? `This room needs **${kwRounded.toFixed(1)} kW** of heating output. Select a boiler rated at least **${kwConMargen.toFixed(1)} kW** (calculated power + 20% safety margin). Formula: ${area} m² × ${O} × ${A} × ${Z} × 85 W/m² = ${Math.round(potenciaW)} W.`
    : `Este ambiente necesita **${kwRounded.toFixed(1)} kW** de potencia calorífica. Elegí una caldera de al menos **${kwConMargen.toFixed(1)} kW** (potencia calculada + 20% de margen). Fórmula: ${area} m² × ${O} × ${A} × ${Z} × 85 W/m² = ${Math.round(potenciaW)} W.`;

  return {
    resultado:   `${kwRounded.toFixed(1)} kW`,
    resumen,
    _insight: {
      title: insightTitle,
      text:  insightText,
      tone:  'info',
      icon:  '🔥',
    },
  };
}
