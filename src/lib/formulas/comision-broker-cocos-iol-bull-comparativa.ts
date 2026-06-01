/** Costo total de operar acciones AR / CEDEAR entre brokers */
export interface Inputs { montoOperacion: number; comisionPct: number; derechoMercadoPct: number; ivaPct: number; arancelMinimo: number; }
export interface Outputs { comisionBruta: number; iva: number; derechoMercado: number; comisionTotal: number; netoOperado: number; costoPorcentual: number; explicacion: string; _chart?: any; }
export function comisionBrokerCocosIolBullComparativa(i: Inputs): Outputs {
  const monto = Number(i.montoOperacion);
  const comPct = Number(i.comisionPct) / 100;
  const derPct = Number(i.derechoMercadoPct) / 100;
  const ivaPct = Number(i.ivaPct) / 100;
  const minimo = Number(i.arancelMinimo) || 0;
  if (!monto || monto <= 0) throw new Error('Ingresá el monto');
  const comBruta = Math.max(monto * comPct, minimo);
  const iva = comBruta * ivaPct;
  const derecho = monto * derPct;
  const total = comBruta + iva + derecho;
  const neto = monto - total;
  const pct = (total / monto) * 100;

  // Donut: el monto operado se descompone en neto + comisión + IVA + derecho de mercado.
  // Solo si el neto es positivo (las partes suman el monto operado).
  let chart: any = undefined;
  if (neto > 0) {
    const slices = [
      { label: 'Neto operado', value: Number(neto.toFixed(2)) },
      { label: 'Comisión', value: Number(comBruta.toFixed(2)) },
      { label: 'IVA', value: Number(iva.toFixed(2)) },
      { label: 'Derecho de mercado', value: Number(derecho.toFixed(2)) },
    ].filter((s) => s.value > 0);
    chart = {
      type: 'doughnut' as const,
      slices,
      prefix: '$',
      centerValue: '$' + Math.round(monto).toLocaleString('es-AR'),
      centerLabel: 'Monto operado',
      ariaLabel: 'Composición del monto operado: neto, comisión, IVA y derecho de mercado',
    };
  }

  return {
    comisionBruta: Number(comBruta.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    derechoMercado: Number(derecho.toFixed(2)),
    comisionTotal: Number(total.toFixed(2)),
    netoOperado: Number(neto.toFixed(2)),
    costoPorcentual: Number(pct.toFixed(3)),
    explicacion: `Costo total: $${total.toFixed(2)} (${pct.toFixed(2)}% del monto). Te queda neto $${neto.toFixed(2)} de los $${monto.toLocaleString('es-AR')} operados.`,
    _chart: chart,
  };
}
