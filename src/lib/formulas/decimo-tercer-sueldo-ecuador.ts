/** Décimo tercer sueldo (Ecuador) — 1/12 de lo percibido entre dic y nov. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  mesesTrabajados: number;       // meses trabajados en el periodo (1-12)
  otrosIngresosMensuales?: number; // horas extra, comisiones (promedio mensual)
  modalidad?: string;            // 'acumulado' (dic) o 'mensualizado'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual) || 0;
  const meses = Math.max(0, Math.min(12, Number(i.mesesTrabajados) || 0));
  const otros = Math.max(0, Number(i.otrosIngresosMensuales) || 0);
  const modalidad = String(i.modalidad || 'acumulado');
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');

  const baseMensual = sueldo + otros; // todo lo percibido (sin décimos ni utilidades)
  const totalPeriodo = baseMensual * meses;
  const decimoAnual = totalPeriodo / 12; // 1/12 de lo percibido en el periodo
  const decimoMensualizado = baseMensual / 12; // si se cobra prorrateado cada mes

  const esMensual = modalidad === 'mensualizado';
  const principal = esMensual ? decimoMensualizado : decimoAnual;

  const _insight = {
    title: 'Tu décimo tercer sueldo',
    text: esMensual
      ? `Cobrando el décimo tercero **mensualizado**, se te suma **${fmtUSDec(decimoMensualizado)}** cada mes a tu rol. En el año equivale a **${fmtUSDec(decimoAnual)}**.`
      : `Por **${meses} meses** trabajados con una base de **${fmtUSDec(baseMensual)}**, tu décimo tercer sueldo (a cobrar hasta el **24 de diciembre**) es **${fmtUSDec(decimoAnual)}**. Está **exento de impuesto a la renta** y no aporta al IESS.`,
    tone: 'good',
    icon: '🎁',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(decimoAnual * 100) / 100,
    min: 0,
    max: Math.round(sueldo * 100) / 100,
    label: fmtUSDec(decimoAnual),
    ariaLabel: `Décimo tercer sueldo ${fmtUSDec(decimoAnual)} sobre un sueldo de ${fmtUSDec(sueldo)}.`,
  };

  return {
    decimoTercero: fmtUSDec(principal),
    decimoAnual: fmtUSDec(decimoAnual),
    decimoMensual: fmtUSDec(decimoMensualizado),
    detalle: `Base mensual ${fmtUSDec(baseMensual)} · ${meses} meses · ${esMensual ? 'mensualizado' : 'acumulado (pago en diciembre)'}.`,
    _insight,
    _chart,
  };
}
