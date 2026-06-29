/** Rebaja por gastos personales del Impuesto a la Renta (Ecuador) 2026.
 *  Rebaja = 18% sobre el menor entre gastos personales y el límite (en canastas básicas familiares).
 *  CBF $821,80 · escala de canastas por cargas familiares (referencial — verificar con SRI). */
import { fmtUSDec } from '../data/ecuador-2026.ts';

const CBF = 821.80;            // Canasta Básica Familiar (USD) — base del límite de gastos personales
const PCT_REBAJA = 0.18;       // 18% de rebaja sobre los gastos personales (con tope)

export interface Inputs {
  gastosPersonales: number;
  cargasFamiliares?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Canastas básicas permitidas según el número de cargas familiares. */
function canastasPorCargas(cargas: number): number {
  const tabla: Record<number, number> = { 0: 7, 1: 9, 2: 11, 3: 14, 4: 17 };
  return cargas > 4 ? 20 : (tabla[cargas] ?? 7);
}

export function compute(i: Inputs): Outputs {
  const gastos = Number(i.gastosPersonales) || 0;
  const cargas = Math.max(0, Math.floor(Number(i.cargasFamiliares) || 0));
  if (gastos <= 0) throw new Error('Ingresá tus gastos personales anuales');

  const canastas = canastasPorCargas(cargas);
  const limiteGastos = canastas * CBF;
  const baseRebaja = Math.min(gastos, limiteGastos);
  const rebaja = baseRebaja * PCT_REBAJA;
  const topeAlcanzado = gastos > limiteGastos;

  const _insight = {
    title: 'Tu rebaja por gastos personales',
    text: `Con **${canastas} canastas básicas** permitidas (${fmtUSDec(limiteGastos)} de límite), la rebaja que descontás de tu Impuesto a la Renta es **${fmtUSDec(rebaja)}** (18% sobre ${fmtUSDec(baseRebaja)}).${topeAlcanzado ? ' Tus gastos superan el límite, así que la rebaja se calcula sobre el tope.' : ''}`,
    tone: 'positive',
    icon: '🧾',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Rebaja (18%)', value: Math.round(rebaja * 100) / 100 },
      { label: 'No rebajable', value: Math.round((baseRebaja - rebaja) * 100) / 100 },
    ],
    ariaLabel: `Rebaja ${fmtUSDec(rebaja)} sobre base ${fmtUSDec(baseRebaja)}.`,
  };

  return {
    canastasPermitidas: String(canastas),
    limiteGastos: fmtUSDec(limiteGastos),
    rebaja: fmtUSDec(rebaja),
    detalle: `Cargas: ${cargas} → ${canastas} canastas × ${fmtUSDec(CBF)} = ${fmtUSDec(limiteGastos)}. Base de rebaja: ${fmtUSDec(baseRebaja)} × 18% = ${fmtUSDec(rebaja)}.`,
    _insight,
    _chart,
  };
}
