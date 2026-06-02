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
  _insight?: any;
  _chart?: any;
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

  const chart = {
    type: 'scale' as const,
    marker: puntaje,
    markerLabel: 'Tu puntaje: ' + puntaje + '/5',
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Bajo riesgo', max: 3, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Alto riesgo', max: 5, color: '#fed7aa', colorDark: '#9a3412' },
    ],
    ariaLabel: 'Escala de Downton de riesgo de caída: bajo riesgo (0-2), alto riesgo (3-5)',
  };

  const esAlto = puntaje >= 3;
  const factoresTxt = factores.length > 0 ? factores.join(', ') : 'ninguno';
  const _insight = {
    title: 'Qué significa este puntaje',
    text: esAlto
      ? `Con **${puntaje}/5** en la escala de Downton el riesgo de caída es **alto** (corte ≥3). Los factores presentes son: **${factoresTxt}**. Conviene una intervención multifactorial (revisar medicación, adaptar el hogar y trabajar el equilibrio) y consultar al médico.`
      : `Con **${puntaje}/5** en la escala de Downton el riesgo de caída es **bajo** (corte ≥3)${factores.length > 0 ? `, aunque ya hay un factor a vigilar: **${factoresTxt}**` : ''}. Mantené medidas generales de prevención y reevaluá si aparecen caídas, nuevos fármacos o cambios en la marcha.`,
    tone: esAlto ? 'warn' as const : 'good' as const,
    icon: esAlto ? '⚠️' : '🟢',
  };

  return {
    puntaje,
    riesgo: `${riesgo}. ${recomendacion}`,
    detalle,
    _insight,
    _chart: chart,
  };
}
