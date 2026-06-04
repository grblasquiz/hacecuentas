export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Ceramic tile adhesive bags calculator
 * Real formula: Bags = ceil(area × consumption_kg_m2 × (1 + waste_pct)) / bag_weight_kg
 *
 * Consumption rates (kg/m²) by tile format and application method:
 * Source: Weber/Klaukol technical data sheets (Sika Argentina) + IRAM 45062
 *   - Small tiles ≤30×30 cm, single coat:  3.0 kg/m²  (6×6 mm notch trowel)
 *   - Medium tiles 30–60 cm, single coat:  4.5 kg/m²  (8×8 mm notch trowel)
 *   - Large tiles ≥60 cm, single coat:     6.0 kg/m²  (12×12 mm notch trowel)
 *   - Large tiles ≥60 cm, double coat:     9.0 kg/m²  (substrate + back-buttering)
 *   - Custom: user-supplied kg/m² value
 *
 * Standard bag weight in Argentina: 25 kg
 * Standard waste margin: 10 % (increases to 15 % for complex cuts if selected)
 */

const CONSUMPTION_BY_FORMAT: Record<string, number> = {
  small:        3.0,   // ≤30×30 cm, single coat
  medium:       4.5,   // 30–60 cm, single coat
  large_single: 6.0,   // ≥60 cm, single coat
  large_double: 9.0,   // ≥60 cm, double coat (back-buttering)
  custom:       0,     // uses custom_kg_m2 field
};

export function pegamentoCeramicasBolsasM2Area(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const area = Number(i.area) || 0;
  const format = String(i.formato || i.format || 'medium');
  const bagKg = Number(i.bag_kg) || 25;
  const wasteOpt = String(i.waste || 'normal');

  // Consumption kg/m²
  let consumoKgM2: number;
  if (format === 'custom') {
    consumoKgM2 = Math.max(0, Number(i.custom_kg_m2) || 3.0);
  } else {
    consumoKgM2 = CONSUMPTION_BY_FORMAT[format] ?? 4.5;
  }

  // Waste factor
  const wastePct = wasteOpt === 'complex' ? 0.15 : 0.10;

  // Core calculation
  const consumoTotal = area * consumoKgM2;          // kg raw
  const consumoConMargen = consumoTotal * (1 + wastePct); // kg with waste
  const bolsasExactas = consumoConMargen / bagKg;
  const bolsas = Math.ceil(bolsasExactas);

  // Rendimiento por bolsa
  const rendimientoPorBolsa = consumoKgM2 > 0 ? (bagKg / consumoKgM2) : 0;

  // Format labels
  const formatLabel: Record<string, { es: string; en: string }> = {
    small:        { es: 'Pequeño (≤30×30 cm)',          en: 'Small (≤30×30 cm)' },
    medium:       { es: 'Mediano (30–60 cm)',            en: 'Medium (30–60 cm)' },
    large_single: { es: 'Grande ≥60 cm – encolado simple', en: 'Large ≥60 cm – single coat' },
    large_double: { es: 'Grande ≥60 cm – doble encolado',  en: 'Large ≥60 cm – double coat' },
    custom:       { es: 'Consumo personalizado',          en: 'Custom consumption' },
  };
  const fmtEs = formatLabel[format]?.es ?? format;
  const fmtEn = formatLabel[format]?.en ?? format;

  const consumoTotalFmt   = consumoTotal.toFixed(1);
  const consumoConMargenFmt = consumoConMargen.toFixed(1);
  const rendimientoFmt    = rendimientoPorBolsa.toFixed(1);
  const bolsasExactasFmt  = bolsasExactas.toFixed(2);
  const wastePctFmt       = (wastePct * 100).toFixed(0);

  let resumen: string;
  let _insight: object;

  if (__lang === 'en') {
    resumen =
      `Area: **${area} m²** · Format: ${fmtEn} · ${consumoKgM2} kg/m²\n` +
      `Raw adhesive: ${consumoTotalFmt} kg + ${wastePctFmt}% waste = **${consumoConMargenFmt} kg**\n` +
      `Bags (${bagKg} kg each): ${bolsasExactasFmt} → **${bolsas} bags** to buy\n` +
      `Each bag covers ≈ ${rendimientoFmt} m² at this consumption rate.`;

    _insight = {
      title: `${bolsas} bag${bolsas !== 1 ? 's' : ''} needed`,
      text:
        `For **${area} m²** of **${fmtEn}** tiles, you need **${bolsas} bag${bolsas !== 1 ? 's' : ''}** of ${bagKg} kg adhesive ` +
        `(${consumoKgM2} kg/m², including ${wastePctFmt}% waste margin). ` +
        `Each bag covers ≈ ${rendimientoFmt} m² at this rate.`,
      tone: 'neutral',
      icon: '🪣',
    };
  } else {
    resumen =
      `Área: **${area} m²** · Formato: ${fmtEs} · ${consumoKgM2} kg/m²\n` +
      `Adhesivo neto: ${consumoTotalFmt} kg + ${wastePctFmt}% desperdicio = **${consumoConMargenFmt} kg**\n` +
      `Bolsas (${bagKg} kg c/u): ${bolsasExactasFmt} → **${bolsas} bolsas** a comprar\n` +
      `Cada bolsa rinde ≈ ${rendimientoFmt} m² con este consumo.`;

    _insight = {
      title: `${bolsas} bolsa${bolsas !== 1 ? 's' : ''} necesaria${bolsas !== 1 ? 's' : ''}`,
      text:
        `Para **${area} m²** de cerámicas **${fmtEs}** necesitás **${bolsas} bolsa${bolsas !== 1 ? 's' : ''}** de ${bagKg} kg ` +
        `(${consumoKgM2} kg/m², con ${wastePctFmt}% de desperdicio incluido). ` +
        `Cada bolsa rinde ≈ ${rendimientoFmt} m² con ese consumo. Siempre comprá en el mismo lote para garantizar consistencia de color.`,
      tone: 'neutral',
      icon: '🪣',
    };
  }

  return { resultado: bolsas, resumen, _insight };
}
