/** Porcentaje de clean sheets (vallas invictas) en una temporada. */
export interface Inputs {
  cleanSheets: number;
  partidosJugados: number;
}
export interface Outputs {
  porcentaje: number;
  partidosConGolEnContra: number;
  categoriaRendimiento: string;
  benchmark: string;
  mensaje: string;
}

export function cleanSheetsPorcentaje(i: Inputs): Outputs {
  if (!i.partidosJugados || i.partidosJugados <= 0) throw new Error('Partidos jugados debe ser > 0.');
  if (i.cleanSheets < 0 || i.cleanSheets > i.partidosJugados) throw new Error('Clean sheets fuera de rango.');
  const pct = (i.cleanSheets / i.partidosJugados) * 100;
  const conGol = i.partidosJugados - i.cleanSheets;

  // Benchmarks 2024-25 top arqueros top-5 ligas europeas (FBref):
  // Elite Ballon d'Or / Yashin: 45%+
  // Top titular europeo: 35-45%
  // Promedio: 25-35%
  // Bajo: < 25%
  let cat = 'Rendimiento por debajo del promedio';
  let bm = 'Arqueros de equipos zona baja promedian <25% en top-5 ligas.';
  if (pct >= 45) { cat = 'Elite mundial (candidato a premio Yashin)'; bm = 'Solo 3-5 arqueros por temporada superan este umbral (ej: Donnarumma 47%, Ederson 46%).'; }
  else if (pct >= 35) { cat = 'Top arquero europeo'; bm = 'Rango típico de arqueros de equipos top-6 en top-5 ligas.'; }
  else if (pct >= 25) { cat = 'Arquero titular promedio'; bm = 'Mediana de titulares en ligas top-5.'; }

  return {
    porcentaje: Math.round(pct * 10) / 10,
    partidosConGolEnContra: conGol,
    categoriaRendimiento: cat,
    benchmark: bm,
    mensaje: `${i.cleanSheets}/${i.partidosJugados} = ${pct.toFixed(1)}% clean sheets → ${cat}.`,
  };
}
