/**
 * Calculadora de Tasa de Conversión (Conversion Rate)
 * CR = (conversiones / visitas) × 100
 */

export interface ConversionInputs {
  visitas: number;
  conversiones: number;
  valorConversion: number; // opcional
}

export interface ConversionOutputs {
  tasaConversion: number; // %
  ingresosProyectados: number; // visitas × CR × valor
  visitasParaDuplicar: number;
  benchmark: string;
}

export function marketingConversion(inputs: ConversionInputs): ConversionOutputs {
  const visitas = Number(inputs.visitas);
  const conv = Number(inputs.conversiones);
  const valor = Number(inputs.valorConversion) || 0;

  if (!visitas || visitas <= 0) throw new Error('Ingresá las visitas o sesiones');
  if (conv < 0) throw new Error('Ingresá las conversiones');

  const tasa = (conv / visitas) * 100;
  const ingresosProyectados = conv * valor;

  let benchmark = '';
  if (tasa >= 10) benchmark = '🚀 Excepcional — top 10% del mercado';
  else if (tasa >= 5) benchmark = '✅ Muy bueno — arriba del promedio';
  else if (tasa >= 2) benchmark = '⚡ Normal — promedio de e-commerce B2C';
  else if (tasa >= 1) benchmark = '⚠️ Bajo — revisá UX, copy y velocidad';
  else benchmark = '🔴 Muy bajo — revisá producto / page / tráfico';

  // Cuántas visitas necesitás para duplicar las conversiones actuales
  const visitasParaDuplicar = tasa > 0 ? Math.ceil((2 * conv * 100) / tasa) : 0;

  return {
    tasaConversion: Math.round(tasa * 100) / 100,
    ingresosProyectados: Math.round(ingresosProyectados),
    visitasParaDuplicar,
    benchmark,
  };
}
