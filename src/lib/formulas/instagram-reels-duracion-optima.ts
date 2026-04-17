/** Reels Duración Óptima */
export interface Inputs { objetivo: string; nicho: string; }
export interface Outputs { duracionRecomendada: string; rangoAceptable: string; justificacion: string; tip: string; }

export function instagramReelsDuracionOptima(i: Inputs): Outputs {
  const obj = String(i.objetivo);
  const nicho = String(i.nicho);
  if (!obj || !nicho) throw new Error('Seleccioná objetivo y nicho');
  const baseByObj: Record<string, [number, number]> = {
    'Viralidad / reach': [15, 30],
    'Engagement / saves': [30, 60],
    'Conversión / venta': [60, 90],
    'Storytelling': [60, 120],
  };
  const adjByNicho: Record<string, number> = {
    'Lifestyle / moda': -5,
    'Fitness': 0,
    'Cocina': 15,
    'Educativo': 15,
    'Humor': -10,
    'Beauty / makeup': 5,
    'Negocios': 15,
    'Travel': 0,
  };
  const [minB, maxB] = baseByObj[obj] || [30, 60];
  const adj = adjByNicho[nicho] || 0;
  const minF = Math.max(5, minB + adj);
  const maxF = Math.max(minF + 5, maxB + adj);
  const recom = Math.round((minF + maxF) / 2);
  let just = '';
  if (obj.startsWith('Viral')) just = 'Videos cortos maximizan completion rate y empuje del algoritmo';
  else if (obj.startsWith('Eng')) just = 'Duración media permite generar saves y shares por valor percibido';
  else if (obj.startsWith('Conv')) just = 'Duración suficiente para explicar valor y pedir acción con CTA';
  else just = 'Duración larga para desarrollar narrativa emocional completa';
  return {
    duracionRecomendada: `${recom} segundos`,
    rangoAceptable: `${Math.round(minF)}-${Math.round(maxF)} segundos`,
    justificacion: just,
    tip: 'Hook en los primeros 1-3 segundos: es lo que decide si te ven o pasan',
  };
}
