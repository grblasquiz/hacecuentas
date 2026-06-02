/**
 * Calculadora de premios del Mundial de Clubes FIFA 2025/2026 (nuevo formato 32 equipos).
 *
 * Pool total FIFA anunciado: $1.000 millones USD.
 *  - Participación (32 equipos, varía por confederación): $3.58M a $38.19M
 *    (clubes UEFA cobran más por reparto TV/mercado)
 *  - Por victoria en fase de grupos: $2.000.000
 *  - Por empate en fase de grupos: $1.000.000
 *  - Clasificación a 16avos: $7.500.000
 *  - Cuartos de final: $13.125.000
 *  - Semifinal: $21.000.000
 *  - Final (subcampeón): $30.000.000
 *  - Campeón: $40.000.000
 *
 * Todo es ACUMULATIVO. Un campeón UEFA puede cobrar ~$125M total.
 */

export interface PremiosMundialClubesInputs {
  confederacion: string; // 'uefa' | 'conmebol' | 'concacaf' | 'afc' | 'caf' | 'ofc'
  rondaAlcanzada: string;
  victoriasEnGrupos: number;
  empatesEnGrupos: number;
}

export interface PremiosMundialClubesOutputs {
  premioTotal: number;
  premioParticipacion: number;
  premioRondas: number;
  bonusVictoriasEmpates: number;
  detalle: string;
  rondaLabel: string;
  _insight?: any;
  _chart?: any;
}

const PART_POR_CONF: Record<string, number> = {
  uefa: 20000000, // promedio; varía 12-38M
  conmebol: 15000000,
  concacaf: 9550000,
  afc: 9550000,
  caf: 9550000,
  ofc: 3580000,
};

const PREMIOS_MC: Record<string, number> = {
  grupos: 0, // ya incluido en participación
  octavos: 7500000,
  cuartos: 13125000,
  semifinal: 21000000,
  final: 30000000,
  campeon: 40000000,
};

const ORDEN_MC = ['grupos', 'octavos', 'cuartos', 'semifinal', 'final', 'campeon'];
const LABELS_MC: Record<string, string> = {
  grupos: 'Fase de grupos',
  octavos: '16avos / Octavos',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final (subcampeón)',
  campeon: 'Campeón',
};

export function premiosMundialClubesFifa(
  inputs: PremiosMundialClubesInputs
): PremiosMundialClubesOutputs {
  const conf = String(inputs.confederacion || 'uefa').toLowerCase();
  const ronda = String(inputs.rondaAlcanzada || 'grupos').toLowerCase();
  const v = Math.max(0, Math.min(3, Math.floor(Number(inputs.victoriasEnGrupos) || 0)));
  const e = Math.max(0, Math.min(3, Math.floor(Number(inputs.empatesEnGrupos) || 0)));

  const premioParticipacion = PART_POR_CONF[conf] ?? 9550000;
  const idx = ORDEN_MC.indexOf(ronda);
  if (idx < 0) throw new Error('Ronda no reconocida');

  let premioRondas = 0;
  const detalleBuild: string[] = [
    `Participación (${conf.toUpperCase()}): $${premioParticipacion.toLocaleString('es-AR')}`,
  ];
  for (let i = 1; i <= idx; i++) {
    const r = ORDEN_MC[i];
    if (r === 'final' && ronda === 'campeon') continue;
    premioRondas += PREMIOS_MC[r];
    detalleBuild.push(`${LABELS_MC[r]}: $${PREMIOS_MC[r].toLocaleString('es-AR')}`);
  }

  const bonusVictoriasEmpates = v * 2000000 + e * 1000000;
  if (bonusVictoriasEmpates > 0) {
    detalleBuild.push(
      `Bonus ${v}V+${e}E grupos: $${bonusVictoriasEmpates.toLocaleString('es-AR')}`
    );
  }

  const premioTotal = premioParticipacion + premioRondas + bonusVictoriasEmpates;
  const fmtUSD = (n: number) => '$' + n.toLocaleString('es-AR');
  const rondaTxt = LABELS_MC[ronda] || ronda;

  const slices = [
    { label: 'Participación', value: premioParticipacion },
  ];
  if (premioRondas > 0) slices.push({ label: 'Avance de rondas', value: premioRondas });
  if (bonusVictoriasEmpates > 0) slices.push({ label: 'Bonus V/E grupos', value: bonusVictoriasEmpates });

  const _chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: fmtUSD(premioTotal),
    centerLabel: 'Premio total',
    ariaLabel: `Premio total ${fmtUSD(premioTotal)}: participación ${fmtUSD(premioParticipacion)}, rondas ${fmtUSD(premioRondas)}, bonus ${fmtUSD(bonusVictoriasEmpates)}.`,
  };

  const pctFijo = premioTotal > 0 ? Math.round((premioParticipacion / premioTotal) * 100) : 0;
  const _insight = {
    title: 'Cuánto se lleva el club',
    text: ronda === 'campeon'
      ? `Llegar a **campeón** desde ${conf.toUpperCase()} embolsa **${fmtUSD(premioTotal)}**, de los cuales **${fmtUSD(premioRondas)}** son solo por avanzar de ronda. El premio fijo por participar pesa apenas el **${pctFijo}%** del total.`
      : `Quedando en **${rondaTxt.toLowerCase()}**, un club de ${conf.toUpperCase()} junta **${fmtUSD(premioTotal)}**. El fijo por participar (**${fmtUSD(premioParticipacion)}**) es el **${pctFijo}%**; el resto se gana avanzando y sumando puntos en grupos.`,
    tone: 'good' as const,
    icon: '🏆',
  };

  return {
    premioTotal,
    premioParticipacion,
    premioRondas,
    bonusVictoriasEmpates,
    detalle: detalleBuild.join(' + '),
    rondaLabel: rondaTxt,
    _chart,
    _insight,
  };
}
