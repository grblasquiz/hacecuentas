/** Margen dropshipping */
export interface Inputs { precioVenta: number; costoAliexpress: number; shippingProveedor: number; cpaAds: number; processingPct: number; returnsPct: number; }
export interface Outputs { margenNeto: number; margenPct: number; costoTotal: number; roasMinimo: number; _chart?: any; }
export function margenDropshippingReal(i: Inputs): Outputs {
  const precio = Number(i.precioVenta);
  const cost = Number(i.costoAliexpress);
  const ship = Number(i.shippingProveedor);
  const cpa = Number(i.cpaAds);
  const pp = Number(i.processingPct) / 100;
  const ret = Number(i.returnsPct) / 100;
  if (!precio || precio <= 0) throw new Error('Precio inválido');
  const processing = precio * pp;
  const returns = precio * ret;
  const totalCost = cost + ship + cpa + processing + returns;
  const margen = precio - totalCost;
  const chart =
    margen >= 0
      ? {
          type: 'doughnut' as const,
          slices: [
            { label: 'Producto', value: Number(cost.toFixed(2)) },
            { label: 'Envío proveedor', value: Number(ship.toFixed(2)) },
            { label: 'Publicidad (CPA)', value: Number(cpa.toFixed(2)) },
            { label: 'Procesamiento', value: Number(processing.toFixed(2)) },
            { label: 'Devoluciones', value: Number(returns.toFixed(2)) },
            { label: 'Margen neto', value: Number(margen.toFixed(2)) },
          ].filter((s) => s.value > 0),
          prefix: '$',
          centerValue: '$' + Math.round(precio).toLocaleString('es-AR'),
          centerLabel: 'Precio venta',
          ariaLabel: 'Composición del precio de venta: costos (producto, envío, ads, procesamiento, devoluciones) y margen neto.',
        }
      : undefined;
  return {
    margenNeto: Number(margen.toFixed(2)),
    margenPct: Number(((margen / precio) * 100).toFixed(2)),
    costoTotal: Number(totalCost.toFixed(2)),
    roasMinimo: cpa > 0 ? Number((precio / cpa).toFixed(2)) : 0,
    _chart: chart
  };
}
