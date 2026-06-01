/** Comision Etsy */
export interface Inputs { precioVenta: number; costoEnvio: number; costoProducto: number; offsiteAds: string; }
export interface Outputs { netoVendedor: number; totalFees: number; gananciaBruta: number; margenPct: number; _chart?: any; _insight?: any; }
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
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto vendedor', value: Math.max(0, Number(neto.toFixed(2))) },
      { label: 'Comisiones Etsy', value: Math.max(0, Number(totalFees.toFixed(2))) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(precio).toLocaleString('es-AR'),
    centerLabel: 'Precio venta',
    ariaLabel: 'Composición del precio de venta: neto para el vendedor y comisiones de Etsy.',
  };
  const margen = Number(((ganancia / precio) * 100).toFixed(2));
  const feesPct = precio > 0 ? (totalFees / precio) * 100 : 0;
  const oaNota = offsitePct > 0 ? ` El Offsite Ads suma **${(offsitePct * 100).toFixed(0)}%** extra de comisión.` : '';
  let insight: any;
  if (ganancia <= 0) {
    insight = {
      title: 'No cubrís costos',
      text: `Etsy se lleva **$${totalFees.toFixed(2)}** (**${feesPct.toFixed(1)}%** del precio) y la venta te deja **$${ganancia.toFixed(2)}**.${oaNota || ' Subí el precio o reducí el costo de materiales.'}`,
      tone: 'warn',
      icon: '📉',
    };
  } else if (margen < 20) {
    insight = {
      title: 'Margen ajustado para handmade',
      text: `Te quedan **$${ganancia.toFixed(2)}** (**${margen.toFixed(1)}%**). Las comisiones de Etsy se llevan **${feesPct.toFixed(1)}%**.${oaNota || ' Para hecho a mano conviene apuntar a 30%+ de margen.'}`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    insight = {
      title: 'Pieza bien valorizada',
      text: `Después de las comisiones de Etsy (**$${totalFees.toFixed(2)}**, **${feesPct.toFixed(1)}%** del precio) te quedan **$${ganancia.toFixed(2)}** limpios: un margen del **${margen.toFixed(1)}%**.${oaNota}`,
      tone: 'good',
      icon: '🧶',
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
