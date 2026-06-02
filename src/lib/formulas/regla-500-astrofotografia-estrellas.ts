/**
 * Calculadora de regla 500 para astrofotografía de estrellas
 */

export interface Inputs {
  focal: number; sensor: number;
}

export interface Outputs {
  regla500: string; regla300: string; consejo: string;
  _insight?: any; _chart?: any;
}

export function regla500AstrofotografiaEstrellas(inputs: Inputs): Outputs {
  const f = Number(inputs.focal);
  const s = Math.round(Number(inputs.sensor));
  if (!f || !s) throw new Error('Completá los campos');
  const crop: Record<number, number> = { 1: 1.0, 2: 1.5, 3: 1.6, 4: 2.0 };
  const c = crop[s] || 1.0;
  const focalEq = f * c;
  const r500 = 500 / focalEq;
  const r300 = 300 / focalEq;
  let tip = '';
  if (r500 < 5) tip = 'Tiempo muy corto: considerá tracker astronómico o stack.';
  else if (r500 < 15) tip = 'Tiempo moderado: subí ISO a 3200-6400 y abrí a f/2.8 o menos.';
  else tip = 'Tiempo amplio: ISO 1600-3200 con f/2.8-4 debería bastar.';
  const tone = r500 < 5 ? 'warn' : r500 < 15 ? 'neutral' : 'good';
  const _insight = {
    title: 'Tu tiempo máximo de exposición',
    text: `Con focal equivalente de **${focalEq.toFixed(0)}mm**, podés exponer hasta **${r500.toFixed(1)} s** sin que las estrellas dejen rastro (regla 500). ${r500 < 5 ? 'Es muy poco: prácticamente necesitás un tracker o apilar varias tomas.' : r500 < 15 ? 'Suficiente para una toma de cielo profundo subiendo el ISO.' : 'Tenés margen de sobra; bajá el ISO para ganar nitidez.'}`,
    tone,
    icon: '🌌',
  };
  const _chart = {
    type: 'scale',
    marker: Number(r500.toFixed(1)),
    markerLabel: `${r500.toFixed(1)} s`,
    min: 0,
    segments: [
      { nombre: 'Muy corto', max: 5, color: '#f87171', colorDark: '#b91c1c' },
      { nombre: 'Moderado', max: 15, color: '#fbbf24', colorDark: '#b45309' },
      { nombre: 'Amplio', max: Math.max(30, Math.ceil(r500) + 5), color: '#4ade80', colorDark: '#15803d' },
    ],
    ariaLabel: `Tiempo de exposición de ${r500.toFixed(1)} segundos según la regla 500, ubicado en la zona ${r500 < 5 ? 'muy corta' : r500 < 15 ? 'moderada' : 'amplia'}.`,
  };
  return {
    regla500: `${r500.toFixed(1)} s`,
    regla300: `${r300.toFixed(1)} s (estrellas puntuales en zoom 100%)`,
    consejo: tip,
    _insight,
    _chart,
  };
}
