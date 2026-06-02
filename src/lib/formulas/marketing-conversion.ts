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
  _insight?: any;
  _chart?: any;
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

  const tono = tasa >= 5 ? 'good' : tasa >= 2 ? 'neutral' : 'warn';
  const _insight = {
    title: 'Tu tasa de conversión',
    text: `De **${visitas.toLocaleString('es-AR')}** visitas convertiste **${conv.toLocaleString('es-AR')}**: una tasa del **${(Math.round(tasa * 100) / 100).toFixed(2)}%**.${valor > 0 ? ` Eso representa **$${Math.round(ingresosProyectados).toLocaleString('es-AR')}** en ingresos.` : ''} Para duplicar tus conversiones a la tasa actual necesitarías **${visitasParaDuplicar.toLocaleString('es-AR')}** visitas.`,
    tone: tono,
    icon: tasa >= 5 ? '🚀' : tasa >= 2 ? '📊' : '🔍',
  };

  const topSeg = Math.max(12, Math.ceil(tasa) + 2);
  const _chart = {
    type: 'scale',
    marker: Math.round(tasa * 100) / 100,
    markerLabel: `${(Math.round(tasa * 100) / 100).toFixed(2)}%`,
    min: 0,
    segments: [
      { nombre: 'Muy bajo', max: 1, color: '#dc2626', colorDark: '#b91c1c' },
      { nombre: 'Bajo', max: 2, color: '#f59e0b', colorDark: '#d97706' },
      { nombre: 'Normal', max: 5, color: '#facc15', colorDark: '#ca8a04' },
      { nombre: 'Muy bueno', max: 10, color: '#84cc16', colorDark: '#65a30d' },
      { nombre: 'Excepcional', max: topSeg, color: '#22c55e', colorDark: '#16a34a' },
    ],
    ariaLabel: `Tasa de conversión de ${(Math.round(tasa * 100) / 100).toFixed(2)} por ciento`,
  };

  return {
    tasaConversion: Math.round(tasa * 100) / 100,
    ingresosProyectados: Math.round(ingresosProyectados),
    visitasParaDuplicar,
    benchmark,
    _insight,
    _chart,
  };
}
