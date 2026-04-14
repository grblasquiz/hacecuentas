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

  return {
    ctr: Number(ctr.toFixed(2)),
    clicksFaltantes10k,
    benchmark,
  };
}
