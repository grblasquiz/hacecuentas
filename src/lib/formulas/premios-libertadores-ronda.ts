/**
 * Calculadora de premios de Copa Libertadores por ronda alcanzada.
 *
 * Valores referencia 2025 (USD), CONMEBOL:
 *   - Fase 1 previa: $400.000
 *   - Fase 2 previa: $500.000
 *   - Fase 3 previa: $600.000
 *   - Fase de grupos (clasificación): $3.000.000
 *   - Por victoria en fase de grupos: $330.000
 *   - Octavos de final: $1.250.000
 *   - Cuartos de final: $1.700.000
 *   - Semifinal: $2.300.000
 *   - Final (subcampeón): $7.000.000 (finalista)
 *   - Campeón: $23.000.000
 *
 * Los premios se ACUMULAN: un semifinalista cobra todos los bonus previos.
 */

export interface PremiosLibertadoresInputs {
  rondaAlcanzada: string; // 'fase1' | 'fase2' | 'fase3' | 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final' | 'campeon'
  victoriasEnGrupos: number; // 0-6
  jugoFasesPrevias: boolean; // ¿empezó desde fase 1 previa?
}

export interface PremiosLibertadoresOutputs {
  premioTotal: number;
  premioBase: number;
  bonusVictorias: number;
  detalleRondas: string;
  rondaLabel: string;
  _insight?: any;
  _chart?: any;
}

const PREMIOS_RONDA: Record<string, number> = {
  fase1: 400000,
  fase2: 500000,
  fase3: 600000,
  grupos: 3000000,
  octavos: 1250000,
  cuartos: 1700000,
  semifinal: 2300000,
  final: 7000000, // finalista derrotado
  campeon: 23000000,
};

const RONDAS_ORDEN = [
  'fase1',
  'fase2',
  'fase3',
  'grupos',
  'octavos',
  'cuartos',
  'semifinal',
  'final',
  'campeon',
];

const RONDA_LABELS: Record<string, string> = {
  fase1: 'Fase 1 previa',
  fase2: 'Fase 2 previa',
  fase3: 'Fase 3 previa',
  grupos: 'Fase de grupos',
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinal',
  final: 'Final (subcampeón)',
  campeon: 'Campeón',
};

export function premiosLibertadoresRonda(
  inputs: PremiosLibertadoresInputs
): PremiosLibertadoresOutputs {
  const ronda = String(inputs.rondaAlcanzada || 'grupos').toLowerCase();
  const victorias = Math.max(
    0,
    Math.min(6, Math.floor(Number(inputs.victoriasEnGrupos) || 0))
  );
  const previas = !!inputs.jugoFasesPrevias;

  const idxRonda = RONDAS_ORDEN.indexOf(ronda);
  if (idxRonda < 0) {
    throw new Error('Ronda no reconocida');
  }

  // Acumula todos los premios hasta la ronda alcanzada
  let premioBase = 0;
  const detallePartes: string[] = [];

  // Fases previas solo se suman si las jugó
  const startIdx = previas ? 0 : Math.max(3, idxRonda >= 3 ? 3 : idxRonda);

  for (let i = startIdx; i <= idxRonda; i++) {
    const r = RONDAS_ORDEN[i];
    // Los finalistas cobran $7M; el campeón cobra $23M (reemplaza el $7M, no se suma)
    if (r === 'final' && ronda === 'campeon') continue;
    const val = PREMIOS_RONDA[r];
    premioBase += val;
    detallePartes.push(`${RONDA_LABELS[r]}: $${val.toLocaleString('es-AR')}`);
  }

  const bonusVictorias = victorias * 330000;
  if (bonusVictorias > 0) {
    detallePartes.push(
      `Bonus ${victorias} victorias en grupos: $${bonusVictorias.toLocaleString('es-AR')}`
    );
  }

  const premioTotal = premioBase + bonusVictorias;
  const rondaLabel = RONDA_LABELS[ronda] || ronda;

  const tone = ronda === 'campeon' ? 'good' : 'neutral';
  const fmt = (n: number) => '$' + n.toLocaleString('es-AR');
  let insightText: string;
  if (ronda === 'campeon') {
    insightText = `Llegar a **${rondaLabel}** deja una bolsa de **US$ ${premioTotal.toLocaleString('es-AR')}** en premios CONMEBOL acumulados${bonusVictorias > 0 ? `, de los cuales ${fmt(bonusVictorias)} son bonus por las ${victorias} victorias en grupos` : ''}.`;
  } else {
    insightText = `Como **${rondaLabel}**, el club embolsa **US$ ${premioTotal.toLocaleString('es-AR')}** acumulando los premios de cada fase${bonusVictorias > 0 ? ` más ${fmt(bonusVictorias)} de bonus por ${victorias} victorias en grupos` : ''}. Avanzar de ronda suma fuerte.`;
  }

  const out: PremiosLibertadoresOutputs = {
    premioTotal,
    premioBase,
    bonusVictorias,
    detalleRondas: detallePartes.join(' + '),
    rondaLabel,
    _insight: {
      title: 'Premio acumulado',
      text: insightText,
      tone,
      icon: '🏆',
    },
  };

  // Donut sólo si hay bonus por victorias (si no, sería una sola porción)
  if (bonusVictorias > 0) {
    out._chart = {
      type: 'doughnut' as const,
      slices: [
        { label: 'Premios por rondas', value: premioBase },
        { label: `Bonus victorias (${victorias})`, value: bonusVictorias },
      ],
      prefix: '$',
      centerValue: '$' + premioTotal.toLocaleString('es-AR'),
      centerLabel: 'Premio total',
      ariaLabel: 'Composición del premio: premios fijos por ronda más bonus por victorias en fase de grupos',
    };
  }

  return out;
}
