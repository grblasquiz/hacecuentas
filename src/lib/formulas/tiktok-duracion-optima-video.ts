/** Duración Óptima TikTok */
export interface Inputs { objetivo: string; nicho: string; }
export interface Outputs { duracionRecomendada: string; justificacion: string; rangoAceptable: string; tip: string; }

export function tiktokDuracionOptimaVideo(i: Inputs): Outputs {
  const obj = String(i.objetivo);
  const nicho = String(i.nicho);
  if (!obj || !nicho) throw new Error('Seleccioná objetivo y nicho');
  const baseByObj: Record<string, [number, number]> = {
    'Viralidad / vistas máximas': [7, 15],
    'Monetización (Creator Rewards)': [60, 180],
    'Engagement y comentarios': [30, 60],
    'Mix (balanceado)': [45, 90],
  };
  const adjByNicho: Record<string, number> = {
    'Humor / comedy': -5,
    'Tutorial / educativo': 20,
    'Cocina / lifestyle': 15,
    'Gaming / reacciones': 0,
    'Dance / música': -5,
    'Storytelling': 25,
    'Fitness': -5,
    'Negocios / finanzas': 15,
  };
  const [minB, maxB] = baseByObj[obj] || [30, 60];
  const adj = adjByNicho[nicho] || 0;
  const minF = Math.max(3, minB + adj);
  const maxF = Math.max(minF + 5, maxB + adj);
  const recom = Math.round((minF + maxF) / 2);
  let just = '';
  if (obj.startsWith('Viral')) just = 'Objetivo viralidad: videos cortos maximizan completion rate y empuje del algoritmo';
  else if (obj.startsWith('Monet')) just = 'Objetivo monetización: videos de +60 seg son los únicos que pagan Creator Rewards';
  else if (obj.startsWith('Eng')) just = 'Objetivo engagement: duración media permite storytelling suficiente para generar comentarios';
  else just = 'Mix balanceado: duración intermedia para ganar reach sin perder monetización';
  return {
    duracionRecomendada: `${recom} segundos`,
    justificacion: just,
    rangoAceptable: `${Math.round(minF)}-${Math.round(maxF)} segundos`,
    tip: 'Mantené el hook en los primeros 2-3 segundos: decide si te miran o scrollean',
  };
}
