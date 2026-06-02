/** FINDRISC v2 — riesgo diabetes tipo 2 */
export interface Inputs { edad: string; imc: string; cintura: string; actividad: string; verduras: string; medicacion: string; glucemia: string; antecedentes: string; }
export interface Outputs { puntaje: number; riesgo: string; clasificacion: string; recomendacion: string; mensaje: string; _insight?: any; _chart?: any; }

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

  const chart = {
    type: 'scale' as const,
    marker: puntaje,
    markerLabel: 'Tu puntaje: ' + puntaje,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Bajo', max: 7, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Ligero', max: 12, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Moderado', max: 15, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Alto', max: 21, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Muy alto', max: Math.max(26, Math.ceil(puntaje) + 1), color: '#fca5a5', colorDark: '#991b1b' },
    ],
    ariaLabel: 'Escala FINDRISC de riesgo de diabetes tipo 2: tu puntaje ' + puntaje + ' sobre 26',
  };

  const tone = puntaje < 12 ? (puntaje < 7 ? 'good' as const : 'neutral' as const) : 'warn' as const;
  const _insight = {
    title: 'Qué significa tu puntaje',
    text: `Tu FINDRISC es **${puntaje}/26**, que estima un riesgo de desarrollar diabetes tipo 2 en 10 años de **${riesgo}**. ` +
      (puntaje < 7
        ? 'Es un riesgo bajo: con sostener buenos hábitos podés repetir el test recién en unos años.'
        : puntaje < 12
        ? 'Está ligeramente elevado: pequeños cambios en dieta y actividad física ahora hacen una diferencia grande a futuro.'
        : puntaje < 15
        ? 'Es un riesgo moderado: conviene hacerte una glucemia en ayunas y priorizar cambios de estilo de vida.'
        : 'Es un riesgo alto: pedí una evaluación médica (glucemia + HbA1c) sin demorarlo, hay mucho margen para revertirlo a tiempo.'),
    tone,
    icon: puntaje < 7 ? '🟢' : puntaje < 12 ? '🩸' : '⚠️',
  };

  return { puntaje, riesgo, clasificacion, recomendacion, mensaje: `FINDRISC: ${puntaje}/26. Riesgo a 10 años: ${riesgo}. ${clasificacion}.`, _insight, _chart: chart };
}