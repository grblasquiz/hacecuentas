/**
 * Bono de Guerra Económica + Ingreso Mínimo Integral — Venezuela.
 *
 * El ingreso mínimo del trabajador venezolano se compone de TRES piezas:
 *   1. Salario mínimo legal (LOTTT)      → en bolívares, base de pasivos laborales.
 *   2. Cestaticket socialista            → indexado a USD, se paga en Bs. a tasa BCV.
 *   3. Bono de Guerra Económica          → asignado por el Sistema Patria, monto
 *                                           que cambia mes a mes (por eso es un input).
 *
 *   ingresoIntegralBs = salarioMinimoBs + cestaticketBs + bonoBs
 *   cestaticketBs     = cestaticketUsd × tasaBCV
 *   bonoBs            = (bonoMoneda == 'usd') ? bono × tasaBCV : bono
 *
 * El salario mínimo y el cestaticket salen del módulo venezuela-2026.ts (NO se
 * hardcodean). El bono de guerra se carga fresco cada mes (input), porque su
 * monto lo fija el Ejecutivo y varía.
 *
 * Fuentes: MinTrabajo / LOTTT (salario mínimo), Sistema Patria (bono), BCV
 * (tasa de conversión del cestaticket y del bono en USD).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  bonoGuerra?: number;    // monto del bono de este mes (fresco)
  bonoMoneda?: string;    // 'usd' | 'bs' (default 'usd')
  tasaBcv?: number;       // Bs. por USD; default BCV en vivo
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

const fmtUSD = (n: number): string =>
  '$ ' + new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100);

export function compute(i: Inputs): Outputs {
  const v = VENEZUELA_2026;
  const tasaBcv = i.tasaBcv != null && Number(i.tasaBcv) > 0 ? Number(i.tasaBcv) : v.fx.bcv;
  const bonoMoneda = String(i.bonoMoneda ?? 'usd') === 'bs' ? 'bs' : 'usd';
  const bonoInput = Math.max(0, Number(i.bonoGuerra) || 0);

  // Componente 1: salario mínimo legal (Bs., del módulo).
  const salarioMinimoBs = v.salarioMinimoVes;
  // Componente 2: cestaticket (USD del módulo → Bs. a tasa BCV).
  const cestaticketUsd = v.cestaticketUsd;
  const cestaticketBs = cestaticketUsd * tasaBcv;
  // Componente 3: bono de guerra (input; USD → Bs. si viene en dólares).
  const bonoBs = bonoMoneda === 'usd' ? bonoInput * tasaBcv : bonoInput;
  const bonoUsd = bonoMoneda === 'usd' ? bonoInput : (tasaBcv > 0 ? bonoInput / tasaBcv : 0);

  const ingresoIntegralBs = salarioMinimoBs + cestaticketBs + bonoBs;
  const ingresoIntegralUsd = tasaBcv > 0 ? ingresoIntegralBs / tasaBcv : 0;
  const salarioMinimoUsd = tasaBcv > 0 ? salarioMinimoBs / tasaBcv : 0;

  const narrativa =
    `A la tasa BCV de ${fmtVES(tasaBcv)} por dólar, el ingreso mínimo integral suma ${fmtVES(ingresoIntegralBs)} (${fmtUSD(ingresoIntegralUsd)}): ` +
    `salario mínimo ${fmtVES(salarioMinimoBs)} (${fmtUSD(salarioMinimoUsd)}) + cestaticket ${fmtVES(cestaticketBs)} (${fmtUSD(cestaticketUsd)})` +
    (bonoInput > 0
      ? ` + bono de guerra ${fmtVES(bonoBs)} (${fmtUSD(bonoUsd)}).`
      : `. Agregá el monto del Bono de Guerra Económica de este mes para ver el total real: el bono suele ser la mayor de las tres piezas.`) +
    ` El salario mínimo legal es una fracción mínima del total porque el grueso del ingreso viene por bonos indexados al dólar, que NO generan prestaciones ni utilidades.`;

  return {
    ingresoIntegralBs: Number(ingresoIntegralBs.toFixed(2)),
    ingresoIntegralUsd: Number(ingresoIntegralUsd.toFixed(2)),
    salarioMinimoBs: Number(salarioMinimoBs.toFixed(2)),
    cestaticketBs: Number(cestaticketBs.toFixed(2)),
    bonoGuerraBs: Number(bonoBs.toFixed(2)),
    detalle: `Ingreso integral: ${fmtVES(ingresoIntegralBs)} (${fmtUSD(ingresoIntegralUsd)}) — salario mínimo ${fmtVES(salarioMinimoBs)} + cestaticket ${fmtVES(cestaticketBs)}${bonoInput > 0 ? ` + bono ${fmtVES(bonoBs)}` : ' (sin bono cargado)'}`,
    _insight: { type: 'highlight', icon: '💵', text: narrativa },
    _table: {
      title: 'Composición del ingreso mínimo integral',
      headers: ['Componente', 'En bolívares', 'En dólares (BCV)', '¿Genera prestaciones?'],
      rows: [
        ['Salario mínimo (LOTTT)', fmtVES(salarioMinimoBs), fmtUSD(salarioMinimoUsd), 'Sí (única base legal)'],
        ['Cestaticket socialista', fmtVES(cestaticketBs), fmtUSD(cestaticketUsd), 'No'],
        ['Bono de Guerra Económica', bonoInput > 0 ? fmtVES(bonoBs) : '— (cargalo)', bonoInput > 0 ? fmtUSD(bonoUsd) : '—', 'No'],
        ['Ingreso mínimo integral', fmtVES(ingresoIntegralBs), fmtUSD(ingresoIntegralUsd), '—'],
      ],
      note: 'El salario mínimo y el cestaticket salen de los valores oficiales vigentes; el Bono de Guerra Económica lo asigna el Sistema Patria y cambia cada mes, por eso se ingresa manualmente. Solo el salario mínimo genera vacaciones, utilidades y prestaciones.',
    },
  };
}
