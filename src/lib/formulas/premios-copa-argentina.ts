/**
 * Calculadora de premios de Copa Argentina por ronda alcanzada.
 *
 * Valores de referencia 2026 estimados (ARS, AFA):
 *  - 32avos de final: $30.000.000
 *  - 16avos de final: $50.000.000
 *  - 8vos de final: $80.000.000
 *  - Cuartos de final: $120.000.000
 *  - Semifinal: $200.000.000
 *  - Final (subcampeón): $350.000.000
 *  - Campeón: $600.000.000
 *  - Cupo Libertadores (campeón): equivalente ~$3M USD aparte
 *
 * Los premios se acumulan: un semifinalista cobra 32avos + 16avos + 8vos + cuartos + semi.
 */

export interface PremiosCopaArgentinaInputs {
  rondaAlcanzada: string;
  entroEnRonda: string; // algunos equipos entran directo a 16avos
}

export interface PremiosCopaArgentinaOutputs {
  premioTotal: number;
  detalle: string;
  rondaLabel: string;
  ganoCupoLibertadores: boolean;
}

const PREMIOS_CA: Record<string, number> = {
  t32: 30000000,
  t16: 50000000,
  t8: 80000000,
  cuartos: 120000000,
  semifinal: 200000000,
  final: 350000000,
  campeon: 600000000,
};

const ORDEN_CA = ['t32', 't16', 't8', 'cuartos', 'semifinal', 'final', 'campeon'];
const LABELS_CA: Record<string, string> = {
  t32: '32avos de final',
  t16: '16avos de final',
  t8: '8vos de final',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final (subcampeón)',
  campeon: 'Campeón',
};

export function premiosCopaArgentina(
  inputs: PremiosCopaArgentinaInputs
): PremiosCopaArgentinaOutputs {
  const ronda = String(inputs.rondaAlcanzada || 't32').toLowerCase();
  const entro = String(inputs.entroEnRonda || 't32').toLowerCase();

  const idxRonda = ORDEN_CA.indexOf(ronda);
  const idxEntro = Math.max(0, ORDEN_CA.indexOf(entro));
  if (idxRonda < 0) throw new Error('Ronda no reconocida');

  let premioTotal = 0;
  const detalleBuild: string[] = [];
  for (let i = idxEntro; i <= idxRonda; i++) {
    const r = ORDEN_CA[i];
    if (r === 'final' && ronda === 'campeon') continue;
    premioTotal += PREMIOS_CA[r];
    detalleBuild.push(
      `${LABELS_CA[r]}: $${PREMIOS_CA[r].toLocaleString('es-AR')}`
    );
  }

  return {
    premioTotal,
    detalle: detalleBuild.join(' + '),
    rondaLabel: LABELS_CA[ronda] || ronda,
    ganoCupoLibertadores: ronda === 'campeon',
  };
}
