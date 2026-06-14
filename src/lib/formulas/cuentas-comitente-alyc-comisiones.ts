export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; _insight?: any; }
export function cuentasComitenteAlycComisiones(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';

  // El form manda '' (string vacío) cuando un campo opcional queda en blanco;
  // Number('') === 0, así que tratamos ''/null/undefined como "usar default".
  const num = (v: unknown, def: number): number => {
    if (v === '' || v === null || v === undefined) return def;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : def;
  };

  const monto = Math.max(0, Number(i.monto) || 0);
  // Comisión de la ALyC en % sobre el monto operado. Default ~0,5%.
  const comisionPct = num(i.comision, 0.5);
  // Derechos de mercado BYMA ≈ 0,08% del monto operado (editable según mercado/especie).
  const derechosPct = num(i.derechos, 0.08);
  // Alícuota de IVA sobre servicios de intermediación (Argentina): 21%.
  const ivaPct = num(i.iva, 21);

  const comision = monto * comisionPct / 100;
  const derechos = monto * derechosPct / 100;
  const baseIva = comision + derechos;
  const iva = baseIva * ivaPct / 100;
  const costoTotal = comision + derechos + iva;
  // En una compra, neto = lo que efectivamente te cuesta (monto + costos).
  // En una venta, neto = lo que recibís (monto − costos). Mostramos ambos sentidos.
  const netoCompra = monto + costoTotal;
  const netoVenta = monto - costoTotal;
  const costoSobreMonto = monto > 0 ? (costoTotal / monto) * 100 : 0;

  const fmt = (n: number) =>
    Math.round(n).toLocaleString(locale);
  const sym = (n: number) => '$' + fmt(n);

  const resumen = __lang === 'en'
    ? `On a ${sym(monto)} trade: ${comisionPct.toLocaleString(locale)}% commission + ${derechosPct.toLocaleString(locale)}% market fees + ${ivaPct}% VAT = ${sym(costoTotal)} total cost (${costoSobreMonto.toFixed(2)}% of the amount).`
    : `Sobre ${sym(monto)} operados: ${comisionPct.toLocaleString(locale)}% comisión + ${derechosPct.toLocaleString(locale)}% derechos de mercado + ${ivaPct}% IVA = ${sym(costoTotal)} de costo total (${costoSobreMonto.toFixed(2)}% del monto).`;

  const tone = costoSobreMonto >= 1 ? 'warn' : 'neutral';
  const _insight = __lang === 'en'
    ? {
        title: 'Total trading cost',
        text: `A **${sym(monto)}** trade costs **${sym(costoTotal)}** in fees: **${sym(comision)}** broker commission + **${sym(derechos)}** market fees + **${sym(iva)}** VAT. That's **${costoSobreMonto.toFixed(2)}%** of the amount. Buying, you'd disburse **${sym(netoCompra)}**; selling, you'd net **${sym(netoVenta)}**.`,
        tone,
        icon: '📊',
      }
    : {
        title: 'Costo total de operar',
        text: `Operar **${sym(monto)}** te cuesta **${sym(costoTotal)}** en cargos: **${sym(comision)}** de comisión de la ALyC + **${sym(derechos)}** de derechos de mercado + **${sym(iva)}** de IVA. Es el **${costoSobreMonto.toFixed(2)}%** del monto. Si comprás, desembolsás **${sym(netoCompra)}**; si vendés, recibís **${sym(netoVenta)}**.`,
        tone,
        icon: '📊',
      };

  const slices = [
    { label: __lang === 'en' ? 'Commission' : 'Comisión', value: Math.round(comision) },
    { label: __lang === 'en' ? 'Market fees' : 'Derechos', value: Math.round(derechos) },
    { label: 'IVA', value: Math.round(iva) },
  ].filter(s => s.value > 0);
  const _chart = slices.length >= 2 ? {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: sym(costoTotal),
    centerLabel: __lang === 'en' ? 'Total cost' : 'Costo total',
    ariaLabel: __lang === 'en'
      ? 'Cost breakdown: broker commission, market fees and VAT.'
      : 'Desglose del costo: comisión de la ALyC, derechos de mercado e IVA.',
  } : undefined;

  return {
    costoTotal: sym(costoTotal),
    comision: sym(comision),
    derechos: sym(derechos),
    iva: sym(iva),
    netoCompra: sym(netoCompra),
    netoVenta: sym(netoVenta),
    resumen,
    _insight,
    _chart,
  };
}
