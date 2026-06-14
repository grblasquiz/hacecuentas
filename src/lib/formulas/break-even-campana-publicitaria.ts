/**
 * Calculadora de break-even de campaña publicitaria
 * Cuántas ventas hacen falta para recuperar la inversión en ads.
 *   ventas break-even = inversion / (ticket × margen/100)
 *   ingresos break-even = ventas × ticket
 *   ROAS break-even = 1 / (margen/100)
 */

export interface BreakEvenCampanaInputs {
  inversion: number; // $
  ticket_promedio: number; // $
  margen_bruto_pct: number; // %
}

export interface BreakEvenCampanaOutputs {
  ventasBreakEven: number;
  ingresosBreakEven: number;
  roasBreakEven: number;
  margenPorVenta: number;
  benchmark: string;
  _insight?: any;
  _chart?: any;
}

export function breakEvenCampanaPublicitaria(
  inputs: BreakEvenCampanaInputs
): BreakEvenCampanaOutputs {
  const inversion = Number(inputs.inversion);
  const ticket = Number(inputs.ticket_promedio);
  const margen = Math.max(0, Math.min(100, Number(inputs.margen_bruto_pct) || 0));

  if (!inversion || inversion <= 0) throw new Error('Ingresá la inversión publicitaria');
  if (!ticket || ticket <= 0) throw new Error('Ingresá el ticket promedio');
  if (!margen || margen <= 0) throw new Error('Ingresá el margen bruto (%)');

  const margenPorVenta = ticket * (margen / 100);
  const ventasBreakEvenExacto = inversion / margenPorVenta;
  // Hay que redondear hacia arriba: media venta no recupera nada
  const ventasBreakEven = Math.ceil(ventasBreakEvenExacto);
  const ingresosBreakEven = ventasBreakEven * ticket;
  const roasBreakEven = 100 / margen; // = 1 / (margen/100)

  let benchmark = '';
  if (roasBreakEven <= 1.5) benchmark = '💎 Margen alto — recuperás la inversión con poco ROAS';
  else if (roasBreakEven <= 2.5) benchmark = '✅ Break-even cómodo — ROAS de equilibrio razonable';
  else if (roasBreakEven <= 4) benchmark = '⚡ Break-even exigente — necesitás un ROAS alto para empatar';
  else benchmark = '⚠️ Break-even difícil — margen bajo exige mucho ROAS para no perder';

  const insightText = `Necesitás vender **${ventasBreakEven.toLocaleString('es-AR')} unidad${ventasBreakEven === 1 ? '' : 'es'}** (${'$'}${Math.round(ingresosBreakEven).toLocaleString('es-AR')} en ingresos) solo para **recuperar** los $${inversion.toLocaleString('es-AR')} invertidos en ads. Tu **ROAS de equilibrio** es **${(Math.round(roasBreakEven * 100) / 100)}×**: por debajo de ese múltiplo, la campaña pierde plata; por encima, empieza a dejar ganancia.`;

  const tone = roasBreakEven <= 2.5 ? 'good' : roasBreakEven <= 4 ? 'neutral' : 'warn';
  const roasR = Math.round(roasBreakEven * 100) / 100;
  const topSeg = Math.max(Math.ceil(roasBreakEven) + 2, 5);
  return {
    ventasBreakEven,
    ingresosBreakEven: Math.round(ingresosBreakEven),
    roasBreakEven: roasR,
    margenPorVenta: Math.round(margenPorVenta),
    benchmark,
    _insight: {
      title: 'Punto de equilibrio de la campaña',
      text: insightText,
      tone,
      icon: '⚖️',
    },
    _chart: {
      type: 'scale',
      marker: roasR,
      markerLabel: `${roasR}× ROAS`,
      min: 0,
      segments: [
        { nombre: 'Pierde', max: roasR, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Gana', max: topSeg, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `ROAS de equilibrio de ${roasR}× para recuperar la inversión`,
    },
  };
}
