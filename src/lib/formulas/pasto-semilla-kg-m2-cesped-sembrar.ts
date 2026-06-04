export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Grass seed calculator by area, grass type, and seeding purpose.
 *
 * Seeding rates (g/m²) based on Lawnsmith, The Grass People, and AHDB guidance:
 *
 * Grass type          | New lawn | Overseeding
 * --------------------|----------|------------
 * Perennial ryegrass  |   35     |   20
 * Fine fescue mix     |   35     |   20
 * Tall fescue         |   25     |   15
 * Kentucky bluegrass  |   20     |   12
 * Bermuda grass       |   10     |    6
 * Bent grass          |   10     |    6
 * Bahia grass         |   30     |   18
 * Premium mix (ryegrass+fescue) | 40 | 25
 *
 * v1 = lawn area in m²
 * v2 = grass type code (select): 1=perennial-rye, 2=fine-fescue, 3=tall-fescue,
 *      4=kentucky-bluegrass, 5=bermuda, 6=bent-grass, 7=bahia, 8=premium-mix
 *
 * Overseeding factor applied when URL / JSON encodes purpose via v3 is not
 * available (only v1/v2 ids exist). Instead we encode purpose inside v2 as
 * "purpose" field by mapping odd codes to new-lawn and even codes to overseed.
 *
 * ACTUALLY: the JSON has only v1 and v2. We use:
 *   v1 = area (m²)
 *   v2 = select encoding grass type + purpose as a combined key 1–16
 *
 * Map (1-indexed):
 *   1  = Perennial ryegrass – New lawn         35 g/m²
 *   2  = Perennial ryegrass – Overseeding      20 g/m²
 *   3  = Fine fescue mix – New lawn            35 g/m²
 *   4  = Fine fescue mix – Overseeding         20 g/m²
 *   5  = Tall fescue – New lawn                25 g/m²
 *   6  = Tall fescue – Overseeding             15 g/m²
 *   7  = Kentucky bluegrass – New lawn         20 g/m²
 *   8  = Kentucky bluegrass – Overseeding      12 g/m²
 *   9  = Bermuda grass – New lawn              10 g/m²
 *  10  = Bermuda grass – Overseeding            6 g/m²
 *  11  = Bent grass – New lawn                 10 g/m²
 *  12  = Bent grass – Overseeding               6 g/m²
 *  13  = Premium mix (rye+fescue) – New lawn   40 g/m²
 *  14  = Premium mix (rye+fescue) – Overseeding 25 g/m²
 *  15  = Bahia grass – New lawn                30 g/m²
 *  16  = Bahia grass – Overseeding             18 g/m²
 */

interface RateEntry {
  grassEN: string;
  grassES: string;
  purposeEN: string;
  purposeES: string;
  rateGm2: number;  // grams per m²
}

const RATE_TABLE: Record<number, RateEntry> = {
  1:  { grassEN: 'Perennial ryegrass', grassES: 'Raygrás perenne',       purposeEN: 'New lawn',    purposeES: 'Césped nuevo', rateGm2: 35 },
  2:  { grassEN: 'Perennial ryegrass', grassES: 'Raygrás perenne',       purposeEN: 'Overseeding', purposeES: 'Resembrado',   rateGm2: 20 },
  3:  { grassEN: 'Fine fescue mix',    grassES: 'Mezcla de festuca fina', purposeEN: 'New lawn',    purposeES: 'Césped nuevo', rateGm2: 35 },
  4:  { grassEN: 'Fine fescue mix',    grassES: 'Mezcla de festuca fina', purposeEN: 'Overseeding', purposeES: 'Resembrado',   rateGm2: 20 },
  5:  { grassEN: 'Tall fescue',        grassES: 'Festuca alta',           purposeEN: 'New lawn',    purposeES: 'Césped nuevo', rateGm2: 25 },
  6:  { grassEN: 'Tall fescue',        grassES: 'Festuca alta',           purposeEN: 'Overseeding', purposeES: 'Resembrado',   rateGm2: 15 },
  7:  { grassEN: 'Kentucky bluegrass', grassES: 'Poa de Kentucky',        purposeEN: 'New lawn',    purposeES: 'Césped nuevo', rateGm2: 20 },
  8:  { grassEN: 'Kentucky bluegrass', grassES: 'Poa de Kentucky',        purposeEN: 'Overseeding', purposeES: 'Resembrado',   rateGm2: 12 },
  9:  { grassEN: 'Bermuda grass',      grassES: 'Grama bermuda',          purposeEN: 'New lawn',    purposeES: 'Césped nuevo', rateGm2: 10 },
  10: { grassEN: 'Bermuda grass',      grassES: 'Grama bermuda',          purposeEN: 'Overseeding', purposeES: 'Resembrado',   rateGm2:  6 },
  11: { grassEN: 'Bent grass',         grassES: 'Agrostis / Bent grass',  purposeEN: 'New lawn',    purposeES: 'Césped nuevo', rateGm2: 10 },
  12: { grassEN: 'Bent grass',         grassES: 'Agrostis / Bent grass',  purposeEN: 'Overseeding', purposeES: 'Resembrado',   rateGm2:  6 },
  13: { grassEN: 'Premium mix (rye + fescue)', grassES: 'Mezcla premium (raygrás + festuca)', purposeEN: 'New lawn',    purposeES: 'Césped nuevo', rateGm2: 40 },
  14: { grassEN: 'Premium mix (rye + fescue)', grassES: 'Mezcla premium (raygrás + festuca)', purposeEN: 'Overseeding', purposeES: 'Resembrado',   rateGm2: 25 },
  15: { grassEN: 'Bahia grass',        grassES: 'Grama bahía',            purposeEN: 'New lawn',    purposeES: 'Césped nuevo', rateGm2: 30 },
  16: { grassEN: 'Bahia grass',        grassES: 'Grama bahía',            purposeEN: 'Overseeding', purposeES: 'Resembrado',   rateGm2: 18 },
};

