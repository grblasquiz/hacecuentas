/** Margen dropshipping */
export interface Inputs { precioVenta: number; costoAliexpress: number; shippingProveedor: number; cpaAds: number; processingPct: number; returnsPct: number; }
export interface Outputs { margenNeto: number; margenPct: number; costoTotal: number; roasMinimo: number; }
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
  return {
    margenNeto: Number(margen.toFixed(2)),
    margenPct: Number(((margen / precio) * 100).toFixed(2)),
    costoTotal: Number(totalCost.toFixed(2)),
    roasMinimo: cpa > 0 ? Number((precio / cpa).toFixed(2)) : 0
  };
}
