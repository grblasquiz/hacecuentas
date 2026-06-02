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
  _insight?: any;
  _chart?: any;
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

  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  let insightTitle = '';
  let insightText = '';
  let insightIcon = '⚽';
  if (puntosMaxPosibles < pts10) {
    tone = 'warn';
    insightTitle = 'Eliminado matemáticamente';
    insightText = `Aun ganando las **${fechas} fecha(s)** que quedan llegás a **${puntosMaxPosibles} pts**, por debajo de los **${pts10} pts** que pide el 10º. No alcanza ni para el Play-In.`;
    insightIcon = '🔴';
  } else if (pts > pts6) {
    tone = 'good';
    insightTitle = 'En zona de Liguilla directa';
    insightText = `Con **${pts} pts** estás arriba del 6º (**${pts6} pts**): hoy clasificás directo a cuartos sin pasar por el Play-In. Proyección a 17 fechas: **${puntosEsperadosFinal} pts**.`;
    insightIcon = '🏆';
  } else if (pts > pts10) {
    tone = 'neutral';
    insightTitle = 'En zona de Play-In';
    insightText = `Con **${pts} pts** estás entre el 7º y 10º. Te faltan **${puntosParaDirecto} pts** para meterte al top 6 y saltarte el Play-In.`;
    insightIcon = '🟡';
  } else if (puntosParaPlayIn <= fechas) {
    tone = 'neutral';
    insightTitle = 'Play-In al alcance';
    insightText = `Necesitás **${puntosParaPlayIn} pts** para entrar al Play-In y te quedan **${fechas} fecha(s)**: con 1 a 3 triunfos lo lográs.`;
    insightIcon = '🟠';
  } else {
    tone = 'warn';
    insightTitle = 'Dependés de una racha';
    insightText = `Te faltan **${puntosParaPlayIn} pts** para el Play-In pero sólo te quedan **${fechas} fecha(s)**: necesitás ganar casi todo y que los de arriba pinchen.`;
    insightIcon = '⚠️';
  }

  const _insight = { title: insightTitle, text: insightText, tone, icon: insightIcon };

  // Gauge: ubicación del equipo en las zonas de clasificación.
  const segMax1 = pts10; // tope zona eliminación / fuera del Play-In
  const segMax2 = pts6; // tope zona Play-In (7-10)
  const segMax3 = Math.max(pts, segMax2) + 6; // zona Liguilla directa, garantiza > marker
  const _chart = {
    type: 'scale',
    marker: pts,
    markerLabel: `${pts} pts`,
    min: 0,
    segments: [
      { nombre: 'Fuera (≤10º)', max: segMax1, color: '#ef4444', colorDark: '#b91c1c' },
      { nombre: 'Play-In (7-10)', max: segMax2, color: '#eab308', colorDark: '#a16207' },
      { nombre: 'Liguilla directa', max: segMax3, color: '#22c55e', colorDark: '#15803d' },
    ],
    ariaLabel: `Posición del equipo: ${pts} puntos. Play-In desde ${segMax1}, Liguilla directa desde ${segMax2}.`,
  };

  return {
    puntosParaDirecto,
    puntosParaPlayIn,
    puntosMaxPosibles,
    puntosEsperadosFinal,
    escenario,
    _insight,
    _chart,
  };
}
