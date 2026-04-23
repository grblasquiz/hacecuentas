/** Recuperación de lesión isquiotibial por grado (BAMIC / British Athletics) */
export interface Inputs {
  grado: string;
  localizacion: string;
  edad: number;
  recidiva: string;
  nivelCompetencia: string;
}
export interface Outputs {
  rangoRecuperacion: string;
  retornoEntrenamiento: string;
  retornoCompeticion: string;
  protocolo: string;
  mensaje: string;
}

export function recuperacionIsquiotibial(i: Inputs): Outputs {
  const grado = String(i.grado || 'G2');
  const loc = String(i.localizacion || 'intramuscular');
  const edad = Number(i.edad) || 25;
  const recidiva = String(i.recidiva || 'no');
  const nivel = String(i.nivelCompetencia || 'amateur');

  let minSem = 2, maxSem = 4;
  let rango = '';

  if (grado === 'G0') { minSem = 0.5; maxSem = 1; rango = 'G0 (DOMS/sobrecarga): 3-7 días.'; }
  else if (grado === 'G1') { minSem = 1; maxSem = 3; rango = 'G1 (lesión leve, <5% fibras): 1-3 semanas.'; }
  else if (grado === 'G2') { minSem = 4; maxSem = 6; rango = 'G2 (lesión moderada, ruptura parcial): 4-6 semanas.'; }
  else if (grado === 'G3') { minSem = 12; maxSem = 20; rango = 'G3 (ruptura completa/avulsión): 3-5 meses. Puede requerir cirugía.'; }

  // Ajustes
  if (loc === 'tendinosa') { minSem *= 1.3; maxSem *= 1.4; }
  if (edad > 30) { minSem *= 1.15; maxSem *= 1.2; }
  if (recidiva === 'si') { minSem *= 1.3; maxSem *= 1.4; }
  if (nivel === 'profesional') { maxSem *= 0.9; }

  minSem = Math.round(minSem * 10) / 10;
  maxSem = Math.round(maxSem * 10) / 10;

  const retEntreno = grado === 'G3'
    ? `${Math.round(minSem * 0.7)}-${Math.round(maxSem * 0.75)} semanas para entrenamiento controlado (sin sprint).`
    : `${Math.round(minSem * 0.6)}-${Math.round(maxSem * 0.7)} semanas para entrenamiento sin sprint.`;

  const retComp = `${minSem}-${maxSem} semanas para competencia con criterios objetivos superados.`;

  const protocolo = [
    'Fase 1: POLICE (Protección, Carga óptima, Hielo, Compresión, Elevación) 48-72hs.',
    'Fase 2: fortalecimiento excéntrico (Nordic Hamstring Exercise).',
    'Fase 3: ejercicios en rango largo con carga progresiva.',
    'Fase 4: sprint progresivo (running-based return).',
    'Fase 5: gestos específicos (patadas, cambios de dirección, contacto).'
  ].join(' | ');

  return {
    rangoRecuperacion: rango,
    retornoEntrenamiento: retEntreno,
    retornoCompeticion: retComp,
    protocolo,
    mensaje: `Isquio ${grado} ${loc}: ${minSem}-${maxSem} semanas. No reemplaza evaluación de médico deportólogo/kinesiólogo.`
  };
}
