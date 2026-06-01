/** Agua diaria recomendada por peso y actividad */
export interface Inputs { peso: number; actividad?: string; clima?: string; }
export interface Outputs { litrosAgua: number; vasos: number; mensaje: string; _insight?: any; _chart?: any; }

export function aguaDiaria(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const act = String(i.actividad || 'moderado');
  const clima = String(i.clima || 'templado');
  if (!peso || peso <= 0) throw new Error('Ingresá el peso');

  // Base: 35 ml/kg
  let base = peso * 35;

  // Ajuste actividad
  if (act === 'alto') base *= 1.3;
  else if (act === 'moderado') base *= 1.15;

  // Ajuste clima
  if (clima === 'caluroso') base *= 1.15;

  const litros = base / 1000;
  const vasos = Math.round(litros / 0.25);
  const litrosR = Number(litros.toFixed(2));

  const zona = litrosR < 2 ? 'baja' : litrosR < 3 ? 'moderada' : 'alta';
  const _insight = {
    title: 'Tu agua diaria',
    text: `Para **${peso} kg** con actividad **${act}** y clima **${clima}**, tomá ~**${litros.toFixed(2)} L/día** (${vasos} vasos de 250 ml). Es una cantidad **${zona}**: repartila a lo largo del día.`,
    tone: 'neutral',
    icon: '💧',
  };
  // Gauge: zonas de hidratación; el último max supera siempre al marcador
  const ultimoMax = Math.max(4, Math.ceil(litrosR) + 1);
  const _chart = {
    type: 'scale',
    marker: litrosR,
    markerLabel: `${litros.toFixed(2)} L`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: 2, color: '#60a5fa', colorDark: '#3b82f6' },
      { nombre: 'Moderada', max: 3, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Alta', max: ultimoMax, color: '#0ea5e9', colorDark: '#0284c7' },
    ],
    ariaLabel: `Tu agua diaria de ${litros.toFixed(2)} litros está en la zona ${zona}`,
  };

  return {
    litrosAgua: litrosR,
    vasos,
    mensaje: `Tomá aproximadamente ${litros.toFixed(2)} L/día (${vasos} vasos de 250 ml).`,
    _insight,
    _chart,
  };
}
