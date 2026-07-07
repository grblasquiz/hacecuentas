/** Costo de construcción por m² (Chile) 2026. Cálculo orientativo.
 *  Fuentes de rangos: CChC (Cámara Chilena de la Construcción) e índices/valores unitarios
 *  MINVU; la construcción en Chile se cotiza en UF. Rangos por nivel de terminación,
 *  expresados en UF/m² y convertidos a CLP con la UF de referencia 2026.
 *  Reparto materiales/mano de obra ≈ 60/40 (referencia, varía por partida). */
import { fmtCLP } from '../data/chile-2026.ts';

// UF de referencia (jul-2026, Banco Central/SII ≈ $40.836). Se actualiza a diario;
// el valor solo escala el resultado — el rango en UF es lo estructural.
const UF = 40836;

// Costo directo llave en mano, UF/m² — valor medio de cada rango (CChC / MINVU 2026).
// Económica (albañilería confinada, terminaciones estándar): ~22 UF/m²
// Media (estándar completo):                                  ~30 UF/m²
// Premium (terminaciones altas):                              ~42 UF/m²
const COSTO_M2_UF: Record<string, number> = { economica: 22, media: 30, premium: 42 };
const NOMBRE_NIVEL: Record<string, string> = { economica: 'económica', media: 'media', premium: 'premium' };
const PCT_MATERIALES = 0.60;   // ≈ 60% materiales / 40% mano de obra (referencia)

export interface Inputs {
  metros: number;
  calidad?: string;   // 'economica' | 'media' | 'premium'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const metros = Number(i.metros) || 0;
  const calidad = (i.calidad && COSTO_M2_UF[i.calidad]) ? i.calidad : 'media';
  if (metros <= 0) throw new Error('Ingresá los metros cuadrados a construir');

  const ufM2 = COSTO_M2_UF[calidad];
  const costoPorM2 = ufM2 * UF;
  const costoTotal = costoPorM2 * metros;
  const materiales = costoTotal * PCT_MATERIALES;
  const manoObra = costoTotal * (1 - PCT_MATERIALES);
  const totalUF = ufM2 * metros;

  const _insight = {
    title: 'Costo estimado de tu obra',
    text: `Construir **${metros} m²** con terminación **${NOMBRE_NIVEL[calidad]}** cuesta aproximadamente **${fmtCLP(costoTotal)}** (unas **${totalUF.toLocaleString('es-CL')} UF**), a razón de **${ufM2} UF/m²** ≈ **${fmtCLP(costoPorM2)}/m²**. Del total, cerca de **${fmtCLP(materiales)}** son materiales y **${fmtCLP(manoObra)}** mano de obra. Orientativo: varía por región y terminaciones.`,
    tone: 'neutral',
    icon: '🏗️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Materiales (~60%)', value: Math.round(materiales) },
      { label: 'Mano de obra (~40%)', value: Math.round(manoObra) },
    ],
    ariaLabel: `Materiales ${fmtCLP(materiales)}, mano de obra ${fmtCLP(manoObra)}.`,
  };

  return {
    costoTotal: fmtCLP(costoTotal),
    costoPorM2: `${fmtCLP(costoPorM2)} (${ufM2} UF)`,
    desglose: `Materiales ≈ ${fmtCLP(materiales)} (60%) · Mano de obra ≈ ${fmtCLP(manoObra)} (40%).`,
    detalle: `${metros} m² × ${ufM2} UF/m² = ${totalUF.toLocaleString('es-CL')} UF ≈ ${fmtCLP(costoTotal)} (UF ${fmtCLP(UF)}). Reparto orientativo 60/40 materiales/mano de obra.`,
    _insight,
    _chart,
  };
}
