/**
 * Calculadora de CPC (Costo Por Click)
 * CPC = inversión / clicks
 */

export interface CpcInputs {
  inversion: number;
  clicks: number;
}

export interface CpcOutputs {
  cpc: number;
  cpm: number; // si además sabemos impresiones, se calcula aparte
  clicksPorMil: number;
  benchmark: string;
  _insight?: any;
  _chart?: any;
}

export function marketingCpc(inputs: CpcInputs): CpcOutputs {
  const inversion = Number(inputs.inversion);
  const clicks = Number(inputs.clicks);

  if (!inversion || inversion <= 0) throw new Error('Ingresá la inversión');
  if (!clicks || clicks <= 0) throw new Error('Ingresá los clicks obtenidos');

  const cpc = inversion / clicks;
  const clicksPorMil = 1000 / cpc;

  let benchmark = '';
  if (cpc < 10) benchmark = '🚀 Muy bajo — aprovechá y escalá';
  else if (cpc < 50) benchmark = '✅ Competitivo';
  else if (cpc < 200) benchmark = '⚡ Normal para industrias competitivas';
  else benchmark = '⚠️ Alto — evaluá segmentación y calidad del anuncio';

  const tono = cpc < 50 ? 'good' : cpc < 200 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Tu costo por click',
    text: `Invertiste **$${inversion.toLocaleString('es-AR')}** para conseguir **${clicks.toLocaleString('es-AR')}** clicks: pagás **$${(Math.round(cpc * 100) / 100).toLocaleString('es-AR')}** por cada uno. Con ese CPC, cada **$1.000** de presupuesto te traen ~**${Math.round(clicksPorMil).toLocaleString('es-AR')}** clicks.`,
    tone: tono,
    icon: cpc < 50 ? '🚀' : cpc < 200 ? '🖱️' : '⚠️',
  };

  const topSeg = Math.max(300, Math.ceil(cpc / 100) * 100 + 50);
  const _chart = {
    type: 'scale',
    marker: Math.round(cpc * 100) / 100,
    markerLabel: `$${(Math.round(cpc * 100) / 100).toLocaleString('es-AR')}`,
    min: 0,
    segments: [
      { nombre: 'Muy bajo', max: 10, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Competitivo', max: 50, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Normal', max: 200, color: '#facc15', colorDark: '#ca8a04' },
      { nombre: 'Alto', max: topSeg, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: `Costo por click de $${(Math.round(cpc * 100) / 100).toLocaleString('es-AR')}`,
  };

  return {
    cpc: Math.round(cpc * 100) / 100,
    cpm: 0, // sin impresiones no se calcula, uso CPM dedicado
    clicksPorMil: Math.round(clicksPorMil),
    benchmark,
    _insight,
    _chart,
  };
}
