/** Retorno al fútbol post-COVID: gradualidad por severidad */
export interface Inputs {
  severidad: string;
  diasDesdePositivo: number;
  sintomasCardioActual: string;
  edad: number;
  nivelCompetencia: string;
}
export interface Outputs {
  semanasReposo: string;
  etapasRetorno: string;
  evaluacionCardio: string;
  semaforoRetorno: string;
  mensaje: string;
  _insight?: any;
}

export function retornoFutbolPostCovid(i: Inputs): Outputs {
  const sev = String(i.severidad || 'asintomatico');
  const dias = Number(i.diasDesdePositivo) || 0;
  const sintCardio = String(i.sintomasCardioActual || 'no');
  const edad = Number(i.edad) || 25;

  let minSem = 0, maxSem = 0;
  let needsCardio = false;

  if (sev === 'asintomatico') { minSem = 1; maxSem = 2; needsCardio = false; }
  else if (sev === 'leve') { minSem = 2; maxSem = 4; needsCardio = edad > 35; }
  else if (sev === 'moderado') { minSem = 4; maxSem = 6; needsCardio = true; }
  else if (sev === 'hospitalizado') { minSem = 4; maxSem = 8; needsCardio = true; }
  else if (sev === 'miocarditis') { minSem = 12; maxSem = 24; needsCardio = true; }

  // Ajuste edad
  if (edad > 40) { maxSem += 1; }

  const transcurridasSem = Math.floor(dias / 7);
  const faltanSem = Math.max(0, minSem - transcurridasSem);

  let semaforo = '';
  if (sintCardio === 'si') {
    semaforo = 'ROJO: síntomas cardiovasculares actuales (dolor de pecho, disnea, palpitaciones). NO retornar. Evaluación cardiológica urgente.';
  } else if (sev === 'miocarditis') {
    semaforo = 'ROJO/AMARILLO: miocarditis confirmada. Retorno solo con alta cardiológica + RMN cardíaca + ergometría normales.';
  } else if (faltanSem > 0) {
    semaforo = `AMARILLO: aún faltan ~${faltanSem} semanas mínimas de reposo según severidad.`;
  } else if (needsCardio) {
    semaforo = 'AMARILLO: cumpliste el reposo mínimo pero se recomienda evaluación cardio (ECG, TT, troponinas) antes de competir.';
  } else {
    semaforo = 'VERDE: podés iniciar el retorno gradual si seguís asintomático.';
  }

  const etapas = [
    'Etapa 1: reposo relativo (actividades de la vida diaria).',
    'Etapa 2: actividad aeróbica ligera 15min (caminar, bici suave).',
    'Etapa 3: intensidad moderada <80% FC máx (trote, circuitos).',
    'Etapa 4: entrenamiento no restringido sin contacto.',
    'Etapa 5: entrenamiento completo + retorno a competencia.'
  ].join(' | ');

  const evalCardio = needsCardio
    ? 'Evaluación recomendada: ECG 12 derivaciones, troponinas, ergometría. En casos moderados/graves sumar RMN cardíaca.'
    : 'Evaluación cardio no indicada de rutina si asintomático. Consultá igual ante dudas.';

  const luz = semaforo.startsWith('ROJO') ? 'rojo' : semaforo.startsWith('VERDE') ? 'verde' : 'amarillo';
  const insightTone = luz === 'verde' ? 'good' : luz === 'rojo' ? 'warn' : 'neutral';
  const insightIcon = luz === 'verde' ? '🟢' : luz === 'rojo' ? '🔴' : '🟡';
  let insightText = '';
  if (luz === 'rojo') {
    insightText = `**Semáforo ROJO**: no retornes todavía. ${sintCardio === 'si' ? 'Tenés síntomas cardiovasculares activos y necesitás evaluación cardiológica urgente' : 'La miocarditis exige alta cardiológica, RMN y ergometría normales'} antes de pisar la cancha.`;
  } else if (luz === 'verde') {
    insightText = `**Semáforo VERDE**: ya cumpliste el mínimo de **${minSem}-${maxSem} semanas** y seguís asintomático. Arrancá por la Etapa 1 y subí de nivel solo si no aparecen síntomas; nunca te saltees etapas.`;
  } else {
    insightText = faltanSem > 0
      ? `**Semáforo AMARILLO**: te faltan ~**${faltanSem} semanas** para completar el reposo mínimo de tu severidad (${sev}). Esperá antes de empezar el retorno gradual.`
      : `**Semáforo AMARILLO**: cumpliste el reposo, pero por tu cuadro (${sev}${edad > 35 ? ', edad > 35' : ''}) conviene una evaluación cardiológica (ECG, troponinas) antes de competir.`;
  }

  return {
    semanasReposo: `${minSem}-${maxSem} semanas desde el test positivo (mínimo antes de empezar Etapa 2).`,
    etapasRetorno: etapas,
    evaluacionCardio: evalCardio,
    semaforoRetorno: semaforo,
    mensaje: `${minSem}-${maxSem} semanas de reposo`,
    _insight: {
      title: 'Tu semáforo de retorno',
      text: insightText,
      tone: insightTone,
      icon: insightIcon
    }
  };
}
