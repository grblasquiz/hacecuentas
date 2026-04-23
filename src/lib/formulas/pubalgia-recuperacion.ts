/** Pubalgia atlética (Athletic Groin Pain / Sports Hernia) - tiempo de recuperación */
export interface Inputs {
  abordaje: string;
  tiempoEvolucion: string;
  cronicidad: string;
  edad: number;
}
export interface Outputs {
  fases: string;
  retornoEntrenamiento: string;
  retornoCompeticion: string;
  tasaExito: string;
  mensaje: string;
}

export function pubalgiaRecuperacion(i: Inputs): Outputs {
  const abordaje = String(i.abordaje || 'conservador');
  const cronicidad = String(i.cronicidad || 'subaguda');
  const edad = Number(i.edad) || 25;

  let minSem = 0, maxSem = 0;
  let tasa = '';

  if (abordaje === 'conservador') {
    minSem = 6; maxSem = 12;
    tasa = '70-90% mejoría con rehabilitación adecuada (Hölmich protocol).';
  } else if (abordaje === 'quirurgico-minima-invasion') {
    minSem = 12; maxSem = 16; // 3-4 meses
    tasa = '85-95% retorno a nivel pre-lesión tras cirugía.';
  } else if (abordaje === 'quirurgico-abierto') {
    minSem = 14; maxSem = 20;
    tasa = '80-90% retorno a nivel pre-lesión.';
  }

  // Ajustes
  if (cronicidad === 'cronica') { minSem *= 1.3; maxSem *= 1.4; }
  if (edad > 32) { maxSem *= 1.15; }

  minSem = Math.round(minSem);
  maxSem = Math.round(maxSem);

  const fases = [
    'Fase 1 (0-2 sem): reposo relativo, analgesia, corrección postural.',
    'Fase 2 (2-6 sem): fortalecimiento aductores/abdomen (Copenhagen adduction).',
    'Fase 3 (6-10 sem): trabajo excéntrico, estabilidad core, bicicleta.',
    'Fase 4 (10-14 sem): carrera progresiva, cambios de dirección.',
    'Fase 5: gestos específicos (patada, duelos) y retorno a competencia.'
  ].join(' | ');

  return {
    fases,
    retornoEntrenamiento: `${Math.round(minSem * 0.7)}-${Math.round(maxSem * 0.75)} semanas (entrenamiento sin contacto).`,
    retornoCompeticion: `${minSem}-${maxSem} semanas para competencia oficial.`,
    tasaExito: tasa,
    mensaje: `Pubalgia ${abordaje} ${cronicidad}: ${minSem}-${maxSem} semanas. No reemplaza evaluación de médico deportólogo/traumatólogo especialista en ingle.`
  };
}
