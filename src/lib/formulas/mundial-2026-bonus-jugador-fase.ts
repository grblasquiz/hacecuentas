/** Mundial 2026: bonus por jugador individual según selección, fase superada y partidos como titular. */
export interface Inputs {
  seleccion: string;
  faseMaxima: string;
  partidosTitular: number;
}

export interface Outputs {
  bonusFifaReparto: number;
  bonusFederacion: number;
  totalEstimado: number;
  comparacionSueldo: string;
  resumen: string;
}

// Premio FIFA por fase para el equipo (USD), estimado Mundial 2026 (~USD 1.000 M total).
const PREMIO_FIFA_FASE: Record<string, number> = {
  grupos: 9_000_000,
  dieciseisavos: 13_000_000,
  octavos: 17_000_000,
  cuartos: 19_000_000,
  semis: 27_000_000, // 3er o 4to puesto promedio
  subcampeon: 30_000_000,
  campeon: 50_000_000,
};

const FASE_LABEL: Record<string, string> = {
  grupos: 'Fase de grupos (eliminado)',
  dieciseisavos: 'Dieciseisavos de final',
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semis: 'Semifinal (3er/4to puesto)',
  subcampeon: 'Subcampeón',
  campeon: 'CAMPEÓN',
};

// Porcentaje del premio FIFA que cada federación reparte al plantel.
const REPARTO: Record<string, { pct: number; label: string }> = {
  argentina: { pct: 0.65, label: 'Argentina (AFA reparte ~65%)' },
  brasil: { pct: 0.50, label: 'Brasil (CBF reparte ~50%)' },
  espana: { pct: 0.55, label: 'España (RFEF reparte ~55%)' },
  francia: { pct: 0.50, label: 'Francia (FFF reparte ~50%)' },
  inglaterra: { pct: 0.50, label: 'Inglaterra (FA reparte ~50%)' },
  otra: { pct: 0.45, label: 'Otra selección (reparto promedio ~45%)' },
};

const PLANTEL_SIZE = 26;

export function mundial2026BonusJugadorFase(i: Inputs): Outputs {
  const sel = String(i.seleccion || 'argentina').toLowerCase();
  const fase = String(i.faseMaxima || 'grupos').toLowerCase();
  const titulares = Math.max(0, Math.min(8, Math.floor(Number(i.partidosTitular || 0))));

  const premioEquipo = PREMIO_FIFA_FASE[fase];
  if (!premioEquipo) throw new Error('Fase inválida.');

  const reparto = REPARTO[sel];
  if (!reparto) throw new Error('Selección inválida.');

  // Bonus FIFA repartido por jugador.
  const bolsaPlantel = premioEquipo * reparto.pct;
  const bonusFifaReparto = Math.round(bolsaPlantel / PLANTEL_SIZE);

  // Bonus federación: ~USD 15k por partido titular + ~USD 30k concentración base.
  const bonusFederacion = 30_000 + (titulares * 15_000);

  const totalEstimado = bonusFifaReparto + bonusFederacion;

  // Comparación con sueldo top (~USD 30-80M/año en jugadores top → ~USD 3-7M/mes).
  // Tomamos USD 4M/mes promedio top mundial.
  const sueldoMensualTop = 4_000_000;
  const mesesEquivalentes = totalEstimado / sueldoMensualTop;

  let comparacionSueldo = '';
  if (mesesEquivalentes < 0.1) {
    comparacionSueldo = `Equivale a ~${Math.round(mesesEquivalentes * 30)} días de sueldo de un jugador top. Para un jugador del plantel sin contrato millonario, esto puede ser **varios meses de sueldo**.`;
  } else if (mesesEquivalentes < 1) {
    comparacionSueldo = `Equivale a ~${Math.round(mesesEquivalentes * 4)} semanas de sueldo de un jugador top. Para un jugador medio del plantel, esto es **6-12 meses de sueldo**.`;
  } else {
    comparacionSueldo = `Equivale a ~${mesesEquivalentes.toFixed(1)} meses de sueldo de un jugador top mundial. Para jugadores menos conocidos del plantel, esto puede significar **1-3 años de sueldo de club**.`;
  }

  const resumen = `Jugador de **${reparto.label}** que llega a **${FASE_LABEL[fase]}** con **${titulares}** partido(s) como titular: cobra aprox **USD ${bonusFifaReparto.toLocaleString('en-US')}** del reparto FIFA + **USD ${bonusFederacion.toLocaleString('en-US')}** de bonus federación = **USD ${totalEstimado.toLocaleString('en-US')}** estimado total. ${comparacionSueldo}`;

  return {
    bonusFifaReparto,
    bonusFederacion,
    totalEstimado,
    comparacionSueldo,
    resumen,
  };
}
