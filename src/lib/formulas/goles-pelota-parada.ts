/** % de goles de pelota parada (set-piece) sobre total de goles del equipo. */
export interface Inputs {
  golesPelotaParada: number;
  golesTotales: number;
}
export interface Outputs {
  porcentaje: number;
  golesJuegoCorrido: number;
  categoria: string;
  benchmark: string;
  mensaje: string;
}

export function golesPelotaParada(i: Inputs): Outputs {
  if (!i.golesTotales || i.golesTotales <= 0) throw new Error('Goles totales debe ser > 0.');
  if (i.golesPelotaParada < 0 || i.golesPelotaParada > i.golesTotales) throw new Error('Goles de pelota parada fuera de rango.');
  const pct = (i.golesPelotaParada / i.golesTotales) * 100;
  const juego = i.golesTotales - i.golesPelotaParada;

  // Benchmarks Opta 2024-25:
  // Promedio global fútbol profesional: ~30%
  // Equipos elite técnicos (juego de posición): 15-22%
  // Rango sano: 25-35%
  // Tirantes / dependientes de córner + tiro libre: 35%+
  // Muy bajo (< 15%): ataques basados 100% en juego colectivo
  let cat = 'Peso moderado';
  let bm = 'Promedio histórico profesional ronda el 30% — un tercio de los goles llegan de pelota parada.';
  if (pct >= 40) { cat = 'Altísima dependencia de pelota parada'; bm = 'Equipos tipo Tony Pulis-Stoke o Simeone-Atlético en ciertas temporadas.'; }
  else if (pct >= 30) { cat = 'Peso alto / estratégico'; bm = 'Liverpool 2023-24 (~32%), Real Madrid 2024-25 (~28%).'; }
  else if (pct >= 20) { cat = 'Peso moderado / balance'; bm = 'Rango típico de equipos medios de top-5 ligas.'; }
  else if (pct >= 10) { cat = 'Bajo peso — juego desde pase'; bm = 'Equipos de juego de posición puro (Barça Guardiola 2010-13, Bayern tiki-taka).'; }
  else { cat = 'Muy bajo — modelo colectivo'; bm = 'Ejemplos aislados; históricamente <10% es excepción.'; }

  return {
    porcentaje: Math.round(pct * 10) / 10,
    golesJuegoCorrido: juego,
    categoria: cat,
    benchmark: bm,
    mensaje: `${i.golesPelotaParada}/${i.golesTotales} = ${pct.toFixed(1)}% goles de pelota parada (${cat}).`,
  };
}
