/** Comision Amazon FBA */
export interface Inputs { precioVenta: number; referralPct: number; fulfillmentFee: number; costoProducto: number; storageFee: number; }
export interface Outputs { netoVendedor: number; totalFees: number; gananciaBruta: number; roiPct: number; margenPct: number; _chart?: any; _insight?: any; }
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

  const margen = Number(((ganancia / precio) * 100).toFixed(2));
  const feesPct = precio > 0 ? (total / precio) * 100 : 0;
  let insight: any;
  if (ganancia <= 0) {
    insight = {
      title: 'Estás perdiendo plata',
      text: `Después de fees y costo del producto, cada venta te deja **$${ganancia.toFixed(2)}**. Subí el precio o bajá el costo: con Amazon llevándose **${feesPct.toFixed(1)}%** del precio, no cierra.`,
      tone: 'warn',
      icon: '📉',
    };
  } else if (margen < 15) {
    insight = {
      title: 'Margen ajustado',
      text: `Ganás **$${ganancia.toFixed(2)}** por unidad, apenas **${margen.toFixed(1)}%** del precio. Amazon se queda con **${feesPct.toFixed(1)}%** en fees: un imprevisto (devolución, storage) te puede dejar en rojo.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    insight = {
      title: 'Producto rentable',
      text: `Te quedan **$${ganancia.toFixed(2)}** por unidad (**${margen.toFixed(1)}%** de margen) con un ROI de **${costo > 0 ? ((ganancia / costo) * 100).toFixed(1) : '0'}%**. Los fees de Amazon se llevan **${feesPct.toFixed(1)}%** del precio.`,
      tone: 'good',
      icon: '📦',
    };
  }

  return {
    netoVendedor: Number(neto.toFixed(2)),
    totalFees: Number(total.toFixed(2)),
    gananciaBruta: Number(ganancia.toFixed(2)),
    roiPct: costo > 0 ? Number(((ganancia / costo) * 100).toFixed(2)) : 0,
    margenPct: margen,
    _chart: chart,
    _insight: insight
  };
}
