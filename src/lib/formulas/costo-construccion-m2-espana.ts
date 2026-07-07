/** Coste de construcción por m² (España) 2026. Cálculo orientativo.
 *  Fuentes de rangos: coste de ejecución material (PEM) por tipología y calidad,
 *  referencias de colegios de arquitectos y portales de obra nueva 2026. Rangos por
 *  nivel de terminación, €/m². Reparto materiales/mano de obra ≈ 60/40 (referencia). */

// España: sin data file — helper inline (patrón de la spec).
const fmtEur = (n: number) => Math.round(n).toLocaleString('es-ES') + ' €';

// Coste de construcción, €/m² — valor medio de cada rango (PEM obra nueva 2026).
// Económica (calidad básica):  ~1.300–1.600 → 1.450
// Media (confort completo):     ~1.600–1.900 → 1.750
// Premium (acabados altos):     ~2.000–2.500 → 2.250
const COSTO_M2: Record<string, number> = { economica: 1450, media: 1750, premium: 2250 };
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
    title: 'Coste estimado de tu obra',
    text: `Construir **${metros} m²** con calidad **${NOMBRE_NIVEL[calidad]}** cuesta aproximadamente **${fmtEur(costoTotal)}** (a razón de **${fmtEur(costoPorM2)}/m²**). De ese total, unos **${fmtEur(materiales)}** son materiales y **${fmtEur(manoObra)}** mano de obra. Es un rango orientativo: varía por comunidad, terreno y acabados.`,
    tone: 'neutral',
    icon: '🏗️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Materiales (~60%)', value: Math.round(materiales) },
      { label: 'Mano de obra (~40%)', value: Math.round(manoObra) },
    ],
    ariaLabel: `Materiales ${fmtEur(materiales)}, mano de obra ${fmtEur(manoObra)}.`,
  };

  return {
    costoTotal: fmtEur(costoTotal),
    costoPorM2: fmtEur(costoPorM2),
    desglose: `Materiales ≈ ${fmtEur(materiales)} (60%) · Mano de obra ≈ ${fmtEur(manoObra)} (40%).`,
    detalle: `${metros} m² × ${fmtEur(costoPorM2)}/m² (calidad ${NOMBRE_NIVEL[calidad]}) = ${fmtEur(costoTotal)}. Reparto orientativo 60/40 entre materiales y mano de obra. No incluye IVA (10%) ni honorarios.`,
    _insight,
    _chart,
  };
}