export function pastoSemillaKgM2CespedSembrar(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const areaM2 = Math.max(0, Number(i.v1) || 0);
  const typeKey = Math.round(Number(i.v2) || 1);

  const entry = RATE_TABLE[typeKey] ?? RATE_TABLE[1];
  const rateGm2 = entry.rateGm2;

  const totalGrams = areaM2 * rateGm2;
  const totalKg    = totalGrams / 1000;

  // Wastage buffer recommendation (+10% for uneven spreading)
  const totalKgWithBuffer = totalKg * 1.1;

  const grassName  = __lang === 'en' ? entry.grassEN  : entry.grassES;
  const purposeName = __lang === 'en' ? entry.purposeEN : entry.purposeES;

  // Format helpers
  const fmtKg = (kg: number) =>
    kg >= 1 ? `${kg.toFixed(2)} kg` : `${(kg * 1000).toFixed(0)} g`;

  if (areaM2 === 0) {
    const noDataText = __lang === 'en'
      ? 'Enter your lawn area to see the seed quantity.'
      : 'Ingresá el área para ver la cantidad de semilla.';
    return {
      resultado: noDataText,
      resumen:   noDataText,
      _insight:  { title: __lang === 'en' ? 'Awaiting input' : 'Esperando datos', text: noDataText, tone: 'neutral', icon: '🌱' },
    };
  }

  // Build output strings
  const mainResult = __lang === 'en'
    ? `${fmtKg(totalKg)} of seed needed`
    : `${fmtKg(totalKg)} de semilla necesaria`;

  const summaryEN = `${grassName} · ${purposeName} · ${rateGm2} g/m² · ${areaM2} m² = **${fmtKg(totalKg)}** (buy **${fmtKg(totalKgWithBuffer)}** with 10% buffer).`;
  const summaryES = `${grassName} · ${purposeName} · ${rateGm2} g/m² · ${areaM2} m² = **${fmtKg(totalKg)}** (comprá **${fmtKg(totalKgWithBuffer)}** con 10% de margen).`;

  const insightEN = totalKg < 0.5
    ? `Your ${areaM2} m² lawn needs **${(totalGrams).toFixed(0)} g** of ${grassName} seed for ${purposeName.toLowerCase()}. That's a very small area — one standard 500 g bag is more than enough.`
    : `Your ${areaM2} m² lawn needs **${fmtKg(totalKg)}** of ${grassName} seed for ${purposeName.toLowerCase()}. Buy **${fmtKg(totalKgWithBuffer)}** to account for overlaps and uneven spreading.`;

  const insightES = totalKg < 0.5
    ? `Tu césped de ${areaM2} m² necesita **${(totalGrams).toFixed(0)} g** de semilla (${grassName}) para ${purposeName.toLowerCase()}. Es un área chica — una bolsa de 500 g es más que suficiente.`
    : `Tu césped de ${areaM2} m² necesita **${fmtKg(totalKg)}** de semilla (${grassName}) para ${purposeName.toLowerCase()}. Comprá **${fmtKg(totalKgWithBuffer)}** para contemplar solapamientos e irregularidades.`;

  const toneEN: string = totalKg > 5 ? 'warning' : 'positive';

  const _insight = __lang === 'en'
    ? { title: 'Seed estimate', text: insightEN, tone: toneEN, icon: '🌱' }
    : { title: 'Estimado de semilla', text: insightES, tone: toneEN, icon: '🌱' };

  return {
    resultado: mainResult,
    resumen:   __lang === 'en' ? summaryEN : summaryES,
    _insight,
  };
}
