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

  return {
    vo2max,
    clasificacion,
    percentil,
    mensaje: `VO2max estimado: ${vo2max} ml/kg/min (${clasificacion}). ${percentil} para tu edad y sexo.`
  };
}