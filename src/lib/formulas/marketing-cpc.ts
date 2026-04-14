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

  return {
    cpc: Math.round(cpc * 100) / 100,
    cpm: 0, // sin impresiones no se calcula, uso CPM dedicado
    clicksPorMil: Math.round(clicksPorMil),
    benchmark,
  };
}
