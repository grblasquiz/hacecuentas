/** Costo de construcción por m² (México) 2026. Cálculo orientativo.
 *  Fuentes de rangos: CMIC / CEICO (Centro Nacional de Ingeniería de Costos) y
 *  portales de costos de obra (obra negra + obra blanca, llave en mano). Rangos por
 *  nivel de terminación, MXN/m². Reparto materiales/mano de obra ≈ 60/40 (referencia
 *  de análisis de precios unitarios; varía por partida). */
import { fmtMXN } from '../data/mexico-2026.ts';

// Costo directo llave en mano, MXN/m² — valor medio de cada rango (CMIC/CEICO + mercado 2026).
// Económica (interés social/básico): ~$12.500–14.500 → 13.000
// Media (residencial estándar):      ~$16.000–22.000 → 19.000
// Premium (residencial alto/lujo):   ~$28.000–38.000 → 32.000
const COSTO_M2: Record<string, number> = { economica: 13000, media: 19000, premium: 32000 };
const NOMBRE_NIVEL: Record<string, string> = { economica: 'económica', media: 'media', premium: 'premium' };
const PCT_MATERIALES = 0.60;   // ≈ 60% materiales / 40% mano de obra (referencia APU)

export interface Inputs {
  metros: number;
  calidad?: string;   // 'economica' | 'media' | 'premium'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const metros = Number(i.metros) || 0;
  const calidad = (i.calidad && COSTO_M2[i.calidad]) ? i.calidad : 'media';
  if (metros <= 0) throw new Error('Ingresá los metros cuadrados a construir');

  const costoPorM2 = COSTO_M2[calidad];
  const costoTotal = costoPorM2 * metros;
  const materiales = costoTotal * PCT_MATERIALES;
  const manoObra = costoTotal * (1 - PCT_MATERIALES);

  const _insight = {
    title: 'Costo estimado de tu obra',
    text: `Construir **${metros} m²** con terminación **${NOMBRE_NIVEL[calidad]}** cuesta aproximadamente **${fmtMXN(costoTotal)}** (a razón de **${fmtMXN(costoPorM2)}/m²**). De ese total, unos **${fmtMXN(materiales)}** son materiales y **${fmtMXN(manoObra)}** mano de obra. Es un rango orientativo: varía por ciudad, terreno y acabados.`,
    tone: 'neutral',
    icon: '🏗️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Materiales (~60%)', value: Math.round(materiales) },
      { label: 'Mano de obra (~40%)', value: Math.round(manoObra) },
    ],
    ariaLabel: `Materiales ${fmtMXN(materiales)}, mano de obra ${fmtMXN(manoObra)}.`,
  };

  return {
    costoTotal: fmtMXN(costoTotal),
    costoPorM2: fmtMXN(costoPorM2),
    desglose: `Materiales ≈ ${fmtMXN(materiales)} (60%) · Mano de obra ≈ ${fmtMXN(manoObra)} (40%).`,
    detalle: `${metros} m² × ${fmtMXN(costoPorM2)}/m² (nivel ${NOMBRE_NIVEL[calidad]}) = ${fmtMXN(costoTotal)}. Reparto orientativo 60/40 entre materiales y mano de obra.`,
    _insight,
    _chart,
  };
}
