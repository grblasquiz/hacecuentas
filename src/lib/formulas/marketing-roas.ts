/**
 * Calculadora de ROAS (Return On Ad Spend)
 * ROAS = ingresos generados / inversión en publicidad
 * También: rentabilidad publicitaria = ROAS × margen neto por venta
 */

export interface RoasInputs {
  ingresos: number;
  inversion: number;
  margenBruto: number; // % (opcional, para ROAS neto)
}

export interface RoasOutputs {
  roas: number;
  roasX: string; // "3.5×"
  roasPorcentaje: number;
  ganancia: number;
  gananciaNetaAprox: number;
  breakEvenROAS: number;
  benchmark: string;
  _insight?: any;
  _chart?: any;
}

export function marketingRoas(inputs: RoasInputs): RoasOutputs {
  const ingresos = Number(inputs.ingresos);
  const inversion = Number(inputs.inversion);
  const margen = Math.max(0, Math.min(100, Number(inputs.margenBruto) || 0));

  if (!ingresos || ingresos <= 0) throw new Error('Ingresá los ingresos generados');
  if (!inversion || inversion <= 0) throw new Error('Ingresá la inversión publicitaria');

  const roas = ingresos / inversion;
  const roasPorcentaje = roas * 100;
  const ganancia = ingresos - inversion;

  // ROAS break-even: 1 / margen_bruto
  const breakEvenROAS = margen > 0 ? 100 / margen : 0;

  // Ganancia neta aproximada = (ingresos × margen) - inversion
  const gananciaNetaAprox = margen > 0 ? ingresos * (margen / 100) - inversion : 0;

  let benchmark = '';
  if (roas >= 5) benchmark = '🚀 Excepcional — escalá la inversión';
  else if (roas >= 3) benchmark = '✅ Muy bueno — rentable';
  else if (roas >= 2) benchmark = '⚡ Aceptable — rentable si el margen es alto';
  else if (roas >= 1) benchmark = '⚠️ Marginal — recuperás la inversión pero no ganás';
  else benchmark = '🔴 Negativo — estás perdiendo plata en ads';

  const roasR = Math.round(roas * 100) / 100;
  const gananciaR = Math.round(ganancia);
  const tone = roas >= 3 ? 'good' : roas >= 1 ? 'neutral' : 'warn';
  const insightText = roas >= 3
    ? `Por cada **$1** invertido en ads generás **$${roasR}** de ingresos: una campaña claramente rentable, con ${gananciaR >= 0 ? '+' : ''}$${gananciaR.toLocaleString('es-AR')} de retorno bruto.`
    : roas >= 1
      ? `Por cada **$1** de inversión recuperás **$${roasR}**. ${margen > 0 ? `Ojo: tu ROAS de equilibrio es **${(Math.round(breakEvenROAS * 100) / 100)}×** según tu margen del ${margen}%, así que recién ganás por encima de ese punto.` : 'Cargá tu margen bruto para saber a partir de qué ROAS realmente ganás plata.'}`
      : `Estás **perdiendo plata**: por cada $1 invertido recuperás solo $${roasR}. La campaña no se paga sola (${gananciaR.toLocaleString('es-AR')} de retorno bruto).`;

  const topSeg = Math.max(5, Math.ceil(roasR) + 1);
  return {
    roas: roasR,
    roasX: `${(Math.round(roas * 10) / 10).toFixed(1)}×`,
    roasPorcentaje: Math.round(roasPorcentaje * 10) / 10,
    ganancia: gananciaR,
    gananciaNetaAprox: Math.round(gananciaNetaAprox),
    breakEvenROAS: Math.round(breakEvenROAS * 100) / 100,
    benchmark,
    _insight: {
      title: 'Lectura del ROAS',
      text: insightText,
      tone,
      icon: '📈',
    },
    _chart: {
      type: 'scale',
      marker: roasR,
      markerLabel: `${roasR}×`,
      min: 0,
      segments: [
        { nombre: 'Pérdida', max: 1, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Marginal', max: 2, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Aceptable', max: 3, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Muy bueno', max: 5, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Excepcional', max: topSeg, color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `ROAS de ${roasR}× ubicado en la escala de rentabilidad publicitaria`,
    },
  };
}
