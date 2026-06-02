/** Frecuencia respiratoria normal por edad y evaluación */
export interface Inputs {
  edad: number;
  fr?: number; // respiraciones por minuto
}
export interface Outputs {
  grupoEtario: string;
  rangoNormal: string;
  evaluacion: string;
  bradipneaUmbral: number;
  taquipneaUmbral: number;
  resumen: string;
  causasAlteradas: string;
  _insight?: any;
  _chart?: any;
}

export function frecuenciaRespiratoria(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const fr = i.fr !== undefined ? Number(i.fr) : 0;

  if (edad < 0 || edad > 120) throw new Error('Edad entre 0 y 120 años');
  if (fr && (fr < 0 || fr > 100)) throw new Error('Frecuencia respiratoria entre 0 y 100 rpm');

  // Rangos normales por edad (Pediatric Advanced Life Support / WHO)
  let grupoEtario = '';
  let min = 0, max = 0;

  if (edad < 1/12) {
    grupoEtario = 'Recién nacido (< 1 mes)';
    min = 30; max = 60;
  } else if (edad < 1) {
    grupoEtario = 'Lactante (1–11 meses)';
    min = 30; max = 53;
  } else if (edad < 3) {
    grupoEtario = 'Niño 1–2 años';
    min = 22; max = 37;
  } else if (edad < 6) {
    grupoEtario = 'Preescolar (3–5 años)';
    min = 20; max = 28;
  } else if (edad < 12) {
    grupoEtario = 'Escolar (6–11 años)';
    min = 18; max = 25;
  } else if (edad < 18) {
    grupoEtario = 'Adolescente (12–17 años)';
    min = 12; max = 20;
  } else {
    grupoEtario = 'Adulto (18+ años)';
    min = 12; max = 20;
  }

  const rangoNormal = `${min}–${max} respiraciones/min`;

  let evaluacion = '';
  if (fr > 0) {
    if (fr < min) {
      evaluacion = `Bradipnea (FR < ${min}). Puede ser normal en deportistas entrenados o en sueño profundo, pero también señal de depresión del centro respiratorio (sedantes, opioides, hipertensión intracraneal, hipotermia).`;
    } else if (fr <= max) {
      evaluacion = `Normal para tu grupo etario (rango ${min}–${max}).`;
    } else if (fr <= max + 5) {
      evaluacion = `Taquipnea leve (FR > ${max}). Puede deberse a fiebre, ansiedad, ejercicio reciente, dolor o anemia.`;
    } else {
      evaluacion = `Taquipnea importante (FR ≥ ${max + 6}). En contexto clínico puede indicar neumonía, embolia pulmonar, acidosis metabólica, sepsis o insuficiencia cardíaca. Si persiste y hay disnea o saturación baja, consultá guardia.`;
    }
  } else {
    evaluacion = `Para medir: contá las elevaciones del tórax durante 60 segundos completos en reposo. Para tu edad, lo normal es ${rangoNormal}.`;
  }

  const causasAlteradas = `Aumenta (taquipnea): fiebre, ejercicio, ansiedad, dolor, anemia, hipoxia, neumonía, EPOC, insuficiencia cardíaca, acidosis metabólica. Disminuye (bradipnea): sueño, deportistas entrenados, sedantes, opioides, hipotermia, hipertensión intracraneal.`;

  let categoria = '';
  let insTone: 'good' | 'warn' | 'neutral' = 'neutral';
  let insText = '';
  if (fr > 0) {
    if (fr < min) { categoria = 'bradipnea'; insTone = 'warn'; }
    else if (fr <= max) { categoria = 'normal'; insTone = 'good'; }
    else if (fr <= max + 5) { categoria = 'taquipnea leve'; insTone = 'warn'; }
    else { categoria = 'taquipnea importante'; insTone = 'warn'; }
    insText = categoria === 'normal'
      ? `Una FR de **${fr} rpm** está **dentro del rango normal** (${rangoNormal}) para ${grupoEtario.toLowerCase()}. Medila siempre en reposo y durante 60 segundos completos.`
      : `Una FR de **${fr} rpm** queda como **${categoria}** frente al rango normal de ${rangoNormal} para ${grupoEtario.toLowerCase()}. ${evaluacion.split('.').slice(1).join('.').trim() || evaluacion}`;
  } else {
    insText = `Para ${grupoEtario.toLowerCase()}, lo normal es **${rangoNormal}**. Contá las elevaciones del tórax durante **60 segundos** en reposo e ingresá el valor para evaluarlo.`;
  }

  const out: Outputs = {
    grupoEtario,
    rangoNormal,
    evaluacion,
    bradipneaUmbral: min,
    taquipneaUmbral: max,
    resumen: `${grupoEtario}: lo normal es ${rangoNormal}.${fr ? ` Tu FR es ${fr} rpm → ${evaluacion.split('.')[0]}.` : ''}`,
    causasAlteradas,
    _insight: {
      title: 'Tu frecuencia respiratoria',
      text: insText,
      tone: insTone,
      icon: '🫁',
    },
  };

  if (fr > 0) {
    out._chart = {
      type: 'scale',
      marker: fr,
      markerLabel: `${fr} rpm`,
      min: 0,
      segments: [
        { nombre: 'Bradipnea', max: min, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Normal', max: max, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Taquipnea', max: Math.max(max + 10, fr + 2), color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `Frecuencia respiratoria de ${fr} rpm frente al rango normal ${rangoNormal}`,
    };
  }

  return out;
}
