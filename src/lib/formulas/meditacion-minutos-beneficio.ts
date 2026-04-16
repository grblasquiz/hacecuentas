/** Minutos de meditación según nivel y objetivo */
export interface Inputs { nivel: string; objetivo: string; }
export interface Outputs { minutosDiarios: number; frecuencia: string; tipoMeditacion: string; beneficiosEsperados: string; mensaje: string; }

export function meditacionMinutosBeneficio(i: Inputs): Outputs {
  const nivel = String(i.nivel || 'principiante');
  const objetivo = String(i.objetivo || 'estres');

  const minMap: Record<string, number> = { nunca: 5, principiante: 10, intermedio: 20, avanzado: 40 };
  let minutos = minMap[nivel] || 10;

  // Adjust by objective
  if (objetivo === 'concentracion' && minutos < 15) minutos = 15;
  if (objetivo === 'ansiedad' && nivel === 'nunca') minutos = 5;

  const frecuencia = nivel === 'nunca' ? '3-5 días/semana para empezar' : 'Todos los días (ideal)';

  const tipoMap: Record<string, string> = {
    estres: 'Mindfulness / Atención plena (enfocarse en la respiración)',
    sueno: 'Body scan / Relajación progresiva muscular',
    concentracion: 'Meditación enfocada (contar respiraciones, mantra)',
    ansiedad: 'Respiración 4-7-8 + Mindfulness',
    general: 'Mindfulness básico (observar sin juzgar)'
  };

  const beneficiosMap: Record<string, string> = {
    estres: 'Reducción de cortisol, menor reactividad emocional, mejor manejo de presión',
    sueno: 'Menor latencia de sueño, mejor calidad y duración, menos despertares',
    concentracion: 'Mayor tiempo de foco sostenido, menos mind-wandering, mejor memoria de trabajo',
    ansiedad: 'Menor rumiación, respuesta más calma ante disparadores, menor ansiedad anticipatoria',
    general: 'Mayor bienestar subjetivo, mejor regulación emocional, mayor resiliencia'
  };

  return {
    minutosDiarios: minutos,
    frecuencia,
    tipoMeditacion: tipoMap[objetivo] || tipoMap.general,
    beneficiosEsperados: beneficiosMap[objetivo] || beneficiosMap.general,
    mensaje: `${minutos} min/día de ${tipoMap[objetivo] || 'mindfulness'}. ${frecuencia}. Beneficios notables en 2-8 semanas.`
  };
}