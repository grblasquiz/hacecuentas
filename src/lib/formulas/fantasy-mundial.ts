/** Fantasy Mundial 2026 — puntos estimados de un once para torneo corto (max 7 partidos) */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

export function fantasyMundial(i: Inputs): Outputs {
  const partidos = Math.min(Number(i.partidosEstimados) || 5, 7); // max 7: 3 grupo + 4 eliminatoria
  const golesTeam = Number(i.golesEsperadosEquipo) || 0;
  const cleanSheetsEsperados = Number(i.cleanSheetsEsperados) || 0;

  const nGk = 1, nDef = 4, nMid = 3, nFwd = 3; // 4-3-3 titular
  // reparto de goles del equipo: 60% fwd, 30% mid, 10% def
  const gFwd = golesTeam * 0.6;
  const gMid = golesTeam * 0.3;
  const gDef = golesTeam * 0.1;

  // asistencias ~ 70% de los goles del equipo
  const aTotal = golesTeam * 0.7;
  const aMid = aTotal * 0.5;
  const aFwd = aTotal * 0.3;
  const aDef = aTotal * 0.2;

  // Sistema FPL-like para Mundial: Gol FWD=4, MID=5, DEF=6, GK=10. Asist=3. Clean sheet DEF/GK=4, MID=1. 60+min=2.
  let pts = 0;
  pts += (nGk + 10 + nDef + nMid + nFwd) * 2 * partidos; // aprox appearance 2 pts por 11 titulares × partidos (cuenta 11 × 2)
  // Corrijo: 2 pts por aparición de los 11 jugadores por partido
  pts = 11 * 2 * partidos;
  // Goles
  pts += gFwd * 4 + gMid * 5 + gDef * 6;
  // Asistencias
  pts += aTotal * 3;
  // Clean sheets
  pts += cleanSheetsEsperados * (4 + nDef * 4 + nMid * 1); // GK + 4 DEF + 3 MID
  // Bonus por gol contra (si encaja muchos)
  // asumimos partidos sin clean sheet => 1.5 goles promedio recibidos
  const partidosSinCleanSheet = Math.max(0, partidos - cleanSheetsEsperados);
  const golesRecibidos = partidosSinCleanSheet * 1.5;
  pts -= Math.floor(golesRecibidos / 2) * (1 + nDef); // GK + DEF pierden 1 pto cada 2 goles

  // Bonus system (BPS top 3 por partido, aprox +6 a los 3 mejores de tu team)
  pts += partidos * 6;

  const ptsRedondeo = Math.round(pts);

  const nivel = ptsRedondeo >= 400 ? 'Plantilla élite' : ptsRedondeo >= 300 ? 'Plantilla fuerte' : ptsRedondeo >= 200 ? 'Plantilla media' : 'Plantilla baja';

  return {
    puntosEstimados: `${ptsRedondeo} pts`,
    puntosPorPartido: `${(pts / partidos).toFixed(1)} pts/partido`,
    partidosEvaluados: `${partidos} partidos`,
    ptsPorGoles: `${(gFwd * 4 + gMid * 5 + gDef * 6).toFixed(0)} pts`,
    ptsPorAsistencias: `${(aTotal * 3).toFixed(0)} pts`,
    ptsPorCleanSheets: `${(cleanSheetsEsperados * (4 + nDef * 4 + nMid * 1)).toFixed(0)} pts`,
    nivelPlantilla: nivel,
  };
}
