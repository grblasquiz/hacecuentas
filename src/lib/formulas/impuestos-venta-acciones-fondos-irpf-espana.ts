/** Impuestos por vender acciones y fondos de inversión (IRPF, base del ahorro) — España.
 *  La ganancia patrimonial (precio de venta − precio de compra − gastos y comisiones)
 *  tributa en la base del ahorro del IRPF con escala progresiva por tramos (2026):
 *    - Hasta 6.000 €: 19%
 *    - 6.000 – 50.000 €: 21%
 *    - 50.000 – 200.000 €: 23%
 *    - 200.000 – 300.000 €: 27%
 *    - Más de 300.000 €: 28%
 *  Si el resultado es pérdida, no se paga y puede compensarse con otras ganancias.
 *  En fondos de inversión existe el diferimiento por traspaso (no tributa hasta el reembolso).
 *  Fuente: art. 66 Ley 35/2006 del IRPF (escala del ahorro) y AEAT — ganancias patrimoniales. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

// Escala de la base del ahorro del IRPF 2026 (tramo hasta, tipo).
const TRAMOS_AHORRO: Array<{ hasta: number; tipo: number }> = [
  { hasta: 6000, tipo: 0.19 },
  { hasta: 50000, tipo: 0.21 },
  { hasta: 200000, tipo: 0.23 },
  { hasta: 300000, tipo: 0.27 },
  { hasta: Infinity, tipo: 0.28 },
];

function impuestoAhorro(base: number): number {
  let restante = base;
  let anterior = 0;
  let total = 0;
  for (const t of TRAMOS_AHORRO) {
    if (restante <= 0) break;
    const anchura = t.hasta - anterior;
    const gravado = Math.min(restante, anchura);
    total += gravado * t.tipo;
    restante -= gravado;
    anterior = t.hasta;
  }
  return total;
}

export interface Inputs {
  precioVenta: number;   // importe total de la venta (€)
  precioCompra: number;  // importe total de la compra (€)
  gastos?: number;       // comisiones de compra y venta (€), default 0
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const venta = Number(i.precioVenta) || 0;
  const compra = Number(i.precioCompra) || 0;
  const gastos = Math.max(0, Number(i.gastos) || 0);
  if (venta <= 0 || compra <= 0) throw new Error('Introduce el precio de compra y de venta');

  const ganancia = venta - compra - gastos;

  if (ganancia <= 0) {
    const perdida = Math.abs(ganancia);
    return {
      impuesto: fmtEur(0),
      ganancia: fmtEur(ganancia),
      neto: fmtEur(venta - gastos),
      tipoEfectivo: '0,00 %',
      detalle: `Con estos datos tienes una pérdida de ${fmtEur(perdida)}: no pagas IRPF y puedes compensarla con otras ganancias del ahorro (o hasta un 25% con rendimientos), y arrastrar el resto 4 años.`,
      _insight: {
        title: 'Pérdida patrimonial: no pagas',
        text: `La operación arroja una **pérdida de ${fmtEur(perdida)}**. No tributa y puedes **compensarla** con ganancias de otras ventas del ahorro; el saldo negativo no compensado se arrastra los **4 ejercicios** siguientes.`,
        tone: 'warning',
        icon: '📉',
      },
    };
  }

  const impuesto = impuestoAhorro(ganancia);
  const neto = ganancia - impuesto;
  const tipoEfectivo = (impuesto / ganancia) * 100;

  const _insight = {
    title: 'Lo que pagas por tu plusvalía',
    text: `Vendiste por **${fmtEur(venta)}** lo que costó **${fmtEur(compra)}**${gastos > 0 ? ` (más ${fmtEur(gastos)} de gastos)` : ''}: una ganancia de **${fmtEur(ganancia)}**. En la base del ahorro pagas **${fmtEur(impuesto)}** de IRPF (tipo efectivo **${tipoEfectivo.toFixed(2)}%**) y te quedan **${fmtEur(neto)}** limpios de beneficio.`,
    tone: 'neutral',
    icon: '📈',
  };
  const _chart = {
    type: 'bar',
    labels: ['Ganancia neta', 'IRPF'],
    values: [Math.round(neto), Math.round(impuesto)],
    prefix: '€ ',
    ariaLabel: `Ganancia neta ${fmtEur(neto)} e IRPF ${fmtEur(impuesto)}.`,
  };

  return {
    impuesto: fmtEur(impuesto),
    ganancia: fmtEur(ganancia),
    neto: fmtEur(neto),
    tipoEfectivo: `${tipoEfectivo.toFixed(2)} %`,
    detalle: `Ganancia ${fmtEur(ganancia)} (venta ${fmtEur(venta)} − compra ${fmtEur(compra)}${gastos > 0 ? ` − gastos ${fmtEur(gastos)}` : ''}). IRPF del ahorro ${fmtEur(impuesto)} (${tipoEfectivo.toFixed(2)}%). Beneficio neto ${fmtEur(neto)}.`,
    _insight,
    _chart,
  };
}
