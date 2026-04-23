/**
 * MLS Playoffs — formato 2026.
 *
 * Cada conferencia (Este y Oeste) tiene 15 equipos. 9 clasifican a playoffs:
 *   - Top 7 van directo a Round 1.
 *   - Puestos 8 y 9 juegan el Wild Card por el último cupo.
 *
 * Temporada regular 34 fechas.
 */

export interface MlsInputs {
  puntosEquipo: number;
  puntosSeptimoConferencia: number; // umbral cupo directo
  puntosNovenoConferencia: number; // umbral Wild Card
  fechasRestantes: number;
}

export interface MlsOutputs {
  puntosParaDirecto: number;
  puntosParaWildCard: number;
  puntosMaxPosibles: number;
  puntosEsperadosFinal: number;
  escenario: string;
}

export function mlsPlayoffs(inputs: MlsInputs): MlsOutputs {
  const pts = Number(inputs.puntosEquipo) || 0;
  const pts7 = Number(inputs.puntosSeptimoConferencia) || 0;
  const pts9 = Number(inputs.puntosNovenoConferencia) || 0;
  const fechas = Math.max(0, Number(inputs.fechasRestantes) || 0);

  const fechasJugadas = Math.max(1, 34 - fechas);
  const proyeccion = pts / fechasJugadas;
  const puntosEsperadosFinal = Math.round(proyeccion * 34);

  const puntosParaDirecto = Math.max(0, pts7 - pts + 1);
  const puntosParaWildCard = Math.max(0, pts9 - pts + 1);
  const puntosMaxPosibles = pts + fechas * 3;

  let escenario = '';
  if (puntosMaxPosibles < pts9) {
    escenario = '🔴 Eliminado matemáticamente de los playoffs.';
  } else if (pts > pts7) {
    escenario = '🏆 Round 1 directo: dentro del top 7 de conferencia.';
  } else if (pts > pts9) {
    escenario = '🟡 Wild Card: puestos 8-9, jugás la ronda extra.';
  } else if (puntosParaWildCard <= fechas) {
    escenario = '🟠 Con 1-3 triunfos entrás al Wild Card.';
  } else {
    escenario = '⚠️ Necesitás racha ganadora para meterte a playoffs.';
  }

  return {
    puntosParaDirecto,
    puntosParaWildCard,
    puntosMaxPosibles,
    puntosEsperadosFinal,
    escenario,
  };
}
