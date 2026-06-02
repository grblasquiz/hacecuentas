/** WHO-5 Well-Being Index */
export interface Inputs {
  w1: string; w2: string; w3: string; w4: string; w5: string;
}
export interface Outputs {
  indice: number;
  puntajeRaw: number;
  clasificacion: string;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

export function indiceBienestarWho5(i: Inputs): Outputs {
  const raw = Number(i.w1) + Number(i.w2) + Number(i.w3) + Number(i.w4) + Number(i.w5);
  const indice = raw * 4;

  let clasificacion: string;
  if (indice > 50) clasificacion = 'Bienestar normal';
  else if (indice >= 28) clasificacion = 'Bienestar bajo — considerá buscar apoyo';
  else clasificacion = 'Bienestar muy bajo — se recomienda evaluación profesional';

  let insight: any;
  if (indice > 50) {
    insight = {
      title: 'Bienestar en rango normal',
      text: `Tu WHO-5 es **${indice}/100**, dentro del rango de **bienestar normal** (umbral 50). Es un buen indicador, aunque el test es orientativo y no reemplaza una evaluación clínica.`,
      tone: 'good',
      icon: '😊',
    };
  } else if (indice >= 28) {
    insight = {
      title: 'Bienestar bajo',
      text: `Tu WHO-5 es **${indice}/100**, por debajo del umbral de **50**. Un puntaje en esta zona sugiere bienestar reducido: considerá hablar con alguien de confianza o un profesional.`,
      tone: 'warn',
      icon: '😟',
    };
  } else {
    insight = {
      title: 'Bienestar muy bajo',
      text: `Tu WHO-5 es **${indice}/100**, por debajo de **28**: un puntaje en esta zona se asocia a riesgo de depresión y **se recomienda una evaluación profesional**. Si la pasás mal, buscá ayuda.`,
      tone: 'warn',
      icon: '🆘',
    };
  }

  const chart = {
    type: 'scale' as const,
    marker: indice,
    markerLabel: 'Tu WHO-5: ' + indice,
    min: 0,
    segments: [
      { nombre: 'Muy bajo', max: 28, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Bajo', max: 50, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 100, color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: 'Escala del índice de bienestar WHO-5 de 0 a 100 con zonas muy bajo, bajo y normal.',
  };

  return {
    indice,
    puntajeRaw: raw,
    clasificacion,
    mensaje: `WHO-5: ${indice}/100 (raw: ${raw}/25). ${clasificacion}.`,
    _chart: chart,
    _insight: insight,
  };
}