/** Periodización de entrenamiento por mesociclo */
export interface Inputs {
  semanas: number;
  seriesBase: number;
  tipo: string;
}
export interface Outputs {
  plan: string;
  seriesSemana1: number;
  intensidadSemana1: string;
  deloadSemana: string;
  mensaje: string;
}

export function periodizacionEntrenamiento(i: Inputs): Outputs {
  const semanas = Number(i.semanas) || 4;
  const seriesBase = Number(i.seriesBase) || 15;
  const tipo = String(i.tipo || 'lineal');

  const deloadWeek = semanas;
  const trainingWeeks = semanas - 1;

  let plan = '';
  let seriesSemana1 = seriesBase;
  let intensidadSemana1 = '';

  if (tipo === 'lineal') {
    intensidadSemana1 = '65-70% 1RM (8-12 reps)';
    for (let w = 1; w <= semanas; w++) {
      if (w === semanas) {
        plan += `Sem ${w} (DELOAD): ${Math.round(seriesBase * 0.6)} series, 60% 1RM\n`;
      } else {
        const intPct = 65 + (w - 1) * (20 / trainingWeeks);
        const vol = Math.round(seriesBase * (1 + (w - 1) * 0.1));
        plan += `Sem ${w}: ${vol} series, ${Math.round(intPct)}-${Math.round(intPct + 5)}% 1RM\n`;
        if (w === 1) seriesSemana1 = vol;
      }
    }
  } else if (tipo === 'ondulante') {
    intensidadSemana1 = 'Varía: pesado/moderado/liviano dentro de la semana';
    for (let w = 1; w <= semanas; w++) {
      if (w === semanas) {
        plan += `Sem ${w} (DELOAD): ${Math.round(seriesBase * 0.6)} series, cargas reducidas\n`;
      } else {
        const vol = Math.round(seriesBase * (1 + (w - 1) * 0.07));
        plan += `Sem ${w}: ${vol} series. Lun: 85% 3x5 | Mié: 70% 3x10 | Vie: 80% 4x6\n`;
        if (w === 1) seriesSemana1 = vol;
      }
    }
  } else {
    intensidadSemana1 = '70-75% 1RM — bloque acumulación';
    const halfPoint = Math.ceil(trainingWeeks / 2);
    for (let w = 1; w <= semanas; w++) {
      if (w === semanas) {
        plan += `Sem ${w} (DELOAD): ${Math.round(seriesBase * 0.6)} series\n`;
      } else if (w <= halfPoint) {
        const vol = Math.round(seriesBase * 1.1);
        plan += `Sem ${w} (Acumulación): ${vol} series, 70-80% 1RM\n`;
        if (w === 1) seriesSemana1 = vol;
      } else {
        const vol = Math.round(seriesBase * 0.8);
        plan += `Sem ${w} (Intensificación): ${vol} series, 85-95% 1RM\n`;
      }
    }
  }

  return {
    plan,
    seriesSemana1,
    intensidadSemana1,
    deloadSemana: `Semana ${semanas}: -40% volumen, -20% intensidad`,
    mensaje: `Mesociclo de ${semanas} semanas (${tipo}). ${trainingWeeks} semanas de trabajo + 1 deload.`
  };
}