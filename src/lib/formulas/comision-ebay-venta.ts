/** Comision eBay */
export interface Inputs { precioVenta: number; costoEnvio: number; categoria: string; costoProducto: number; }
export interface Outputs { netoVendedor: number; totalFees: number; gananciaBruta: number; margenPct: number; }
export function comisionEbayVenta(i: Inputs): Outputs {
  const precio = Number(i.precioVenta);
  const envio = Number(i.costoEnvio);
  const cat = String(i.categoria || 'standard');
  const costo = Number(i.costoProducto);
  if (!precio || precio <= 0) throw new Error('Precio inválido');
  const fvfPct: Record<string, number> = { standard: 0.1325, electronics: 0.1235, clothing: 0.15, media: 0.146 };
  const pct = fvfPct[cat] || 0.1325;
  const fvf = (precio + envio) * pct;
  const payment = (precio + envio) * 0.029 + 0.30;
  const totalFees = fvf + payment;
  const neto = precio - totalFees;
  const ganancia = neto - costo;
  return {
    netoVendedor: Number(neto.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    gananciaBruta: Number(ganancia.toFixed(2)),
    margenPct: Number(((ganancia / precio) * 100).toFixed(2))
  };
}
