/** Clasificación de presión arterial según AHA/ACC 2017 */
export interface Inputs {
  sistolica: number;
  diastolica: number;
}
export interface Outputs {
  categoria: string;
  riesgo: string;
  presionPulso: number;
  presionMedia: number;
  resumen: string;
  recomendacion: string;
}

export function presionArterial(i: Inputs): Outputs {
  const s = Number(i.sistolica);
  const d = Number(i.diastolica);
  if (!s || s < 50 || s > 260) throw new Error('Sistólica entre 50 y 260 mmHg');
  if (!d || d < 30 || d > 200) throw new Error('Diastólica entre 30 y 200 mmHg');
  if (s <= d) throw new Error('La sistólica debe ser mayor que la diastólica');

  // AHA/ACC 2017 (más conservadora que ESH 2018)
  let categoria = '';
  let riesgo = '';
  let recomendacion = '';

  if (s >= 180 || d >= 120) {
    categoria = 'Crisis hipertensiva';
    riesgo = 'Emergencia médica';
    recomendacion = 'Acudí a una guardia de inmediato. Si tenés síntomas (dolor pecho, dificultad para respirar, dolor en la espalda, debilidad, alteración visual), llamá a emergencias.';
  } else if (s >= 140 || d >= 90) {
    categoria = 'Hipertensión grado 2';
    riesgo = 'Alto';
    recomendacion = 'Consultá con tu médico. Probablemente requiera tratamiento farmacológico además de cambios de estilo de vida.';
  } else if (s >= 130 || d >= 80) {
    categoria = 'Hipertensión grado 1';
    riesgo = 'Moderado';
    recomendacion = 'Cambios de estilo de vida (dieta DASH, actividad física, reducir sal y alcohol). Tu médico evaluará si necesitás medicación según otros factores de riesgo.';
  } else if (s >= 120 && d < 80) {
    categoria = 'Presión elevada';
    riesgo = 'Borderline';
    recomendacion = 'Aún no es hipertensión, pero hay riesgo de desarrollarla. Cambios de estilo de vida y control periódico.';
  } else if (s >= 90 && d >= 60) {
    categoria = 'Normal';
    riesgo = 'Bajo';
    recomendacion = 'Mantené hábitos saludables: actividad física regular, dieta balanceada, sueño suficiente.';
  } else {
    categoria = 'Hipotensión';
    riesgo = 'Bajo (consultar si hay síntomas)';
    recomendacion = 'Si tenés mareos, fatiga o desmayos, consultá con tu médico. Hidratate bien y evitá levantarte bruscamente.';
  }

  const presionPulso = s - d;
  const presionMedia = d + (s - d) / 3; // PAM = diastólica + 1/3 × (sistólica − diastólica)

  return {
    categoria,
    riesgo,
    presionPulso,
    presionMedia: Number(presionMedia.toFixed(1)),
    resumen: `${s}/${d} mmHg → ${categoria}.`,
    recomendacion,
  };
}
