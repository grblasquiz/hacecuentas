/**
 * Rendimiento Cajitas Nu vs Nequi (Colombia) — interés compuesto con tasas efectivas anuales.
 * Vigente jul-2026: Cajitas Nu 11,25% EA (desde 09-abr-2026, tras la subida del Banrep a 11,25%);
 * Nequi paga 0,1% EA en Disponible, Bolsillos, Metas y Colchón. Tasas editables; defaults de la data país.
 * Capitalización: EA aplicada proporcional al plazo en meses → monto × (1+EA)^(meses/12).
 */
import { AHORRO_DIGITAL_2026, fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  monto: number;
  meses: number;
  tasa_nu_ea?: number;
  tasa_nequi_ea?: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto);
  if (!Number.isFinite(monto) || monto <= 0) throw new Error('Ingresa cuánto vas a ahorrar');
  let meses = Number(i.meses);
  if (!Number.isFinite(meses) || meses <= 0) meses = 12;

  const eaNu = (Number(i.tasa_nu_ea) > 0 ? Number(i.tasa_nu_ea) : AHORRO_DIGITAL_2026.nuCajitasEaPct) / 100;
  const eaNequi = (Number(i.tasa_nequi_ea) >= 0 && i.tasa_nequi_ea !== undefined && i.tasa_nequi_ea !== null && String(i.tasa_nequi_ea) !== ''
    ? Number(i.tasa_nequi_ea)
    : AHORRO_DIGITAL_2026.nequiEaPct) / 100;

  const factor = (ea: number) => Math.pow(1 + ea, meses / 12);
  const finalNu = monto * factor(eaNu);
  const finalNequi = monto * factor(eaNequi);
  const gananciaNu = finalNu - monto;
  const gananciaNequi = finalNequi - monto;
  const diferencia = gananciaNu - gananciaNequi;

  const _insight = {
    title: `En Nu ganas ${fmtCOP(diferencia)} más`,
    text: `Con **${fmtCOP(monto)}** durante **${meses} ${meses === 1 ? 'mes' : 'meses'}**: las Cajitas de Nu al **${(eaNu * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 })}% EA** generan **${fmtCOP(gananciaNu)}**, mientras Nequi al **${(eaNequi * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 })}% EA** genera **${fmtCOP(gananciaNequi)}**. La diferencia es **${fmtCOP(diferencia)}**. Los rendimientos son antes de la retención en la fuente sobre rendimientos financieros cuando aplica, y las tasas pueden cambiar con la política del Banrep.`,
    tone: 'good',
    icon: '🐷',
  };

  const _chart = {
    type: 'bar',
    labels: ['Ganancia en Nu (Cajitas)', 'Ganancia en Nequi'],
    values: [Math.round(gananciaNu), Math.round(gananciaNequi)],
    prefix: '$',
    ariaLabel: `Ganancia en Cajitas Nu ${fmtCOP(gananciaNu)} frente a ${fmtCOP(gananciaNequi)} en Nequi con ${fmtCOP(monto)} a ${meses} meses.`,
  };

  return {
    ganancia_nu: fmtCOP(gananciaNu),
    ganancia_nequi: fmtCOP(gananciaNequi),
    diferencia: fmtCOP(diferencia),
    saldo_final_nu: fmtCOP(finalNu),
    detalle: `${fmtCOP(monto)} × (1 + ${(eaNu * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 })}%)^(${meses}/12) = ${fmtCOP(finalNu)} en Nu vs ${fmtCOP(finalNequi)} en Nequi (${(eaNequi * 100).toLocaleString('es-CO', { maximumFractionDigits: 2 })}% EA).`,
    _insight,
    _chart,
  };
}
