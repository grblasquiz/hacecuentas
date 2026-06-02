/** Margen dropshipping */
export interface Inputs { precioVenta: number; costoAliexpress: number; shippingProveedor: number; cpaAds: number; processingPct: number; returnsPct: number; }
export interface Outputs { margenNeto: number; margenPct: number; costoTotal: number; roasMinimo: number; _chart?: any; _insight?: any; }
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
  const margenPct = (margen / precio) * 100;
  const roasMin = cpa > 0 ? precio / cpa : 0;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  let tone: 'good' | 'warn' | 'neutral';
  if (margen <= 0) tone = 'warn';
  else if (margenPct < 15) tone = 'warn';
  else if (margenPct < 30) tone = 'neutral';
  else tone = 'good';
  const _insight = {
    title: 'Tu margen real',
    text: margen <= 0
      ? `Vendiendo a **${fmt(precio)}** quedás en **${fmt(margen)}** netos: estás **perdiendo plata** una vez sumás producto, envío, ads (CPA ${fmt(cpa)}), procesamiento y devoluciones. Subí el precio o bajá el CPA.`
      : `De los **${fmt(precio)}** que cobrás, te quedan **${fmt(margen)}** netos (**${margenPct.toFixed(1)}%**) tras producto, envío, ads, procesamiento y devoluciones.${roasMin > 0 ? ` Necesitás un **ROAS mínimo de ${roasMin.toFixed(2)}** para no perder con la publicidad.` : ''} ${margenPct < 15 ? 'Margen **muy fino** para dropshipping: cualquier suba de CPA o tanda de devoluciones te come la ganancia.' : margenPct < 30 ? 'Margen ajustado pero trabajable; vigilá el CPA de cerca.' : 'Margen **sano** para escalar con tráfico pago.'}`,
    tone,
    icon: '📦',
  };
  return {
    margenNeto: Number(margen.toFixed(2)),
    margenPct: Number(margenPct.toFixed(2)),
    costoTotal: Number(totalCost.toFixed(2)),
    roasMinimo: cpa > 0 ? Number(roasMin.toFixed(2)) : 0,
    _chart: chart,
    _insight
  };
}
