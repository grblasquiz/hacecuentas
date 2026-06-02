/** WPM Teclas por Minuto (Typing) */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  wpmBruto: number;
  wpmNeto: number;
  accuracy: number;
  categoria: string;
  _chart?: any;
  _insight?: any;
}

export function teclaPorMinutoTypingTest(i: Inputs): Outputs {
  const pal = Number(i.palabrasEscritas) || 0;
  const min = Number(i.minutosTest) || 1;
  const err = Number(i.erroresSinCorregir) || 0;
  if (pal <= 0 || min <= 0) throw new Error('Datos inválidos');

  const wpmBruto = pal / min;
  const wpmNeto = Math.max(0, wpmBruto - (err / min));
  const accuracy = Math.max(0, ((pal - err) / pal) * 100);

  let cat = '';
  if (wpmNeto < 25) cat = 'Muy lento';
  else if (wpmNeto < 40) cat = 'Promedio (2 dedos)';
  else if (wpmNeto < 55) cat = 'Normal';
  else if (wpmNeto < 70) cat = 'Bueno';
  else if (wpmNeto < 90) cat = 'Muy bueno (profesional)';
  else if (wpmNeto < 120) cat = 'Excelente';
  else cat = 'Experto mundial';

  const wpmNetoR = Math.round(wpmNeto);
  const chart = {
    type: 'scale' as const,
    marker: wpmNetoR,
    markerLabel: 'Tu velocidad: ' + wpmNetoR + ' WPM',
    min: 0,
    unit: ' WPM',
    segments: [
      { nombre: 'Muy lento', max: 25, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Promedio', max: 40, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Normal', max: 55, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Bueno', max: 70, color: '#d9f99d', colorDark: '#4d7c0f' },
      { nombre: 'Muy bueno', max: 90, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Excelente / experto', max: Math.max(120, Math.ceil(wpmNetoR) + 10), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de velocidad de tipeo en palabras por minuto, de muy lento a experto.',
  };

  const accuracyR = Math.round(accuracy * 10) / 10;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (wpmNetoR >= 55 && accuracyR >= 95) insightTone = 'good';
  else if (wpmNetoR < 40 || accuracyR < 92) insightTone = 'warn';
  else insightTone = 'neutral';
  const precisionTxt = accuracyR >= 97
    ? 'una precisión excelente'
    : accuracyR >= 93
      ? 'una precisión correcta'
      : 'una precisión baja: frenar un poco te subiría el neto';
  const _insight = {
    title: 'Tu velocidad de tipeo',
    text: `Escribís a **${wpmNetoR} WPM** netas (${Math.round(wpmBruto)} brutas) con **${accuracyR}%** de aciertos, nivel **${cat}**. Eso es ${precisionTxt}. La media de oficina ronda 40 WPM y un profesional supera las 65.`,
    tone: insightTone,
    icon: '⌨️',
  };

  return {
    wpmBruto: Math.round(wpmBruto),
    wpmNeto: wpmNetoR,
    accuracy: accuracyR,
    categoria: cat,
    _chart: chart,
    _insight,
  };

}
