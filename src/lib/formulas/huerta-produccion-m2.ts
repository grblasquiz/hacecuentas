/** Huerta: producción estimada por m² */
export interface Inputs { especie: string; m2: number; experiencia?: string; }
export interface Outputs { kgTemporada: number; kgPorM2: number; kgAnual: number; equivalenteDinero: string; _insight?: any; }

const REND_KG_M2: Record<string, number> = {
  tomate: 5, lechuga: 3.5, zanahoria: 3, cebolla: 3, zapallo: 2.5,
  pimiento: 3.5, acelga: 5, espinaca: 2.5, chaucha: 2, remolacha: 3,
  papa: 4, berenjena: 3.5,
};
const FACTOR_EXP: Record<string, number> = { principiante: 0.6, intermedio: 0.85, experto: 1.1 };
const PRECIO_KG = 2500; // ARS promedio 2026

export function huertaProduccionM2(i: Inputs): Outputs {
  const m2 = Number(i.m2);
  if (!m2 || m2 <= 0) throw new Error('Ingresá la superficie');
  const especie = String(i.especie || 'tomate');
  const exp = String(i.experiencia || 'intermedio');
  const base = REND_KG_M2[especie] || 3;
  const factor = FACTOR_EXP[exp] || 0.85;
  const kgM2 = base * factor;
  const kgTemp = kgM2 * m2;
  const kgAnual = kgTemp * 1.7; // 2 temporadas, invierno rinde menos
  const ahorro = Math.round(kgAnual * PRECIO_KG);

  const fmt1 = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 }).format(n);
  const _insight = {
    title: 'Tu huerta en números',
    text: `Con **${fmt1(m2)} m²** de ${especie} (nivel ${exp}) cosechás unos **${fmt1(kgAnual)} kg al año**, ahorrándote **~$${ahorro.toLocaleString('es-AR')} ARS** en verdulería. Cada m² te rinde **${fmt1(kgM2)} kg por temporada**.`,
    tone: 'good',
    icon: '🌱',
  };

  return {
    kgTemporada: Number(kgTemp.toFixed(1)),
    kgPorM2: Number(kgM2.toFixed(1)),
    kgAnual: Number(kgAnual.toFixed(1)),
    equivalenteDinero: `~$${ahorro.toLocaleString('es-AR')} ARS/año en verdulería`,
    _insight,
  };
}
