/** Comision Etsy */
export interface Inputs { precioVenta: number; costoEnvio: number; costoProducto: number; offsiteAds: string; }
export interface Outputs { netoVendedor: number; totalFees: number; gananciaBruta: number; margenPct: number; }
export function comisionEtsyVentaHandmade(i: Inputs): Outputs {
  const precio = Number(i.precioVenta);
  const envio = Number(i.costoEnvio);
  const costo = Number(i.costoProducto);
  const oa = String(i.offsiteAds || 'no');
  if (!precio || precio <= 0) throw new Error('Precio inválido');
  const listingFee = 0.20;
  const transactionFee = (precio + envio) * 0.065;
  const paymentFee = (precio + envio) * 0.03 + 0.25;
  const offsitePct = oa === 'si12' ? 0.12 : oa === 'si15' ? 0.15 : 0;
  const offsiteFee = (precio + envio) * offsitePct;
  const totalFees = listingFee + transactionFee + paymentFee + offsiteFee;
  const neto = precio + envio - totalFees - envio;
  const ganancia = neto - costo;
  return {
    netoVendedor: Number(neto.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    gananciaBruta: Number(ganancia.toFixed(2)),
    margenPct: Number(((ganancia / precio) * 100).toFixed(2))
  };
}
