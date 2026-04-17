/** Comision Amazon FBA */
export interface Inputs { precioVenta: number; referralPct: number; fulfillmentFee: number; costoProducto: number; storageFee: number; }
export interface Outputs { netoVendedor: number; totalFees: number; gananciaBruta: number; roiPct: number; margenPct: number; }
export function comisionAmazonFbaProducto(i: Inputs): Outputs {
  const precio = Number(i.precioVenta);
  const refPct = Number(i.referralPct) / 100;
  const fba = Number(i.fulfillmentFee);
  const costo = Number(i.costoProducto);
  const storage = Number(i.storageFee);
  if (!precio || precio <= 0) throw new Error('Precio inválido');
  const referral = precio * refPct;
  const total = referral + fba + storage;
  const neto = precio - total;
  const ganancia = neto - costo;
  return {
    netoVendedor: Number(neto.toFixed(2)),
    totalFees: Number(total.toFixed(2)),
    gananciaBruta: Number(ganancia.toFixed(2)),
    roiPct: costo > 0 ? Number(((ganancia / costo) * 100).toFixed(2)) : 0,
    margenPct: Number(((ganancia / precio) * 100).toFixed(2))
  };
}
