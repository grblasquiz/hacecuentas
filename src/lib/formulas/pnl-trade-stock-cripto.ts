/** Calculadora de PnL (Profit and Loss) por Trade */
export interface Inputs { precioEntrada: number; precioSalida: number; cantidad: number; comisionTotal: number; riesgoInicial?: number; direccion: 'long'|'short'; }
export interface Outputs { pnlBruto: number; pnlNeto: number; rendimientoPorcentaje: number; multiploR: number; resumen: string; }
export function pnlTradeStockCripto(i: Inputs): Outputs {
  const e = Number(i.precioEntrada); const s = Number(i.precioSalida);
  const q = Number(i.cantidad); const f = Number(i.comisionTotal) || 0;
  const r = Number(i.riesgoInicial) || 0;
  if (!e || e <= 0) throw new Error('Ingresá entrada');
  if (!s || s <= 0) throw new Error('Ingresá salida');
  if (!q || q <= 0) throw new Error('Ingresá cantidad');
  const bruto = i.direccion === 'long' ? (s - e) * q : (e - s) * q;
  const neto = bruto - f;
  const cap = e * q;
  const pct = (neto / cap) * 100;
  const rMult = r > 0 ? neto / r : 0;
  return {
    pnlBruto: Number(bruto.toFixed(2)),
    pnlNeto: Number(neto.toFixed(2)),
    rendimientoPorcentaje: Number(pct.toFixed(2)),
    multiploR: Number(rMult.toFixed(2)),
    resumen: `${neto >= 0 ? 'Ganancia' : 'Pérdida'} neta: ${neto.toFixed(2)} USD (${pct.toFixed(2)}%). ${r > 0 ? `${rMult.toFixed(2)}R.` : ''}`,
  };
}