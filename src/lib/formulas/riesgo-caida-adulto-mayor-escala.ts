/** Escala de Downton — Riesgo de caída en adulto mayor */
export interface Inputs {
  caidasPrevias: string;
  medicacionSedante: string;
  deficitoSensorial: string;
  estadoMental: string;
  marcha: string;
}
export interface Outputs {
  puntaje: number;
  riesgo: string;
  detalle: string;
}

export function riesgoCaidaAdultoMayorEscala(i: Inputs): Outputs {
  const puntaje =
    Number(i.caidasPrevias || 0) +
    Number(i.medicacionSedante || 0) +
    Number(i.deficitoSensorial || 0) +
    Number(i.estadoMental || 0) +
    Number(i.marcha || 0);

  let riesgo: string;
  let recomendacion: string;

  if (puntaje < 3) {
    riesgo = 'Bajo riesgo de caída';
    recomendacion = 'Medidas generales de prevención. Reevaluar periódicamente.';
  } else {
    riesgo = 'Alto riesgo de caída';
    recomendacion =
      'Intervención multifactorial: revisión de medicación, adaptaciones del hogar, ejercicios de equilibrio, evaluación sensorial. Consultar al médico.';
  }

  const factores: string[] = [];
  if (Number(i.caidasPrevias)) factores.push('caídas previas');
  if (Number(i.medicacionSedante)) factores.push('medicación de riesgo');
  if (Number(i.deficitoSensorial)) factores.push('déficit sensorial');
  if (Number(i.estadoMental)) factores.push('confusión/desorientación');
  if (Number(i.marcha)) factores.push('marcha insegura');

  const detalle =
    `Puntaje Downton: ${puntaje}/5 | ` +
    `${riesgo} | ` +
    `Factores presentes: ${factores.length > 0 ? factores.join(', ') : 'ninguno'} | ` +
    `${recomendacion}`;

  return {
    puntaje,
    riesgo: `${riesgo}. ${recomendacion}`,
    detalle,
  };
}
