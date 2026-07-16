/**
 * Costo real de las cuotas del programa Cuota Simple (ex Ahora 12).
 *
 * Cuota Simple es el programa nacional que reemplazó a Ahora 12: ofrece compras
 * en 3 y 6 cuotas fijas con una TASA TOPE que fija el Ministerio de Economía y
 * que los bancos no pueden superar. No son "cuotas sin interés": tienen una TNA
 * regulada. Esta calc muestra la cuota, el total y el CFT real de esa TNA.
 *
 *   Cuota (sistema francés) = capital × i × (1+i)^n / ((1+i)^n − 1)
 *   donde i = TNA/12 (tasa mensual) y n = cantidad de cuotas.
 *   Total = cuota × n ; Recargo = total − capital.
 *   CFT anual ≈ (1 + i)^12 − 1  (sin computar IVA sobre intereses ni sellos).
 *
 * La TNA es editable porque el tope se actualiza; el default es referencial.
 */

export interface Inputs {
  monto: number;              // precio de contado del producto
  cantidadCuotas?: number;    // 3 o 6 (también admite 1, 2, 9, 12 de comercios adheridos)
  tnaPrograma?: number;       // TNA tope del programa, % anual (editable, referencial)
}

export interface Outputs {
  cuotaMensual: string;
  totalFinanciado: string;
  recargo: string;
  recargoPorcentual: string;
  cftAnual: string;
  tasaMensual: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number): string => '$' + Math.round(n).toLocaleString('es-AR');

export function compute(i: Inputs): Outputs {
  const capital = Number(i.monto) || 0;
  const n = Math.max(1, Math.round(Number(i.cantidadCuotas) || 3));
  const tna = Number(i.tnaPrograma);
  // Default referencial si no se ingresa (el tope real lo publica Economía).
  const tnaPct = Number.isFinite(tna) && tna >= 0 ? tna : 63;

  if (capital <= 0) throw new Error('Ingresá el precio de contado del producto.');

  const iMensual = tnaPct / 100 / 12;
  const cuota = iMensual === 0
    ? capital / n
    : capital * iMensual * Math.pow(1 + iMensual, n) / (Math.pow(1 + iMensual, n) - 1);
  const total = cuota * n;
  const recargo = total - capital;
  const recargoPct = capital > 0 ? (recargo / capital) * 100 : 0;
  const cftAnual = (Math.pow(1 + iMensual, 12) - 1) * 100;

  const _insight = {
    title: recargo > 0 ? `Pagás ${fmt(recargo)} de más` : 'Sin recargo',
    text: recargo > 0
      ? `Financiar **${fmt(capital)}** en **${n} cuotas** de Cuota Simple con una TNA del **${tnaPct.toFixed(1)}%** te deja una cuota de **${fmt(cuota)}** y un total de **${fmt(total)}**: pagás **${fmt(recargo)}** más que al contado (**${recargoPct.toFixed(1)}%**), un CFT anual del **${cftAnual.toFixed(1)}%**. No son cuotas sin interés: si tenés la plata, comparalo con pagar al contado.`
      : `Con TNA 0% las **${n} cuotas** son realmente sin interés: pagás **${fmt(total)}**, lo mismo que al contado. Aprovechá la financiación.`,
    tone: recargo > 0 ? 'warn' : 'good',
    icon: '🛒',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Precio de contado', value: Math.round(capital) },
      { label: 'Recargo financiero', value: Math.round(Math.max(0, recargo)) },
    ],
    prefix: '$',
    centerValue: fmt(total),
    centerLabel: `Total en ${n} cuotas`,
    ariaLabel: `El total financiado de ${fmt(total)} en ${n} cuotas se compone del precio de contado ${fmt(capital)} más un recargo de ${fmt(recargo)}.`,
  };

  return {
    cuotaMensual: fmt(cuota),
    totalFinanciado: fmt(total),
    recargo: fmt(recargo),
    recargoPorcentual: recargoPct.toFixed(1).replace('.', ',') + '%',
    cftAnual: cftAnual.toFixed(1).replace('.', ',') + '%',
    tasaMensual: iMensual > 0 ? (iMensual * 100).toFixed(2).replace('.', ',') + '%' : '0%',
    detalle: `${n} cuotas de ${fmt(cuota)} = ${fmt(total)} (TNA ${tnaPct.toFixed(1)}%, CFT ${cftAnual.toFixed(1)}%). Recargo ${fmt(recargo)} sobre ${fmt(capital)}.`,
    _insight,
    _chart,
  };
}
