/** Calculadora de Breakeven por Comisiones y Spread */
export interface Inputs { precioEntrada: number; tamanoPosicion: number; comisionEntradaPorc: number; comisionSalidaPorc: number; spreadPorcentaje: number; direccion: 'long'|'short'; }
export interface Outputs { precioBreakeven: number; movimientoNecesario: number; costoTotalFees: number; resumen: string; _chart?: any; }
export function breakevenTradeComisiones(i: Inputs): Outputs {
  const ent = Number(i.precioEntrada); const tam = Number(i.tamanoPosicion);
  const fe = Number(i.comisionEntradaPorc)/100;
  const fs = Number(i.comisionSalidaPorc)/100;
  const sp = Number(i.spreadPorcentaje)/100;
  if (!ent || ent <= 0) throw new Error('Ingresá entrada');
  if (!tam || tam <= 0) throw new Error('Ingresá tamaño');
  const costoPct = fe + fs + sp;
  const costoTotal = ent * tam * costoPct;
  const be = i.direccion === 'long' ? ent * (1 + costoPct) : ent * (1 - costoPct);
  const notional = ent * tam;
  const rawSlices = [
    { label: 'Comisión entrada', value: Number((notional * fe).toFixed(2)) },
    { label: 'Comisión salida', value: Number((notional * fs).toFixed(2)) },
    { label: 'Spread', value: Number((notional * sp).toFixed(2)) },
  ].filter(s => s.value > 0);
  const chart = rawSlices.length >= 2 ? {
    type: 'doughnut' as const,
    slices: rawSlices,
    prefix: '$',
    centerValue: '$' + Math.round(costoTotal).toLocaleString('es-AR'),
    centerLabel: 'Costo total',
    ariaLabel: 'Desglose del costo total: comisión de entrada, de salida y spread.',
  } : undefined;
  return {
    precioBreakeven: Number(be.toFixed(4)),
    movimientoNecesario: Number((costoPct * 100).toFixed(3)),
    costoTotalFees: Number(costoTotal.toFixed(2)),
    resumen: `Breakeven a ${be.toFixed(2)} (mov ${(costoPct*100).toFixed(2)}%). Costo total: ${costoTotal.toFixed(2)}.`,
    _chart: chart,
  };
}