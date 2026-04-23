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

  return {
    premioTotal: premioParticipacion + premioRondas + bonusVictoriasEmpates,
    premioParticipacion,
    premioRondas,
    bonusVictoriasEmpates,
    detalle: detalleBuild.join(' + '),
    rondaLabel: LABELS_MC[ronda] || ronda,
  };
}
