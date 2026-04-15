/** Horas de sueño recomendadas por edad — National Sleep Foundation (NSF) */
export interface Inputs {
  edad: number;
  horasActuales?: number;
}
export interface Outputs {
  grupoEtario: string;
  recomendado: string;
  aceptable: string;
  evaluacion: string;
  deficit: number;
  resumen: string;
  consejos: string;
}

export function horasSueno(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const horasActuales = i.horasActuales !== undefined ? Number(i.horasActuales) : 0;

  if (edad < 0 || edad > 120) throw new Error('Edad entre 0 y 120 años');
  if (horasActuales && (horasActuales < 0 || horasActuales > 24)) throw new Error('Horas entre 0 y 24');

  let grupoEtario = '';
  let minRec = 0, maxRec = 0;
  let minAcep = 0, maxAcep = 0;

  if (edad < 0.25) { // < 3 meses
    grupoEtario = 'Recién nacido (0–3 meses)';
    minRec = 14; maxRec = 17; minAcep = 11; maxAcep = 19;
  } else if (edad < 1) { // 4–11 meses
    grupoEtario = 'Lactante (4–11 meses)';
    minRec = 12; maxRec = 15; minAcep = 10; maxAcep = 18;
  } else if (edad < 3) {
    grupoEtario = 'Niño pequeño (1–2 años)';
    minRec = 11; maxRec = 14; minAcep = 9; maxAcep = 16;
  } else if (edad < 6) {
    grupoEtario = 'Preescolar (3–5 años)';
    minRec = 10; maxRec = 13; minAcep = 8; maxAcep = 14;
  } else if (edad < 14) {
    grupoEtario = 'Escolar (6–13 años)';
    minRec = 9; maxRec = 11; minAcep = 7; maxAcep = 12;
  } else if (edad < 18) {
    grupoEtario = 'Adolescente (14–17 años)';
    minRec = 8; maxRec = 10; minAcep = 7; maxAcep = 11;
  } else if (edad < 26) {
    grupoEtario = 'Adulto joven (18–25 años)';
    minRec = 7; maxRec = 9; minAcep = 6; maxAcep = 11;
  } else if (edad < 65) {
    grupoEtario = 'Adulto (26–64 años)';
    minRec = 7; maxRec = 9; minAcep = 6; maxAcep = 10;
  } else {
    grupoEtario = 'Adulto mayor (65+ años)';
    minRec = 7; maxRec = 8; minAcep = 5; maxAcep = 9;
  }

  const recomendado = `${minRec}–${maxRec} h por noche`;
  const aceptable = `${minAcep}–${maxAcep} h (rango aceptable)`;

  let evaluacion = '';
  let deficit = 0;
  if (horasActuales > 0) {
    if (horasActuales >= minRec && horasActuales <= maxRec) {
      evaluacion = 'Óptimo — dormís dentro del rango recomendado';
    } else if (horasActuales >= minAcep && horasActuales < minRec) {
      evaluacion = 'Aceptable bajo — dormís menos del óptimo';
      deficit = Number((minRec - horasActuales).toFixed(1));
    } else if (horasActuales > maxRec && horasActuales <= maxAcep) {
      evaluacion = 'Aceptable alto — dormís más del óptimo';
    } else if (horasActuales < minAcep) {
      evaluacion = 'Insuficiente — déficit crónico de sueño';
      deficit = Number((minRec - horasActuales).toFixed(1));
    } else {
      evaluacion = 'Excesivo — dormir mucho también puede ser señal de un problema';
    }
  } else {
    evaluacion = `Para tu edad necesitás ${recomendado}.`;
  }

  const consejos = `Consejos para mejorar el sueño: 1) Acostarse y levantarse a la misma hora. 2) Evitar pantallas 1 h antes. 3) Cuarto oscuro y fresco (18–20 °C). 4) Cafeína sólo en la mañana. 5) Si no dormís en 20 min, levantate y volvé cuando tengas sueño.`;

  return {
    grupoEtario,
    recomendado,
    aceptable,
    evaluacion,
    deficit,
    resumen: `${grupoEtario}: necesitás ${recomendado}.${horasActuales ? ` Estás durmiendo ${horasActuales} h → ${evaluacion}.` : ''}`,
    consejos,
  };
}
