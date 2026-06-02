/**
 * Calculadora de CTR (Click Through Rate)
 * CTR = (clicks / impresiones) × 100
 */

export interface CtrInputs {
  impresiones: number;
  clicks: number;
}

export interface CtrOutputs {
  ctr: number;
  clicksFaltantes10k: number; // para llegar a 1% con 10k impresiones
  benchmark: string;
  _insight?: any;
  _chart?: any;
}

export function marketingCtr(inputs: CtrInputs): CtrOutputs {
  const impresiones = Number(inputs.impresiones);
  const clicks = Number(inputs.clicks);

  if (!impresiones || impresiones <= 0) throw new Error('Ingresá las impresiones');
  if (clicks < 0) throw new Error('Ingresá los clicks válidos');

  const ctr = (clicks / impresiones) * 100;

  let benchmark = '';
  if (ctr >= 3) benchmark = '🚀 Excelente — muy por encima del promedio';
  else if (ctr >= 1.5) benchmark = '✅ Bueno — arriba de promedio del mercado';
  else if (ctr >= 0.8) benchmark = '⚡ Promedio — típico de display / search';
  else if (ctr >= 0.3) benchmark = '⚠️ Bajo — revisá creatividad y targeting';
  else benchmark = '🔴 Muy bajo — urgente revisar copy, visual y audiencia';

  const clicksFaltantes10k = Math.max(0, Math.ceil(impresiones * 0.01) - clicks);

  const ctrR = Number(ctr.toFixed(2));
  const tone = ctr >= 1.5 ? 'good' : ctr >= 0.8 ? 'neutral' : 'warn';
  const insightText = ctr >= 1.5
    ? `De cada **${impresiones.toLocaleString('es-AR')} impresiones**, ${clicks.toLocaleString('es-AR')} hicieron clic: un CTR de **${ctrR}%**, por encima del promedio del mercado.`
    : ctr >= 0.8
      ? `Tu CTR es **${ctrR}%** (${clicks.toLocaleString('es-AR')} clicks sobre ${impresiones.toLocaleString('es-AR')} impresiones), en línea con el promedio típico de search/display.`
      : `Solo **${ctrR}%** de las ${impresiones.toLocaleString('es-AR')} impresiones se convirtieron en clic. Está por debajo del promedio: revisá copy, creatividad y segmentación.`;

  return {
    ctr: ctrR,
    clicksFaltantes10k,
    benchmark,
    _insight: {
      title: 'Lectura del CTR',
      text: insightText,
      tone,
      icon: '🖱️',
    },
    _chart: {
      type: 'scale',
      marker: ctrR,
      markerLabel: `${ctrR}%`,
      min: 0,
      segments: [
        { nombre: 'Muy bajo', max: 0.3, color: '#dc2626', colorDark: '#ef4444' },
        { nombre: 'Bajo', max: 0.8, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Promedio', max: 1.5, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Bueno', max: 3, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Excelente', max: Math.max(5, Math.ceil(ctrR) + 1), color: '#16a34a', colorDark: '#22c55e' },
      ],
      ariaLabel: `CTR de ${ctrR}% ubicado en la escala de benchmarks de la industria`,
    },
  };
}
