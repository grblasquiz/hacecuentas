/** Comision Amazon FBA */
export interface Inputs { precioVenta: number; referralPct: number; fulfillmentFee: number; costoProducto: number; storageFee: number; }
export interface Outputs { netoVendedor: number; totalFees: number; gananciaBruta: number; roiPct: number; margenPct: number; _chart?: any; }
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

  // Donut: el precio de venta se descompone en costo del producto + fees Amazon + ganancia.
  // Solo si hay ganancia y costo positivos (si hay pérdida, las partes no suman el precio).
  let chart: any = undefined;
  if (ganancia > 0 && costo > 0 && total > 0) {
    chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Costo producto', value: Number(costo.toFixed(2)) },
        { label: 'Fees Amazon', value: Number(total.toFixed(2)) },
        { label: 'Ganancia', value: Number(ganancia.toFixed(2)) },
      ],
      prefix: '$',
      centerValue: '$' + Math.round(precio).toLocaleString('es-AR'),
      centerLabel: 'Precio venta',
      ariaLabel: 'Composición del precio de venta: costo del producto, comisiones de Amazon y ganancia',
    };
  }

  return {
    netoVendedor: Number(neto.toFixed(2)),
    totalFees: Number(total.toFixed(2)),
    gananciaBruta: Number(ganancia.toFixed(2)),
    roiPct: costo > 0 ? Number(((ganancia / costo) * 100).toFixed(2)) : 0,
    margenPct: Number(((ganancia / precio) * 100).toFixed(2)),
    _chart: chart
  };
}
