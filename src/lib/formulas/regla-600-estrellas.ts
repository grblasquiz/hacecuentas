/**
 * Calculadora de regla 600 para fotografía de estrellas
 */

export interface Inputs {
  focal: number; sensor: number;
}

export interface Outputs {
  regla600: string; regla500: string; cuandoUsar: string;
  _insight?: any; _chart?: any;
}

export function regla600Estrellas(inputs: Inputs): Outputs {
  const f = Number(inputs.focal);
  const s = Math.round(Number(inputs.sensor));
  if (!f || !s) throw new Error('Completá los campos');
  const crop: Record<number, number> = { 1: 1.0, 2: 1.5, 3: 1.6, 4: 2.0 };
  const c = crop[s] || 1.0;
  const feq = f * c;
  const r600 = 600 / feq;
  const r500 = 500 / feq;
  const tone = r600 < 5 ? 'warn' : r600 < 15 ? 'neutral' : 'good';
  const _insight = {
    title: 'Tu exposición máxima (regla 600)',
    text: `Con focal equivalente de **${feq.toFixed(0)}mm**, la regla 600 te da hasta **${r600.toFixed(1)} s**, contra los **${r500.toFixed(1)} s** de la más estricta regla 500. ${r600 < 5 ? 'Aun con la regla más permisiva el margen es muy chico: pensá en un tracker.' : 'Reservá la regla 600 para sensores de menos de 20 MP o publicar en redes; para imprimir, quedate en 500.'}`,
    tone,
    icon: '✨',
  };
  const _chart = {
    type: 'scale',
    marker: Number(r600.toFixed(1)),
    markerLabel: `${r600.toFixed(1)} s`,
    min: 0,
    segments: [
      { nombre: 'Muy corto', max: 5, color: '#f87171', colorDark: '#b91c1c' },
      { nombre: 'Moderado', max: 15, color: '#fbbf24', colorDark: '#b45309' },
      { nombre: 'Amplio', max: Math.max(30, Math.ceil(r600) + 5), color: '#4ade80', colorDark: '#15803d' },
    ],
    ariaLabel: `Tiempo de exposición de ${r600.toFixed(1)} segundos según la regla 600, ubicado en la zona ${r600 < 5 ? 'muy corta' : r600 < 15 ? 'moderada' : 'amplia'}.`,
  };
  return {
    regla600: `${r600.toFixed(1)} s`,
    regla500: `${r500.toFixed(1)} s`,
    cuandoUsar: `Usá 600 si tu sensor es <20 MP o para redes. Usá 500 para prints y sensores modernos.`,
    _insight,
    _chart,
  };
}
