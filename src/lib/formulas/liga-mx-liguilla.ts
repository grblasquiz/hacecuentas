/**
 * Liga MX — Liguilla / Play-In.
 *
 * Top 6 clasifican directo a Liguilla (cuartos de final).
 * Puestos 7-10 juegan el Play-In por 2 cupos restantes.
 *   - 7º vs 8º: ganador a Liguilla (cupo 7).
 *   - 9º vs 10º: perdedor queda afuera; ganador juega contra perdedor de 7º-8º por cupo 8.
 *
 * Temporada regular 17 fechas (Apertura o Clausura).
 */

export interface LigaMxInputs {
  puntosEquipo: number;
  puntosSextoLugar: number; // umbral cupo directo
  puntosDecimoLugar: number; // umbral para meterse al Play-In
  fechasRestantes: number;
}

export interface LigaMxOutputs {
  puntosParaDirecto: number;
  puntosParaPlayIn: number;
  puntosMaxPosibles: number;
  puntosEsperadosFinal: number;
  escenario: string;
}

export function ligaMxLiguilla(inputs: LigaMxInputs): LigaMxOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts6 = Number(inputs.puntosSextoLugar) || 0;
  const pts10 = Number(inputs.puntosDecimoLugar) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);

  const fechasJugadas = Math.max(1, 17 - fechas);
  const proyeccion = pts / fechasJugadas;
  const puntosEsperadosFinal = Math.round(proyeccion * 17);

  const puntosParaDirecto = Math.max(0, pts6 - pts + 1);
  const puntosParaPlayIn = Math.max(0, pts10 - pts + 1);
  const puntosMaxPosibles = pts + fechas * 3;

  let escenario = '';
  if (puntosMaxPosibles < pts10) {
    escenario = '🔴 Eliminado matemáticamente del Play-In.';
  } else if (pts > pts6) {
    escenario = '🏆 En zona de Liguilla directa (top 6).';
  } else if (pts > pts10) {
    escenario = '🟡 En zona Play-In (7-10).';
  } else if (puntosParaPlayIn <= fechas) {
    escenario = '🟠 Podés entrar al Play-In con 1-3 triunfos.';
  } else {
    escenario = '⚠️ Necesitás racha ganadora para meterte al Play-In.';
  }

  return {
    puntosParaDirecto,
    puntosParaPlayIn,
    puntosMaxPosibles,
    puntosEsperadosFinal,
    escenario,
  };
}
