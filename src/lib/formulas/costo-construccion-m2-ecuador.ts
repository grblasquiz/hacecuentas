/** Costo de construcción por m² (Ecuador) 2026. Cálculo orientativo.
 *  Fuentes de rangos: Cámaras de la Construcción (Quito/Guayaquil) e Índice de Precios
 *  de la Construcción (IPCO) del INEC. Rangos por nivel de terminación, USD/m².
 *  Reparto materiales/mano de obra ≈ 60/40 (referencia, varía por partida). */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Costo directo, USD/m² — valor medio de cada rango (Cámara Construcción / IPCO-INEC 2026).
// Económica (básico):  ~$850–1.050 → 950
// Media (estándar):    ~$1.100–1.400 → 1.250
// Premium (alto):      ~$1.500–1.900 → 1.700
const COSTO_M2: Record<string, number> = { economica: 950, media: 1250, premium: 1700 };
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
    text: `Construir **${metros} m²** con terminación **${NOMBRE_NIVEL[calidad]}** cuesta aproximadamente **${fmtUSDec(costoTotal)}** (a razón de **${fmtUSDec(costoPorM2)}/m²**). De ese total, unos **${fmtUSDec(materiales)}** son materiales y **${fmtUSDec(manoObra)}** mano de obra. Es un rango orientativo: varía por ciudad, terreno y acabados.`,
    tone: 'neutral',
    icon: '🏗️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Materiales (~60%)', value: Math.round(materiales) },
      { label: 'Mano de obra (~40%)', value: Math.round(manoObra) },
    ],
    ariaLabel: `Materiales ${fmtUSDec(materiales)}, mano de obra ${fmtUSDec(manoObra)}.`,
  };

  return {
    costoTotal: fmtUSDec(costoTotal),
    costoPorM2: fmtUSDec(costoPorM2),
    desglose: `Materiales ≈ ${fmtUSDec(materiales)} (60%) · Mano de obra ≈ ${fmtUSDec(manoObra)} (40%).`,
    detalle: `${metros} m² × ${fmtUSDec(costoPorM2)}/m² (nivel ${NOMBRE_NIVEL[calidad]}) = ${fmtUSDec(costoTotal)}. Reparto orientativo 60/40 entre materiales y mano de obra.`,
    _insight,
    _chart,
  };
}
