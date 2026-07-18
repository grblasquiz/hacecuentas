/**
 * Impuesto sobre la ganancia de capital por venta de un inmueble — República
 * Dominicana (Art. 289, Código Tributario). Distinto del 3% de transferencia.
 *
 *   costoAjustado = costoAdquisición × multiplicador de inflación (DGII)
 *   ganancia      = precioVenta − costoAjustado − gastos deducibles
 *   impuesto      = persona jurídica: ganancia × 27%
 *                   persona física:  escala progresiva del ISR (isrAnual)
 * El multiplicador lo publica la DGII cada año por resolución (según el IPC del
 * BCRD) para el año de adquisición; la calc lo deja editable (default 1 = sin
 * ajuste) con enlace a la resolución. NO se hardcodea la tabla anual (cambia).
 */
import { GANANCIA_CAPITAL_DO, isrAnual, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  precioVenta: number;
  costoAdquisicion: number;
  multiplicador?: number;   // multiplicador de ajuste por inflación (DGII), default 1
  gastos?: number;          // gastos/mejoras deducibles (RD$), opcional
  contribuyente?: string;   // 'juridica' (27%) | 'fisica' (escala ISR)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const precio = num(i.precioVenta, 0);
  const costo = num(i.costoAdquisicion, 0);
  if (!(precio > 0)) throw new Error('Ingresá el precio de venta en RD$');
  if (!(costo > 0)) throw new Error('Ingresá el costo de adquisición en RD$');

  const multiplicador = Math.max(1, num(i.multiplicador, 1));
  const gastos = Math.max(0, num(i.gastos, 0));
  const esJuridica = String(i.contribuyente || 'fisica') === 'juridica';

  const costoAjustado = costo * multiplicador;
  const ganancia = Math.max(0, precio - costoAjustado - gastos);

  let impuesto = 0;
  let tasaTxt = '';
  if (esJuridica) {
    impuesto = ganancia * GANANCIA_CAPITAL_DO.tasaPersonaJuridica;
    tasaTxt = '27% (persona jurídica)';
  } else {
    impuesto = isrAnual(ganancia); // escala progresiva del ISR
    tasaTxt = ganancia > 0 ? `${((impuesto / ganancia) * 100).toFixed(1)}% efectivo (escala ISR)` : 'escala ISR';
  }
  const neto = precio - impuesto;

  const detalle =
    `Costo ajustado ${fmtDOP(costo)} × ${multiplicador} = ${fmtDOP(costoAjustado)}. ` +
    `Ganancia = ${fmtDOP(precio)} − ${fmtDOP(costoAjustado)}${gastos > 0 ? ` − ${fmtDOP(gastos)} de gastos` : ''} = ${fmtDOP(ganancia)}. ` +
    `Impuesto (${tasaTxt}) = ${fmtDOP(impuesto)}.`;

  const _insight = {
    title: ganancia > 0 ? `Impuesto a pagar: ${fmtDOP(impuesto)}` : 'Sin ganancia gravable',
    text: ganancia > 0
      ? `Vendés en **${fmtDOP(precio)}** un inmueble cuyo costo ajustado por inflación es **${fmtDOP(costoAjustado)}** (costo ${fmtDOP(costo)} × multiplicador **${multiplicador}**). ` +
        `La ganancia de capital es **${fmtDOP(ganancia)}** y el impuesto (**${tasaTxt}**) es **${fmtDOP(impuesto)}**. ` +
        `Esto es aparte del **3% de transferencia** que se paga al traspasar el título. El multiplicador correcto para tu año de compra lo publica la DGII: ajustalo arriba.`
      : `Con el costo ajustado por inflación (**${fmtDOP(costoAjustado)}**), la venta a **${fmtDOP(precio)}** no arroja ganancia de capital gravable. Recordá que el **3% de transferencia** se paga igual al traspasar el inmueble.`,
    tone: 'neutral' as const,
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Costo ajustado', value: Math.round(costoAjustado) },
      ...(gastos > 0 ? [{ label: 'Gastos', value: Math.round(gastos) }] : []),
      { label: 'Ganancia neta', value: Math.max(0, Math.round(ganancia - impuesto)) },
      ...(impuesto > 0 ? [{ label: 'Impuesto', value: Math.round(impuesto) }] : []),
    ].filter((s) => s.value > 0),
    prefix: 'RD$',
    centerValue: fmtDOP(precio),
    centerLabel: 'Precio de venta',
    ariaLabel: 'Reparto del precio de venta: costo ajustado, gastos, ganancia neta e impuesto',
  };

  return {
    impuesto: fmtDOP(impuesto),
    ganancia: fmtDOP(ganancia),
    costoAjustado: fmtDOP(costoAjustado),
    neto: fmtDOP(neto),
    detalle,
    _insight,
    _chart,
  };
}
