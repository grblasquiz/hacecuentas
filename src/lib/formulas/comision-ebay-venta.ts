/** Comision eBay */
export interface Inputs { precioVenta: number; costoEnvio: number; categoria: string; costoProducto: number; }
export interface Outputs { netoVendedor: number; totalFees: number; gananciaBruta: number; margenPct: number; _chart?: any; _insight?: any; }
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
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto vendedor', value: Math.max(0, Number(neto.toFixed(2))) },
      { label: 'Comisiones eBay', value: Math.max(0, Number(totalFees.toFixed(2))) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(precio).toLocaleString('es-AR'),
    centerLabel: 'Precio venta',
    ariaLabel: 'Composición del precio de venta: neto para el vendedor y comisiones de eBay.',
  };
  const margen = Number(((ganancia / precio) * 100).toFixed(2));
  const feesPct = precio > 0 ? (totalFees / precio) * 100 : 0;
  let insight: any;
  if (ganancia <= 0) {
    insight = {
      title: 'La venta no deja ganancia',
      text: `eBay se lleva **$${totalFees.toFixed(2)}** (**${feesPct.toFixed(1)}%** del precio) y, con tu costo, cada venta te deja **$${ganancia.toFixed(2)}**. Subí el precio o ajustá el costo del producto.`,
      tone: 'warn',
      icon: '📉',
    };
  } else if (margen < 15) {
    insight = {
      title: 'Margen finito',
      text: `Te quedan **$${ganancia.toFixed(2)}** (**${margen.toFixed(1)}%** del precio). Entre la comisión por categoría y el fee de pago, eBay se lleva **${feesPct.toFixed(1)}%**: poco colchón ante una devolución.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    insight = {
      title: 'Venta con buen margen',
      text: `Después de las comisiones de eBay (**$${totalFees.toFixed(2)}**, **${feesPct.toFixed(1)}%** del precio) te quedan **$${ganancia.toFixed(2)}** limpios, un margen del **${margen.toFixed(1)}%**.`,
      tone: 'good',
      icon: '🏷️',
    };
  }
  return {
    netoVendedor: Number(neto.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    gananciaBruta: Number(ganancia.toFixed(2)),
    margenPct: margen,
    _chart: chart,
    _insight: insight
  };
}
