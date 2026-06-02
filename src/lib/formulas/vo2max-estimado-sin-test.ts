/** VO2max estimado sin test - fórmula de Uth */
export interface Inputs {
  fcReposo: number;
  fcMaxima: number;
  edad: number;
  sexo: string;
}
export interface Outputs {
  vo2max: number;
  clasificacion: string;
  percentil: string;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

export function vo2maxEstimadoSinTest(i: Inputs): Outputs {
  const fcReposo = Number(i.fcReposo);
  const fcMaxima = Number(i.fcMaxima);
  const edad = Number(i.edad);
  const sexo = String(i.sexo || 'masculino');
  if (!fcReposo || fcReposo <= 0) throw new Error('Ingresá tu FC en reposo');
  if (!fcMaxima || fcMaxima <= fcReposo) throw new Error('La FC máxima debe ser mayor que la FC en reposo');

  // Uth formula: VO2max = 15.3 × (FCmax / FCreposo)
  const vo2max = Number((15.3 * (fcMaxima / fcReposo)).toFixed(1));

  // Classification based on ACSM tables
  let clasificacion: string;
  let percentil: string;
  if (sexo === 'masculino') {
    if (vo2max >= 60) { clasificacion = 'Superior'; percentil = 'Top 5%'; }
    else if (vo2max >= 52) { clasificacion = 'Excelente'; percentil = 'Top 10-15%'; }
    else if (vo2max >= 45) { clasificacion = 'Bueno'; percentil = 'Top 25-30%'; }
    else if (vo2max >= 38) { clasificacion = 'Promedio'; percentil = 'Percentil 40-60%'; }
    else if (vo2max >= 30) { clasificacion = 'Por debajo del promedio'; percentil = 'Percentil 20-40%'; }
    else { clasificacion = 'Bajo'; percentil = 'Percentil <20%'; }
  } else {
    if (vo2max >= 52) { clasificacion = 'Superior'; percentil = 'Top 5%'; }
    else if (vo2max >= 45) { clasificacion = 'Excelente'; percentil = 'Top 10-15%'; }
    else if (vo2max >= 38) { clasificacion = 'Bueno'; percentil = 'Top 25-30%'; }
    else if (vo2max >= 32) { clasificacion = 'Promedio'; percentil = 'Percentil 40-60%'; }
    else if (vo2max >= 25) { clasificacion = 'Por debajo del promedio'; percentil = 'Percentil 20-40%'; }
    else { clasificacion = 'Bajo'; percentil = 'Percentil <20%'; }
  }

  // Umbrales ACSM usados arriba, para la escala
  const u = sexo === 'masculino' ? [30, 38, 45, 52, 60] : [25, 32, 38, 45, 52];
  const topChart = Math.max(u[4] + 8, Math.ceil(vo2max) + 4);
  const chart = {
    type: 'scale' as const,
    marker: vo2max,
    markerLabel: 'Tu VO2max: ' + vo2max + ' ml/kg/min',
    min: 15,
    unit: '',
    segments: [
      { nombre: 'Bajo', max: u[0], color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Bajo el promedio', max: u[1], color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Promedio', max: u[2], color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Bueno', max: u[3], color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Excelente', max: u[4], color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Superior', max: topChart, color: '#a7f3d0', colorDark: '#047857' },
    ],
    ariaLabel: 'Escala VO2max ACSM por sexo: de bajo a superior',
  };

  const tone = (clasificacion === 'Superior' || clasificacion === 'Excelente') ? 'good'
    : (clasificacion === 'Bajo' || clasificacion === 'Por debajo del promedio') ? 'warn' : 'neutral';
  const insight = {
    title: 'Tu VO2max estimado',
    text: `Con una FC máxima de **${fcMaxima} ppm** y una FC en reposo de **${fcReposo} ppm** (fórmula de Uth), tu VO2max estimado es de **${vo2max} ml/kg/min**: clasificación **${clasificacion}** (${percentil}) para tu sexo. Una FC en reposo más baja suele reflejar mejor condición cardiovascular.`,
    tone,
    icon: '❤️',
  };

  return {
    vo2max,
    clasificacion,
    percentil,
    mensaje: `VO2max estimado: ${vo2max} ml/kg/min (${clasificacion}). ${percentil} para tu edad y sexo.`,
    _chart: chart,
    _insight: insight
  };
}