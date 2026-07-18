/**
 * Bonos del programa SUPÉRATE — República Dominicana. Suma las transferencias
 * mensuales que recibe un hogar en la tarjeta Supérate (ADESS):
 *   - Aliméntate: RD$1.600/mes (fijo) — subsidio de alimentos.
 *   - Bonogás Hogar: RD$470/mes (fijo) — compra de GLP (gas de cocina).
 *   - Bonoluz: VARÍA por consumo eléctrico (se descuenta de la factura); editable.
 * Devuelve el total mensual y anual según los componentes seleccionados.
 * Fuente: Supérate (superate.gob.do) / ADESS, 2026.
 */
import { SUPERATE_2026, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  alimentate?: string; // 'si' | 'no'
  bonogas?: string;    // 'si' | 'no'
  bonoluz?: string;    // 'si' | 'no'
  montoBonoluz?: number; // RD$/mes de Bonoluz (varía; default referencia)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}
function si(v: unknown, def = true): boolean {
  if (v === undefined || v === null || v === '') return def;
  return String(v) === 'si';
}

export function compute(i: Inputs): Outputs {
  const tieneAlim = si(i.alimentate, true);
  const tieneGas = si(i.bonogas, true);
  const tieneLuz = si(i.bonoluz, false);
  const montoLuz = tieneLuz ? Math.max(0, num(i.montoBonoluz, SUPERATE_2026.bonoluzReferencia)) : 0;

  const alim = tieneAlim ? SUPERATE_2026.alimentate : 0;
  const gas = tieneGas ? SUPERATE_2026.bonogasHogar : 0;
  const totalMensual = alim + gas + montoLuz;
  const totalAnual = totalMensual * 12;

  if (totalMensual === 0) throw new Error('Seleccioná al menos un bono que recibas');

  const partes: string[] = [];
  if (tieneAlim) partes.push(`Aliméntate ${fmtDOP(alim)}`);
  if (tieneGas) partes.push(`Bonogás Hogar ${fmtDOP(gas)}`);
  if (tieneLuz) partes.push(`Bonoluz ${fmtDOP(montoLuz)}`);

  const detalle = `${partes.join(' + ')} = ${fmtDOP(totalMensual)} al mes (${fmtDOP(totalAnual)} al año).`;

  const _insight = {
    title: `Recibís ${fmtDOP(totalMensual)} al mes`,
    text:
      `Con ${partes.length === 1 ? 'el bono seleccionado' : 'los bonos seleccionados'} (${partes.join(', ')}), ` +
      `tu hogar recibe **${fmtDOP(totalMensual)}** mensuales en la tarjeta Supérate, unos **${fmtDOP(totalAnual)}** al año. ` +
      `Aliméntate (${fmtDOP(SUPERATE_2026.alimentate)}) y Bonogás Hogar (${fmtDOP(SUPERATE_2026.bonogasHogar)}) son montos fijos; ` +
      `**Bonoluz varía** según el consumo eléctrico del hogar y se descuenta de la factura de luz. Los depósitos se acreditan alrededor del día 15 de cada mes.`,
    tone: 'neutral' as const,
    icon: '🪙',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      ...(tieneAlim ? [{ label: 'Aliméntate', value: alim }] : []),
      ...(tieneGas ? [{ label: 'Bonogás Hogar', value: gas }] : []),
      ...(tieneLuz ? [{ label: 'Bonoluz', value: Math.round(montoLuz) }] : []),
    ],
    prefix: 'RD$',
    centerValue: fmtDOP(totalMensual),
    centerLabel: 'Total mensual',
    ariaLabel: 'Composición del subsidio mensual Supérate por componente',
  };

  return {
    totalMensual: fmtDOP(totalMensual),
    totalAnual: fmtDOP(totalAnual),
    detalle,
    _insight,
    _chart,
  };
}
