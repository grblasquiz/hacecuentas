/** Renta de 1ra categoría Perú — Impuesto al alquiler de inmuebles (arrendamiento). */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  alquilerMensual: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const alquiler = Number(i.alquilerMensual) || 0;
  if (alquiler <= 0) throw new Error('Ingresá el monto del alquiler mensual');

  // Renta de 1ra categoría: 5% efectivo sobre el alquiler bruto.
  // (6,25% sobre la renta neta, que es el 80% del bruto tras la deducción del 20%.)
  const tasaEfectiva = 0.05;
  const impuestoMensual = alquiler * tasaEfectiva;
  const impuestoAnual = impuestoMensual * 12;
  const alquilerAnual = alquiler * 12;
  const netoMensual = alquiler - impuestoMensual;

  const _insight = {
    title: 'Tu Impuesto a la Renta de 1ra categoría',
    text: `Por un alquiler de **${fmtPEN(alquiler)}** al mes pagás **${fmtPEN(impuestoMensual)}** de Impuesto a la Renta cada mes (el **5%** efectivo del alquiler), o sea **${fmtPEN(impuestoAnual)}** al año. Te queda **${fmtPEN(netoMensual)}** neto por mes. El pago se hace mes a mes con el formulario **Pago Fácil 1683** en SUNAT.`,
    tone: 'info',
    icon: '🏠',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto para vos', value: Math.round(netoMensual) },
      { label: 'Impuesto (5%)', value: Math.round(impuestoMensual) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(impuestoMensual),
    centerLabel: 'Impuesto mensual',
    ariaLabel: `Impuesto a la renta de 1ra categoría: ${fmtPEN(impuestoMensual)} por mes sobre un alquiler de ${fmtPEN(alquiler)}.`,
  };

  return {
    impuestoMensual: fmtPEN(impuestoMensual),
    impuestoAnual: fmtPEN(impuestoAnual),
    netoMensual: fmtPEN(netoMensual),
    detalle: `Alquiler ${fmtPEN(alquiler)}/mes · tasa efectiva 5% · impuesto anual ${fmtPEN(impuestoAnual)} sobre ${fmtPEN(alquilerAnual)} cobrados.`,
    _insight,
    _chart,
  };
}
