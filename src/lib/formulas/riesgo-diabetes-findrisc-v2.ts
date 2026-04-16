/** FINDRISC v2 — riesgo diabetes tipo 2 */
export interface Inputs { edad: string; imc: string; cintura: string; actividad: string; verduras: string; medicacion: string; glucemia: string; antecedentes: string; }
export interface Outputs { puntaje: number; riesgo: string; clasificacion: string; recomendacion: string; mensaje: string; }

export function riesgoDiabetesFindrisc(i: Inputs): Outputs {
  const puntaje = Number(i.edad) + Number(i.imc) + Number(i.cintura) + Number(i.actividad) + Number(i.verduras) + Number(i.medicacion) + Number(i.glucemia) + Number(i.antecedentes);

  let riesgo: string; let clasificacion: string; let recomendacion: string;
  if (puntaje < 7) {
    riesgo = '~1% (1 de 100)'; clasificacion = '🟢 Riesgo bajo';
    recomendacion = 'Tu riesgo es bajo. Mantené hábitos saludables y repetí el test en 3 años.';
  } else if (puntaje < 12) {
    riesgo = '~4% (1 de 25)'; clasificacion = '🟡 Riesgo ligeramente elevado';
    recomendacion = 'Riesgo leve. Aumentá actividad física y mejorá la dieta. Repetí anualmente.';
  } else if (puntaje < 15) {
    riesgo = '~17% (1 de 6)'; clasificacion = '🟠 Riesgo moderado';
    recomendacion = 'Riesgo moderado. Hacete una glucemia en ayunas. Cambios de estilo de vida prioritarios.';
  } else if (puntaje < 21) {
    riesgo = '~33% (1 de 3)'; clasificacion = '🔴 Riesgo alto';
    recomendacion = 'Riesgo alto. Consultá médico urgente. Glucemia + HbA1c. Cambios de vida agresivos.';
  } else {
    riesgo = '~50% (1 de 2)'; clasificacion = '🔴 Riesgo muy alto';
    recomendacion = 'Riesgo muy alto. Evaluación médica inmediata. Probablemente ya tengas prediabetes o diabetes.';
  }

  return { puntaje, riesgo, clasificacion, recomendacion, mensaje: `FINDRISC: ${puntaje}/26. Riesgo a 10 años: ${riesgo}. ${clasificacion}.` };
}