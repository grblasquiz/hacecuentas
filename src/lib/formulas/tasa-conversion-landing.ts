/** Calculadora de Tasa de Conversión de Landing */
export interface Inputs { visitantes: number; conversiones: number; industria: string; }
export interface Outputs { tasaConversion: number; benchmarkIndustria: number; diferencia: string; recomendacion: string; }

const BENCHMARKS: Record<string, number> = {
  ecommerce: 2.5,
  saas: 3.0,
  servicios: 3.5,
  educacion: 4.0,
  inmobiliaria: 2.0,
  salud: 3.0,
  finanzas: 2.5,
};

export function tasaConversionLanding(i: Inputs): Outputs {
  const vis = Number(i.visitantes);
  const conv = Number(i.conversiones);
  if (!vis || vis <= 0) throw new Error('Ingresá los visitantes');
  if (conv < 0) throw new Error('Las conversiones no pueden ser negativas');

  const tasaConversion = (conv / vis) * 100;
  const benchmark = BENCHMARKS[i.industria] || 3.0;
  const diff = tasaConversion - benchmark;

  let diferencia: string;
  let recomendacion: string;

  if (diff > 2) {
    diferencia = `+${diff.toFixed(1)}% por encima del promedio — excelente.`;
    recomendacion = 'Tu landing convierte muy bien. Enfocate en aumentar tráfico para escalar resultados.';
  } else if (diff > 0) {
    diferencia = `+${diff.toFixed(1)}% por encima del promedio — bueno.`;
    recomendacion = 'Estás por encima del promedio. Testea variantes de headline y CTA para seguir mejorando.';
  } else if (diff > -1) {
    diferencia = `${diff.toFixed(1)}% ligeramente debajo del promedio.`;
    recomendacion = 'Estás cerca del promedio. Revisá: propuesta de valor clara, CTA visible, velocidad de carga, y social proof.';
  } else {
    diferencia = `${diff.toFixed(1)}% debajo del promedio — necesita mejoras.`;
    recomendacion = 'Tu landing necesita optimización. Priorizá: 1) Headline más claro, 2) CTA prominente, 3) Menos campos en form, 4) Social proof/testimonios.';
  }

  return {
    tasaConversion: Number(tasaConversion.toFixed(2)),
    benchmarkIndustria: benchmark,
    diferencia,
    recomendacion,
  };
}
