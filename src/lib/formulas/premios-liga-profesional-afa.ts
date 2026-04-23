/** Premios Liga Profesional AFA — partidos ganados + campeón del torneo */
export interface Inputs {
  partidosGanados: number;
  partidosEmpatados: number;
  premioPorVictoria?: number;
  premioPorEmpate?: number;
  campeon?: boolean;
  subcampeon?: boolean;
  jugadoresPlantel?: number;
}
export interface Outputs {
  premiosVictorias: number;
  premiosEmpates: number;
  premioCampeon: number;
  totalBolsa: number;
  porJugador: number;
  detalle: string;
  mensaje: string;
}

// Referencia AFA 2026 (ARS)
const PREMIO_CAMPEON_LPF = 1_000_000_000; // $1.000M al campeón
const PREMIO_SUBCAMPEON_LPF = 350_000_000;
const VICTORIA_DEFAULT = 25_000_000;  // pactado con el plantel por partido ganado
const EMPATE_DEFAULT = 8_000_000;
const PLANTEL_DEFAULT = 30;

export function premiosLigaProfesionalAfa(i: Inputs): Outputs {
  const ganados = Math.max(0, Number(i.partidosGanados) || 0);
  const empatados = Math.max(0, Number(i.partidosEmpatados) || 0);
  const premioVic = i.premioPorVictoria !== undefined ? Number(i.premioPorVictoria) : VICTORIA_DEFAULT;
  const premioEmp = i.premioPorEmpate !== undefined ? Number(i.premioPorEmpate) : EMPATE_DEFAULT;
  const plantel = Math.max(1, Number(i.jugadoresPlantel) || PLANTEL_DEFAULT);

  const premiosVictorias = ganados * premioVic;
  const premiosEmpates = empatados * premioEmp;
  let premioCampeon = 0;
  let detalle = `${ganados} victorias × $${premioVic.toLocaleString('es-AR')} + ${empatados} empates × $${premioEmp.toLocaleString('es-AR')}.`;
  if (i.campeon) {
    premioCampeon = PREMIO_CAMPEON_LPF;
    detalle += ` CAMPEÓN del torneo: +$${PREMIO_CAMPEON_LPF.toLocaleString('es-AR')}.`;
  } else if (i.subcampeon) {
    premioCampeon = PREMIO_SUBCAMPEON_LPF;
    detalle += ` Subcampeón: +$${PREMIO_SUBCAMPEON_LPF.toLocaleString('es-AR')}.`;
  }

  const totalBolsa = premiosVictorias + premiosEmpates + premioCampeon;
  const porJugador = totalBolsa / plantel;

  return {
    premiosVictorias: Math.round(premiosVictorias),
    premiosEmpates: Math.round(premiosEmpates),
    premioCampeon: Math.round(premioCampeon),
    totalBolsa: Math.round(totalBolsa),
    porJugador: Math.round(porJugador),
    detalle,
    mensaje: `Bolsa total: $${Math.round(totalBolsa).toLocaleString('es-AR')}. Por jugador (plantel ${plantel}): $${Math.round(porJugador).toLocaleString('es-AR')}.`,
  };
}
