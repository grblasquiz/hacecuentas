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
  _insight?: any;
  _chart?: any;
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

  const rVic = Math.round(premiosVictorias);
  const rEmp = Math.round(premiosEmpates);
  const rCamp = Math.round(premioCampeon);
  const rTotal = Math.round(totalBolsa);
  const rPorJug = Math.round(porJugador);

  const tituloPremio = i.campeon ? ' como campeón' : i.subcampeon ? ' como subcampeón' : '';
  const out: Outputs = {
    premiosVictorias: rVic,
    premiosEmpates: rEmp,
    premioCampeon: rCamp,
    totalBolsa: rTotal,
    porJugador: rPorJug,
    detalle,
    mensaje: `Bolsa total: $${rTotal.toLocaleString('es-AR')}. Por jugador (plantel ${plantel}): $${rPorJug.toLocaleString('es-AR')}.`,
    _insight: {
      title: 'Lo que cobra el plantel',
      text: `Entre premios por resultados${i.campeon || i.subcampeon ? ' y el bono de título' : ''}, la bolsa suma **$${rTotal.toLocaleString('es-AR')}**${tituloPremio}: unos **$${rPorJug.toLocaleString('es-AR')} por jugador** repartiendo entre ${plantel}.`,
      tone: 'good',
      icon: '⚽',
    },
  };

  // Donut sólo si la bolsa se compone de 2+ conceptos
  const slices = [
    { label: 'Premios por victorias', value: rVic },
    { label: 'Premios por empates', value: rEmp },
    { label: i.campeon ? 'Bono campeón' : 'Bono subcampeón', value: rCamp },
  ].filter((s) => s.value > 0);
  if (slices.length >= 2) {
    out._chart = {
      type: 'doughnut' as const,
      slices,
      prefix: '$',
      centerValue: '$' + rTotal.toLocaleString('es-AR'),
      centerLabel: 'Bolsa total',
      ariaLabel: 'Composición de la bolsa de premios: victorias, empates y bono de título',
    };
  }

  return out;
}
