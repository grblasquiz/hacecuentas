/** Costo total de operar acciones AR / CEDEAR entre brokers */
export interface Inputs { montoOperacion: number; comisionPct: number; derechoMercadoPct: number; ivaPct: number; arancelMinimo: number; }
export interface Outputs { comisionBruta: number; iva: number; derechoMercado: number; comisionTotal: number; netoOperado: number; costoPorcentual: number; explicacion: string; }
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
  return {
    comisionBruta: Number(comBruta.toFixed(2)),
    iva: Number(iva.toFixed(2)),
    derechoMercado: Number(derecho.toFixed(2)),
    comisionTotal: Number(total.toFixed(2)),
    netoOperado: Number(neto.toFixed(2)),
    costoPorcentual: Number(pct.toFixed(3)),
    explicacion: `Costo total: $${total.toFixed(2)} (${pct.toFixed(2)}% del monto). Te queda neto $${neto.toFixed(2)} de los $${monto.toLocaleString('es-AR')} operados.`,
  };
}
