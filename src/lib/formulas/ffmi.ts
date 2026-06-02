/** FFMI — Fat-Free Mass Index (Índice de Masa Libre de Grasa) */
export interface Inputs {
  peso: number;
  altura: number;
  grasa: number; // % grasa corporal
  sexo?: string;
}
export interface Outputs {
  ffmi: number;
  ffmiAjustado: number;
  masaMagra: number;
  masaGrasa: number;
  categoria: string;
  resumen: string;
  natural: string;
  _insight?: any;
  _chart?: any;
}

export function ffmi(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const altura = Number(i.altura) / 100; // m
  const grasa = Number(i.grasa);
  const sexo = String(i.sexo || 'hombre');

  if (!peso || peso < 30 || peso > 250) throw new Error('Peso entre 30 y 250 kg');
  if (!altura || altura < 1.0 || altura > 2.5) throw new Error('Altura entre 100 y 250 cm');
  if (grasa < 3 || grasa > 60) throw new Error('% grasa corporal entre 3 y 60');

  const masaMagra = peso * (1 - grasa / 100);
  const masaGrasa = peso - masaMagra;

  const ffmi = masaMagra / (altura * altura);
  // Ajuste a altura de 1.80m (Kouri et al., 1995)
  const ffmiAjustado = ffmi + 6.1 * (1.8 - altura);

  // Categorías según Kouri (hombres) y aproximación para mujeres
  let categoria = '';
  let natural = '';
  if (sexo === 'hombre') {
    if (ffmiAjustado < 18) categoria = 'Por debajo del promedio';
    else if (ffmiAjustado < 20) categoria = 'Promedio';
    else if (ffmiAjustado < 22) categoria = 'Por encima del promedio';
    else if (ffmiAjustado < 23) categoria = 'Excelente (rango natural alto)';
    else if (ffmiAjustado < 25) categoria = 'Sobresaliente (límite natural superior)';
    else categoria = 'Sospechoso (probable uso de ayudas no naturales)';

    if (ffmiAjustado <= 25) natural = 'Dentro del rango natural alcanzable sin esteroides anabólicos.';
    else natural = 'Por encima del techo natural descripto en el estudio de Kouri (1995). En personas no entrenadas o con menos años de entrenamiento, este FFMI suele asociarse a uso de ayudas no naturales.';
  } else {
    if (ffmiAjustado < 14) categoria = 'Por debajo del promedio';
    else if (ffmiAjustado < 16) categoria = 'Promedio';
    else if (ffmiAjustado < 18) categoria = 'Por encima del promedio';
    else if (ffmiAjustado < 19) categoria = 'Excelente';
    else if (ffmiAjustado < 22) categoria = 'Sobresaliente';
    else categoria = 'Excepcional (revisar mediciones)';

    if (ffmiAjustado <= 22) natural = 'Dentro del rango natural alcanzable.';
    else natural = 'Muy por encima del rango habitual en mujeres entrenadas naturalmente.';
  }

  const ffmiAjR = Number(ffmiAjustado.toFixed(1));
  const masaMagraR = Number(masaMagra.toFixed(1));
  const techoNatural = sexo === 'hombre' ? 25 : 22;
  const sobreTecho = ffmiAjR > techoNatural;
  // tono: warn si supera el techo natural; good si excelente/sobresaliente dentro de lo natural; neutral si promedio o menos
  const umbralBueno = sexo === 'hombre' ? 22 : 18;
  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  if (sobreTecho) tone = 'warn';
  else if (ffmiAjR >= umbralBueno) tone = 'good';

  const insightText = sobreTecho
    ? `Tu FFMI ajustado de **${ffmiAjR}** supera el techo natural de **~${techoNatural}** descripto por Kouri (1995): cae en "${categoria}". Alcanzable de forma natural sólo con muchos años de entrenamiento y genética excepcional.`
    : ffmiAjR >= umbralBueno
      ? `Con **${ffmiAjR}** de FFMI ajustado y **${masaMagraR} kg** de masa magra estás en "${categoria}" — top del rango natural, todavía por debajo del techo de ~${techoNatural}.`
      : `Tu FFMI ajustado es **${ffmiAjR}** ("${categoria}"), con **${masaMagraR} kg** de masa magra. Hay margen para ganar músculo dentro del rango natural (techo ~${techoNatural}).`;

  const segments = sexo === 'hombre'
    ? [
        { nombre: 'Bajo', max: 18, color: '#94a3b8', colorDark: '#64748b' },
        { nombre: 'Promedio', max: 20, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Sobre promedio', max: 22, color: '#34d399', colorDark: '#10b981' },
        { nombre: 'Excelente', max: 25, color: '#fbbf24', colorDark: '#f59e0b' },
        { nombre: 'Sospechoso', max: Math.max(30, Math.ceil(ffmiAjR) + 1), color: '#f87171', colorDark: '#ef4444' },
      ]
    : [
        { nombre: 'Bajo', max: 14, color: '#94a3b8', colorDark: '#64748b' },
        { nombre: 'Promedio', max: 16, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Sobre promedio', max: 18, color: '#34d399', colorDark: '#10b981' },
        { nombre: 'Excelente', max: 19, color: '#a3e635', colorDark: '#84cc16' },
        { nombre: 'Sobresaliente', max: 22, color: '#fbbf24', colorDark: '#f59e0b' },
        { nombre: 'Excepcional', max: Math.max(26, Math.ceil(ffmiAjR) + 1), color: '#f87171', colorDark: '#ef4444' },
      ];

  return {
    ffmi: Number(ffmi.toFixed(1)),
    ffmiAjustado: ffmiAjR,
    masaMagra: masaMagraR,
    masaGrasa: Number(masaGrasa.toFixed(1)),
    categoria,
    resumen: `Tu FFMI es ${ffmi.toFixed(1)} (ajustado a 1.80m: ${ffmiAjustado.toFixed(1)}) → ${categoria}.`,
    natural,
    _insight: {
      title: 'Qué dice tu FFMI',
      text: insightText,
      tone,
      icon: '💪',
    },
    _chart: {
      type: 'scale',
      marker: ffmiAjR,
      markerLabel: `FFMI ${ffmiAjR}`,
      min: sexo === 'hombre' ? 14 : 10,
      segments,
      ariaLabel: `FFMI ajustado ${ffmiAjR} sobre la escala de categorías: ${categoria}`,
    },
  };
}
