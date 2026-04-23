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

  return {
    premioSeleccionUsd: fila.usd,
    posicionLabel: fila.label,
    premioCuerpoTecnico: Math.round(premioCt),
    premioPlantel: Math.round(premioPlantel),
    porJugadorUsd: Math.round(porJugador),
    mensaje: `${fila.label}: USD ${fila.usd.toLocaleString('en-US')} a la selección. Por jugador (${convocados} convocados, CT ${Math.round(porcCt*100)}%): USD ${Math.round(porJugador).toLocaleString('en-US')}.`,
  };
}
