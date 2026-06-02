/**
 * Calculadora de premios de UEFA Champions League por ronda (formato 2024/25+).
 *
 * Valores referencia UEFA 2024/25 (EUR):
 *  - Participación en fase de liga (36 equipos): €18.620.000
 *  - Por victoria en fase de liga: €2.100.000
 *  - Por empate en fase de liga: €700.000
 *  - Por cada puesto mejor en la tabla de liga: ~€275.000 (bonus performance)
 *  - Bonus por clasificar directo a octavos (top 8): €2.000.000
 *  - Playoff de acceso a octavos (9-16 / 17-24): €1.000.000
 *  - Octavos: €11.000.000
 *  - Cuartos: €12.500.000
 *  - Semifinal: €15.500.000
 *  - Final (subcampeón): €18.500.000
 *  - Campeón: €25.000.000
 *
 * Además existe el "market pool" variable por país (TV), que esta calculadora
 * no estima (puede llegar a duplicar el premio para clubes de ligas grandes).
 */

export interface PremiosChampionsInputs {
  rondaAlcanzada: string; // 'liga' | 'playoff' | 'octavos' | 'cuartos' | 'semifinal' | 'final' | 'campeon'
  victoriasEnLiga: number; // 0-8
  empatesEnLiga: number; // 0-8
  posicionEnLiga: number; // 1-36 (1 = mejor)
}

export interface PremiosChampionsOutputs {
  premioTotal: number;
  premioParticipacion: number;
  premioRonda: number;
  bonusVictoriasEmpates: number;
  bonusPosicion: number;
  detalle: string;
  rondaLabel: string;
  _insight?: any;
  _chart?: any;
}

const PREMIOS_CL: Record<string, number> = {
  liga: 18620000,
  playoff: 1000000,
  octavos: 11000000,
  cuartos: 12500000,
  semifinal: 15500000,
  final: 18500000,
  campeon: 25000000,
};

const RONDAS_CL = [
  'liga',
  'playoff',
  'octavos',
  'cuartos',
  'semifinal',
  'final',
  'campeon',
];

const LABELS_CL: Record<string, string> = {
  liga: 'Fase de liga (36 equipos)',
  playoff: 'Playoff de acceso a octavos',
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final (subcampeón)',
  campeon: 'Campeón',
};

export function premiosChampionsLeagueRonda(
  inputs: PremiosChampionsInputs
): PremiosChampionsOutputs {
  const ronda = String(inputs.rondaAlcanzada || 'liga').toLowerCase();
  const v = Math.max(0, Math.min(8, Math.floor(Number(inputs.victoriasEnLiga) || 0)));
  const e = Math.max(0, Math.min(8, Math.floor(Number(inputs.empatesEnLiga) || 0)));
  const pos = Math.max(1, Math.min(36, Math.floor(Number(inputs.posicionEnLiga) || 36)));

  const idx = RONDAS_CL.indexOf(ronda);
  if (idx < 0) throw new Error('Ronda no reconocida');

  const premioParticipacion = PREMIOS_CL.liga;
  const bonusVictoriasEmpates = v * 2100000 + e * 700000;
  // Bonus posición: por puesto mejor que el último (36), UEFA reparte ~275k por puesto
  const bonusPosicion = (36 - pos) * 275000;

  let premioRonda = 0;
  const detalleBuild: string[] = [
    `Fase de liga: €${premioParticipacion.toLocaleString('es-AR')}`,
  ];

  // Top 8 en liga = directo a octavos con bonus
  if (idx >= 2) {
    // Si llegó a octavos o más, sumamos premios de rondas KO
    for (let i = 1; i <= idx; i++) {
      if (i === 1 && pos <= 8) continue; // top 8 no juega playoff
      const r = RONDAS_CL[i];
      if (r === 'final' && ronda === 'campeon') continue;
      premioRonda += PREMIOS_CL[r];
      detalleBuild.push(`${LABELS_CL[r]}: €${PREMIOS_CL[r].toLocaleString('es-AR')}`);
    }
  } else if (idx === 1) {
    premioRonda += PREMIOS_CL.playoff;
    detalleBuild.push(`Playoff: €${PREMIOS_CL.playoff.toLocaleString('es-AR')}`);
  }

  if (bonusVictoriasEmpates > 0) {
    detalleBuild.push(
      `Bonus ${v}V+${e}E: €${bonusVictoriasEmpates.toLocaleString('es-AR')}`
    );
  }
  if (bonusPosicion > 0) {
    detalleBuild.push(
      `Bonus posición ${pos}º en liga: €${bonusPosicion.toLocaleString('es-AR')}`
    );
  }

  const premioTotal =
    premioParticipacion + premioRonda + bonusVictoriasEmpates + bonusPosicion;

  const fmtEur = (n: number) => '€' + n.toLocaleString('es-AR');
  const esCampeon = ronda === 'campeon';
  const tonoCL: 'good' | 'warn' | 'neutral' =
    idx >= 4 ? 'good' : idx <= 0 ? 'warn' : 'neutral';
  const partePct = Math.round((premioParticipacion / premioTotal) * 100);
  let textoCL: string;
  if (esCampeon) {
    textoCL = `Ganar la Orejona deja **${fmtEur(premioTotal)}** en premios deportivos UEFA. A eso se suma el *market pool* (TV) por país, que para clubes de ligas grandes puede casi duplicar la cifra.`;
  } else if (idx <= 0) {
    textoCL = `Quedando en fase de liga el premio es **${fmtEur(premioTotal)}**: la participación fija (${fmtEur(premioParticipacion)}) es **${partePct}%** del total. Avanzar en el KO es donde está la plata grande.`;
  } else {
    textoCL = `Llegar a ${LABELS_CL[ronda]} suma **${fmtEur(premioTotal)}** en premios UEFA. Falta sumar el *market pool* (TV) por país, que esta cuenta no estima.`;
  }
  const _insight = {
    title: 'Cuánto embolsa el club',
    text: textoCL,
    tone: tonoCL,
    icon: '🏆',
  };

  const slicesCL: Array<{ label: string; value: number }> = [
    { label: 'Participación fase de liga', value: premioParticipacion },
  ];
  if (premioRonda > 0) slicesCL.push({ label: 'Premios por ronda KO', value: premioRonda });
  if (bonusVictoriasEmpates > 0)
    slicesCL.push({ label: 'Bonus victorias/empates', value: bonusVictoriasEmpates });
  if (bonusPosicion > 0)
    slicesCL.push({ label: 'Bonus posición en liga', value: bonusPosicion });

  const _chart = {
    type: 'doughnut' as const,
    slices: slicesCL,
    prefix: '€',
    centerValue: fmtEur(premioTotal),
    centerLabel: 'Premio UEFA',
    ariaLabel: 'Composición del premio de Champions: participación, rondas y bonus',
  };

  return {
    premioTotal,
    premioParticipacion,
    premioRonda,
    bonusVictoriasEmpates,
    bonusPosicion,
    detalle: detalleBuild.join(' + '),
    rondaLabel: LABELS_CL[ronda] || ronda,
    _insight,
    _chart,
  };
}
