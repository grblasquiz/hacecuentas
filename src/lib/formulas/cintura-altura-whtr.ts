/** Ratio cintura/altura (WHtR) para evaluar riesgo metabólico */
export interface Inputs {
  cintura: number;
  altura: number;
}
export interface Outputs {
  whtr: number;
  categoria: string;
  riesgo: string;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function cinturaAlturaWhtr(i: Inputs): Outputs {
  const cintura = Number(i.cintura);
  const altura = Number(i.altura);

  if (!cintura || cintura <= 0) throw new Error('Ingresá el perímetro de cintura');
  if (!altura || altura <= 0) throw new Error('Ingresá tu altura');

  const whtr = cintura / altura;

  let categoria = '';
  let riesgo = '';

  if (whtr < 0.4) {
    categoria = 'Delgadez extrema';
    riesgo = 'Bajo peso — consultá con un profesional';
  } else if (whtr < 0.5) {
    categoria = 'Saludable';
    riesgo = 'Bajo';
  } else if (whtr < 0.6) {
    categoria = 'Sobrepeso abdominal';
    riesgo = 'Aumentado';
  } else {
    categoria = 'Obesidad abdominal';
    riesgo = 'Alto';
  }

  const cinturaIdeal = Math.round(altura * 0.5);
  const diff = Math.round(cintura - cinturaIdeal);

  const detalle = whtr < 0.5
    ? `Tu WHtR es ${whtr.toFixed(2)} — estás en zona saludable. Tu cintura ideal máxima sería ${cinturaIdeal} cm.`
    : `Tu WHtR es ${whtr.toFixed(2)} — riesgo ${riesgo.toLowerCase()}. Deberías reducir ${diff} cm de cintura para llegar a la zona saludable (${cinturaIdeal} cm).`;

  const whtrVal = Number(whtr.toFixed(2));

  let insTone: 'good' | 'warn', insIcon: string, insText: string;
  if (whtr < 0.4) {
    insTone = 'warn'; insIcon = '🩺';
    insText = `Tu WHtR es **${whtrVal.toFixed(2)}**, por debajo de 0,40: **delgadez extrema**. La regla "cintura < mitad de la altura" se cumple de sobra, pero un valor tan bajo conviene revisarlo con un profesional.`;
  } else if (whtr < 0.5) {
    insTone = 'good'; insIcon = '✅';
    insText = `Tu WHtR es **${whtrVal.toFixed(2)}**, en **zona saludable** (<0,50): tu cintura es menos de la mitad de tu altura, el umbral clave de bajo riesgo metabólico. Tu cintura ideal máxima es **${cinturaIdeal} cm**.`;
  } else {
    insTone = 'warn'; insIcon = '⚠️';
    insText = `Tu WHtR es **${whtrVal.toFixed(2)}**, sobre 0,50: **${categoria.toLowerCase()}**, riesgo **${riesgo.toLowerCase()}**. Bajar **${diff} cm** de cintura te llevaría al umbral saludable de **${cinturaIdeal} cm**.`;
  }
  const insight = { title: 'Tu riesgo según WHtR', text: insText, tone: insTone, icon: insIcon };

  const chart = {
    type: 'scale' as const,
    marker: whtrVal,
    markerLabel: 'Tu WHtR: ' + whtrVal.toFixed(2),
    min: 0.3,
    unit: '',
    segments: [
      { nombre: 'Delgadez', max: 0.4, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Saludable', max: 0.5, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Sobrepeso abdominal', max: 0.6, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Obesidad abdominal', max: Math.max(0.7, whtrVal + 0.05), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de riesgo metabólico según índice cintura/altura',
  };

  return {
    whtr: whtrVal,
    categoria,
    riesgo,
    detalle,
    _chart: chart,
    _insight: insight,
  };
}
