/** Premios Copa América 2024 — CONMEBOL */
export interface Inputs {
  posicion: 'campeon' | 'subcampeon' | 'semifinal' | 'cuartos' | 'grupos';
  jugadoresConvocados?: number;
  cuerpoTecnicoPorcentaje?: number; // % del premio que va al CT
  participaAfa?: boolean; // si aplica bonus selección Argentina
}
export interface Outputs {
  premioSeleccionUsd: number;
  posicionLabel: string;
  premioCuerpoTecnico: number;
  premioPlantel: number;
  porJugadorUsd: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

// Copa América 2024 — USD
const PREMIOS: Record<string, { label: string; usd: number }> = {
  campeon:     { label: 'Campeón',             usd: 16_000_000 },
  subcampeon:  { label: 'Subcampeón',          usd:  7_000_000 },
  semifinal:   { label: 'Semifinalista',       usd:  6_000_000 },
  cuartos:     { label: 'Cuartos de final',    usd:  4_500_000 },
  grupos:      { label: 'Fase de grupos (eliminada)', usd: 2_000_000 },
};

export function premiosCopaAmerica(i: Inputs): Outputs {
  const fila = PREMIOS[i.posicion];
  if (!fila) throw new Error('Posición inválida. Usá campeon, subcampeon, semifinal, cuartos o grupos.');
  const convocados = Math.max(1, Number(i.jugadoresConvocados) || 26);
  const porcCt = Math.min(0.5, Math.max(0, (Number(i.cuerpoTecnicoPorcentaje) || 10) / 100));

  const premioCt = fila.usd * porcCt;
  const premioPlantel = fila.usd - premioCt;
  const porJugador = premioPlantel / convocados;

  const fmtUsd = (n: number) => 'USD ' + Math.round(n).toLocaleString('en-US');
  const tonoCA: 'good' | 'warn' | 'neutral' =
    i.posicion === 'campeon' ? 'good' : i.posicion === 'grupos' ? 'warn' : 'neutral';
  let textoCA: string;
  if (i.posicion === 'campeon') {
    textoCA = `Salir campeón reparte **${fmtUsd(fila.usd)}** a la selección. Tras el ${Math.round(porcCt * 100)}% del cuerpo técnico, cada uno de los ${convocados} jugadores se lleva **${fmtUsd(porJugador)}**.`;
  } else if (i.posicion === 'grupos') {
    textoCA = `Eliminada en grupos, la bolsa es **${fmtUsd(fila.usd)}** — el piso del torneo. Por jugador (${convocados}, CT ${Math.round(porcCt * 100)}%) quedan **${fmtUsd(porJugador)}**.`;
  } else {
    textoCA = `Como ${fila.label.toLowerCase()} la selección embolsa **${fmtUsd(fila.usd)}**. Cada uno de los ${convocados} jugadores recibe **${fmtUsd(porJugador)}** tras el ${Math.round(porcCt * 100)}% del CT.`;
  }
  const _insight = {
    title: 'Cómo se reparte',
    text: textoCA,
    tone: tonoCA,
    icon: '🏆',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Para el plantel', value: Math.round(premioPlantel) },
      { label: 'Cuerpo técnico', value: Math.round(premioCt) },
    ],
    prefix: 'USD ',
    centerValue: fmtUsd(fila.usd),
    centerLabel: 'Premio total',
    ariaLabel: 'Reparto del premio entre plantel y cuerpo técnico',
  };

  return {
    premioSeleccionUsd: fila.usd,
    posicionLabel: fila.label,
    premioCuerpoTecnico: Math.round(premioCt),
    premioPlantel: Math.round(premioPlantel),
    porJugadorUsd: Math.round(porJugador),
    mensaje: `${fila.label}: USD ${fila.usd.toLocaleString('en-US')} a la selección. Por jugador (${convocados} convocados, CT ${Math.round(porcCt*100)}%): USD ${Math.round(porJugador).toLocaleString('en-US')}.`,
    _insight,
    _chart,
  };
}
