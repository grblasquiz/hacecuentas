/** Costo de construcción por m² (Perú) 2026. Cálculo orientativo.
 *  Fuentes de rangos: CAPECO y valores unitarios oficiales del Colegio de Arquitectos
 *  del Perú (CAP); referencias de mercado Lima 2026. Rangos por nivel de terminación,
 *  S/./m². Reparto materiales/mano de obra ≈ 60/40 (referencia, varía por partida). */
import { fmtPEN } from '../data/peru-2026.ts';

// Costo directo, S/./m² — valor medio de cada rango (CAPECO / CAP + mercado Lima 2026).
// Económica (casco gris / acabados básicos):  ~S/ 1.400–1.800 → 1.600
// Media (casco habitable / acabados básicos):  ~S/ 1.900–2.400 → 2.150
// Premium (llave en mano / acabados de lujo):  ~S/ 2.800+       → 3.000
const COSTO_M2: Record<string, number> = { economica: 1600, media: 2150, premium: 3000 };
const NOMBRE_NIVEL: Record<string, string> = { economica: 'económica', media: 'media', premium: 'premium' };
const PCT_MATERIALES = 0.60;   // ≈ 60% materiales / 40% mano de obra (referencia)

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
    text: `Construir **${metros} m²** con terminación **${NOMBRE_NIVEL[calidad]}** cuesta aproximadamente **${fmtPEN(costoTotal)}** (a razón de **${fmtPEN(costoPorM2)}/m²**). De ese total, unos **${fmtPEN(materiales)}** son materiales y **${fmtPEN(manoObra)}** mano de obra. Es un rango orientativo: varía por zona, terreno y acabados.`,
    tone: 'neutral',
    icon: '🏗️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Materiales (~60%)', value: Math.round(materiales) },
      { label: 'Mano de obra (~40%)', value: Math.round(manoObra) },
    ],
    ariaLabel: `Materiales ${fmtPEN(materiales)}, mano de obra ${fmtPEN(manoObra)}.`,
  };

  return {
    costoTotal: fmtPEN(costoTotal),
    costoPorM2: fmtPEN(costoPorM2),
    desglose: `Materiales ≈ ${fmtPEN(materiales)} (60%) · Mano de obra ≈ ${fmtPEN(manoObra)} (40%).`,
    detalle: `${metros} m² × ${fmtPEN(costoPorM2)}/m² (nivel ${NOMBRE_NIVEL[calidad]}) = ${fmtPEN(costoTotal)}. Reparto orientativo 60/40 entre materiales y mano de obra.`,
    _insight,
    _chart,
  };
}
