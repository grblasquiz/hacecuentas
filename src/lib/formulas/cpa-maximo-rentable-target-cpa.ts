/**
 * Calculadora de CPA máximo rentable (Target CPA)
 * CPA máximo = ticket promedio × (margen bruto / 100)
 * Es el TECHO que podés pagar por una adquisición sin perder plata.
 * Si se carga tasa de conversión: CPC máximo = CPA_max × (conv / 100)
 */

export interface CpaMaximoInputs {
  ticket_promedio: number; // $
  margen_bruto_pct: number; // %
  tasa_conversion_pct: number; // % (opcional)
}

export interface CpaMaximoOutputs {
  cpaMaximo: number;
  margenPorVenta: number;
  cpcMaximo: number;
  cpmMaximo: number;
  tieneConversion: boolean;
  benchmark: string;
  _insight?: any;
  _chart?: any;
}

export function cpaMaximoRentableTargetCpa(inputs: CpaMaximoInputs): CpaMaximoOutputs {
  const ticket = Number(inputs.ticket_promedio);
  const margen = Math.max(0, Math.min(100, Number(inputs.margen_bruto_pct) || 0));
  const convRaw = inputs.tasa_conversion_pct;
  const conv =
    convRaw === '' || convRaw === null || convRaw === undefined
      ? 0
      : Math.max(0, Math.min(100, Number(convRaw) || 0));

  if (!ticket || ticket <= 0) throw new Error('Ingresá el ticket promedio');
  if (!margen || margen <= 0) throw new Error('Ingresá el margen bruto (%)');

  // Margen bruto en pesos por venta = lo máximo que podés pagar por adquirir esa venta
  const margenPorVenta = ticket * (margen / 100);
  const cpaMaximo = margenPorVenta;

  const tieneConversion = conv > 0;
  // CPC máximo: si de cada 100 clicks convertís "conv", cada click vale CPA × (conv/100)
  const cpcMaximo = tieneConversion ? cpaMaximo * (conv / 100) : 0;
  // CPM máximo (costo por mil impresiones). Aproximación clásica: asumiendo CTR 1%
  // para que el CPM máximo derive del CPC máximo. CPM = CPC × 1000 × CTR(=1%) = CPC × 10.
  const cpmMaximo = tieneConversion ? cpcMaximo * 10 : 0;

  let benchmark = '';
  if (margen >= 60) benchmark = '💎 Margen alto — tenés mucho margen para pujar en subastas';
  else if (margen >= 35) benchmark = '✅ Margen sano — CPA objetivo cómodo';
  else if (margen >= 20) benchmark = '⚡ Margen ajustado — vigilá de cerca tu CPA real';
  else benchmark = '⚠️ Margen bajo — poco aire para pagar adquisición, optimizá conversión';

  const cpaR = Math.round(cpaMaximo);
  const insightText = tieneConversion
    ? `Podés pagar hasta **$${cpaR.toLocaleString('es-AR')}** por cada venta sin perder plata. Con una conversión del ${conv}%, eso equivale a un **CPC máximo de $${Math.round(cpcMaximo).toLocaleString('es-AR')}**: si en Google Ads o Meta pagás más que eso por click, la campaña entra en pérdida.`
    : `Tu **CPA objetivo (techo)** es **$${cpaR.toLocaleString('es-AR')}** por venta: todo lo que pagues por debajo de ese número deja ganancia, todo lo que pagues por encima quema plata. Cargá tu tasa de conversión para traducirlo a un CPC máximo de puja.`;

  const tone = margen >= 35 ? 'good' : margen >= 20 ? 'neutral' : 'warn';
  const topSeg = Math.max(Math.ceil(cpaMaximo * 1.4), cpaMaximo + 1);
  return {
    cpaMaximo: cpaR,
    margenPorVenta: Math.round(margenPorVenta),
    cpcMaximo: Math.round(cpcMaximo),
    cpmMaximo: Math.round(cpmMaximo),
    tieneConversion,
    benchmark,
    _insight: {
      title: 'Tu techo de adquisición',
      text: insightText,
      tone,
      icon: '🎯',
    },
    _chart: {
      type: 'scale',
      marker: cpaR,
      markerLabel: `$${cpaR.toLocaleString('es-AR')}`,
      min: 0,
      segments: [
        { nombre: 'Ganás', max: cpaR, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Pérdida', max: topSeg, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `CPA máximo rentable de $${cpaR} por adquisición`,
    },
  };
}
