/** Contribuciones morosas — recargos de la TGR (Chile) 2026.
 *  Deuda vencida de contribuciones (impuesto territorial) = capital reajustado por IPC + interés penal.
 *  Fuente: Tesorería General de la República (TGR) — Ley 17.235 y Código Tributario art. 53.
 *  Interés penal: 1,5% mensual sobre el monto reajustado, por cada mes o fracción de mes de atraso.
 *  Reajuste: variación del IPC entre el vencimiento y el pago (lo ingresa el usuario; TGR lo fija). */
import { fmtCLP } from '../data/chile-2026.ts';

const INTERES_PENAL_MENSUAL = 0.015;   // 1,5% mensual — Código Tributario art. 53 (deudas fiscales TGR)

export interface Inputs {
  cuotaVencida: number;   // monto original de la(s) cuota(s) de contribuciones adeudada(s)
  mesesAtraso?: number;   // meses o fracción de mes de atraso
  ipcAcumulado?: number;  // % de reajuste por IPC acumulado desde el vencimiento (opcional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const cuota = Number(i.cuotaVencida) || 0;
  const meses = Math.max(0, Number(i.mesesAtraso) || 0);
  const ipcPct = Math.max(0, Number(i.ipcAcumulado) || 0) / 100;
  if (cuota <= 0) throw new Error('Ingresá el monto de la cuota de contribuciones adeudada');

  // El reajuste por IPC se aplica primero al capital; sobre ese monto reajustado corre el interés penal.
  const reajuste = cuota * ipcPct;
  const base = cuota + reajuste;
  // Interés penal 1,5% por cada mes o fracción → se cuenta el mes iniciado como completo.
  const mesesCargados = Math.ceil(meses);
  const interes = base * INTERES_PENAL_MENSUAL * mesesCargados;
  const totalPagar = base + interes;
  const recargoTotal = totalPagar - cuota;

  const _insight = {
    title: 'Cuánto pagás hoy por la contribución atrasada',
    text: `Una cuota vencida de **${fmtCLP(cuota)}** con **${mesesCargados}** ${mesesCargados === 1 ? 'mes' : 'meses'} de atraso acumula **${fmtCLP(recargoTotal)}** en recargos (reajuste IPC + interés penal 1,5% mensual), por lo que hoy pagarías **${fmtCLP(totalPagar)}**.`,
    tone: 'neutral',
    icon: '🏛️',
  };
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Cuota original', value: Math.round(cuota) },
      { label: 'Reajuste IPC', value: Math.round(reajuste) },
      { label: 'Interés penal', value: Math.round(interes) },
    ],
    ariaLabel: `Cuota original ${fmtCLP(cuota)}, reajuste ${fmtCLP(reajuste)}, interés penal ${fmtCLP(interes)}.`,
  };

  return {
    totalPagar: fmtCLP(totalPagar),
    recargoTotal: fmtCLP(recargoTotal),
    reajuste: fmtCLP(reajuste),
    interesPenal: fmtCLP(interes),
    detalle: `Base reajustada = ${fmtCLP(cuota)} + ${fmtCLP(reajuste)} (IPC ${(ipcPct * 100).toLocaleString('es-CL')}%) = ${fmtCLP(base)}. Interés = ${fmtCLP(base)} × 1,5% × ${mesesCargados} = ${fmtCLP(interes)}. Total a pagar = ${fmtCLP(totalPagar)}.`,
    _insight,
    _chart,
  };
}
