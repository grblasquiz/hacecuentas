/** Mundial 2026: récord histórico Messi y proyección */
export interface Inputs {
  partidosProyectados: number;
  minutosPromedio: number;
}

export interface Outputs {
  totalMundialesJugados: string;
  totalPartidosProyectados: string;
  totalMinutosProyectados: string;
  golesProyectados2026: string;
  golesTotalesCarrera: string;
  comparativaKlose: string;
  resumen: string;
}

// Datos históricos Messi en Mundiales (pre-2026)
const HISTORICO = {
  mundialesPrevios: 5,
  partidosPrevios: 26,
  golesPrevios: 13,
  asistenciasPrevias: 8,
  minutosPrevios: 2282,
  tasaGolPorPartido: 13 / 26, // 0.5
};

const RECORD_KLOSE = 16;

export function mundial2026MessiRecord(i: Inputs): Outputs {
  const partidos = Math.max(3, Math.min(10, Number(i.partidosProyectados || 7)));
  const minProm = Math.max(30, Math.min(120, Number(i.minutosPromedio || 70)));

  // Ajuste tasa de gol por edad: Messi 2026 (39 años) tendrá menor tasa
  const factorEdad = Math.min(1, minProm / 90); // factor por minutaje reducido
  const tasaGol2026 = HISTORICO.tasaGolPorPartido * 0.8 * factorEdad;
  const goles2026 = Math.round(partidos * tasaGol2026 * 10) / 10;
  const golesTotales = HISTORICO.golesPrevios + goles2026;

  const minutos2026 = partidos * minProm;
  const minutosTotales = HISTORICO.minutosPrevios + minutos2026;
  const partidosTotales = HISTORICO.partidosPrevios + partidos;

  const distanciaKlose = RECORD_KLOSE - golesTotales;
  let comparativa = '';
  if (golesTotales > RECORD_KLOSE) {
    comparativa = `¡SUPERA a Klose por ${(golesTotales - RECORD_KLOSE).toFixed(1)} goles! Nuevo récord histórico.`;
  } else if (golesTotales >= RECORD_KLOSE - 0.5) {
    comparativa = `Iguala/roza el récord de Klose (16 goles). ${goles2026.toFixed(1)} goles proyectados en 2026.`;
  } else {
    comparativa = `Queda a ${distanciaKlose.toFixed(1)} goles del récord de Klose (16).`;
  }

  return {
    totalMundialesJugados: '6 Mundiales (2006, 2010, 2014, 2018, 2022, 2026) — primer jugador en la historia',
    totalPartidosProyectados: `${partidosTotales} partidos (${HISTORICO.partidosPrevios} previos + ${partidos} en 2026)`,
    totalMinutosProyectados: `${minutosTotales.toLocaleString('es-AR')} minutos (~${Math.round(minutosTotales / 90)} partidos completos equivalentes)`,
    golesProyectados2026: `${goles2026.toFixed(1)} goles estimados (tasa ajustada por edad/minutaje)`,
    golesTotalesCarrera: `${golesTotales.toFixed(1)} goles totales en Mundiales`,
    comparativaKlose: comparativa,
    resumen: `**Messi pre-2026**: ${HISTORICO.partidosPrevios} partidos, ${HISTORICO.golesPrevios} goles, ${HISTORICO.asistenciasPrevias} asistencias. **Proyección 2026** (${partidos} partidos, ${minProm} min prom): +${goles2026.toFixed(1)} goles, +${minutos2026} min. **Total carrera**: ${partidosTotales} partidos, ${golesTotales.toFixed(1)} goles. ${comparativa}`,
  };
}
