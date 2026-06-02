/** Mundial 2026: tarjetas amarillas, suspensión y reset por fase. */
export interface Inputs {
  amarillasAcumuladas: number;
  rojaDirecta: string; // 'no' | 'si'
  dobleAmarilla: string; // 'no' | 'si'
  faseActual: string; // 'grupos1' | 'grupos2' | 'grupos3' | 'dieciseisavos' | 'octavos' | 'cuartos' | 'semis' | 'final'
}

export interface Outputs {
  suspension: string;
  partidosSuspendido: number;
  proximoPartidoElegible: string;
  resetEnFase: string;
  resumen: string;
  _insight?: any;
}

const FASES = [
  'grupos1', 'grupos2', 'grupos3',
  'dieciseisavos', 'octavos', 'cuartos', 'semis', 'final',
];

const FASE_LABEL: Record<string, string> = {
  grupos1: 'Fecha 1 fase de grupos',
  grupos2: 'Fecha 2 fase de grupos',
  grupos3: 'Fecha 3 fase de grupos',
  dieciseisavos: 'Dieciseisavos de final',
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semis: 'Semifinal',
  final: 'Final / 3er puesto',
};

export function mundial2026TarjetasSuspension(i: Inputs): Outputs {
  const am = Math.max(0, Math.floor(Number(i.amarillasAcumuladas || 0)));
  const roja = String(i.rojaDirecta || 'no').toLowerCase() === 'si';
  const doble = String(i.dobleAmarilla || 'no').toLowerCase() === 'si';
  const fase = String(i.faseActual || 'grupos1').toLowerCase();

  const idx = FASES.indexOf(fase);
  if (idx < 0) throw new Error('Fase inválida.');

  let suspendido = 0;
  let motivo = '';

  // Roja directa: 1 partido mínimo (puede ser más por comité disciplinario).
  if (roja) {
    suspendido = 1;
    motivo = 'Roja directa (mínimo 1 partido, comité puede extender).';
  } else if (doble) {
    suspendido = 1;
    motivo = 'Doble amarilla en el mismo partido (1 partido).';
  } else if (am >= 2 && idx <= 4) {
    // 2 amarillas acumuladas en fase grupos a cuartos = suspensión.
    suspendido = 1;
    motivo = 'Acumuló 2 amarillas en partidos distintos.';
  }

  // Reset oficial FIFA: las amarillas se borran después de cuartos de final
  // (es decir, antes de semifinales arrancás limpio). En 2026, FIFA confirmó
  // el mismo criterio que en Mundiales anteriores.
  let resetEnFase = '';
  if (idx <= 4) {
    resetEnFase = 'Amarillas se resetean ANTES de semifinales (no llegás con tarjetas a semis).';
  } else {
    resetEnFase = 'Reset ya aplicado: estás partiendo de cero en esta fase.';
  }

  // Partido próximo en que volvés a jugar:
  let proxFase = '';
  if (suspendido === 0) {
    proxFase = `Jugás ${idx + 1 < FASES.length ? FASE_LABEL[FASES[idx + 1]] : 'final si avanzás'}.`;
  } else {
    const sigIdx = idx + 1;
    if (sigIdx >= FASES.length) {
      proxFase = 'Te perdés la final si avanzaste. Próximo partido oficial: amistosos post-Mundial.';
    } else {
      proxFase = `Te perdés ${FASE_LABEL[FASES[sigIdx]]}. Volvés ${sigIdx + 1 < FASES.length ? FASE_LABEL[FASES[sigIdx + 1]] : 'a la final si tu equipo avanza'}.`;
    }
  }

  const suspensionTxt = suspendido > 0
    ? `**SUSPENDIDO ${suspendido} partido.** ${motivo}`
    : `**NO suspendido.** Podés jugar el próximo partido.`;

  // Riesgo: 1 amarilla acumulada en fase grupos→cuartos significa que una más suspende.
  const alFilo = suspendido === 0 && am === 1 && idx <= 4;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (suspendido > 0) {
    insightTone = 'warn';
    insightText = `Estás **suspendido ${suspendido} partido**: ${motivo} ${proxFase}`;
  } else if (alFilo) {
    insightTone = 'warn';
    insightText = `Con **1 amarilla** acumulada estás al filo: **otra amarilla más y quedás suspendido**. Las tarjetas recién se borran antes de semifinales.`;
  } else {
    insightTone = 'good';
    insightText = `No estás suspendido: jugás el próximo partido. ${resetEnFase}`;
  }

  return {
    suspension: suspensionTxt,
    partidosSuspendido: suspendido,
    proximoPartidoElegible: proxFase,
    resetEnFase,
    resumen: `Con ${am} amarilla(s)${roja ? ' + roja directa' : ''}${doble ? ' + doble amarilla' : ''} en ${FASE_LABEL[fase]}: ${suspensionTxt} ${proxFase} ${resetEnFase}`,
    _insight: {
      title: 'Estado disciplinario',
      text: insightText,
      tone: insightTone,
      icon: suspendido > 0 ? '🟥' : '🟨',
    },
  };
}
