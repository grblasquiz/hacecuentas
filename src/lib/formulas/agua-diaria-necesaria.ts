export interface Inputs { peso: number; actividad?: string; clima?: string; }
export interface Outputs { litros: number; vasos: number; mensaje: string; _insight?: any; _chart?: any; }
export function aguaDiariaNecesaria(i: Inputs): Outputs {
  const peso = Number(i.peso);
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');
  const act = String(i.actividad || 'moderada');
  const clima = String(i.clima || 'templado');
  let base = peso * 35; // ml
  if (act === 'intensa') base *= 1.30;
  else if (act === 'moderada') base *= 1.15;
  if (clima === 'caluroso') base *= 1.15;
  else if (clima === 'frio') base *= 0.95;
  const litros = Number((base / 1000).toFixed(2));
  const vasos = Math.round(litros / 0.25);
  let msg = `Necesitás ~${litros} litros de agua por día (${vasos} vasos de 250 ml). `;
  if (litros < 2) msg += 'Cantidad baja — asegurate de distribuirla a lo largo del día.';
  else if (litros < 3) msg += 'Cantidad moderada — un vaso antes de cada comida y uno al despertar.';
  else msg += 'Cantidad alta — llevá siempre una botella y ponete recordatorios.';

  const zona = litros < 2 ? 'baja' : litros < 3 ? 'moderada' : 'alta';
  const _insight = {
    title: 'Tu meta de hidratación',
    text: `Para **${peso} kg** con actividad **${act}** y clima **${clima}**, tu objetivo es **${litros} L/día** (${vasos} vasos de 250 ml), una cantidad **${zona}**.`,
    tone: 'neutral',
    icon: '💧',
  };
  // Gauge: zonas de hidratación; el último max supera siempre al marcador
  const ultimoMax = Math.max(4, Math.ceil(litros) + 1);
  const _chart = {
    type: 'scale',
    marker: litros,
    markerLabel: `${litros} L`,
    min: 0,
    segments: [
      { nombre: 'Baja', max: 2, color: '#60a5fa', colorDark: '#3b82f6' },
      { nombre: 'Moderada', max: 3, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: 'Alta', max: ultimoMax, color: '#0ea5e9', colorDark: '#0284c7' },
    ],
    ariaLabel: `Tu meta de ${litros} litros por día está en la zona ${zona}`,
  };
  return { litros, vasos, mensaje: msg, _insight, _chart };
}
