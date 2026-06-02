/** Mundial 2026: cálculo de puntos y probabilidad de clasificar a octavos */
export interface Inputs {
  victorias: number;
  empates: number;
  derrotas: number;
  resultadoFinal: string; // 'pendiente' | 'victoria' | 'empate' | 'derrota'
}

export interface Outputs {
  puntosActuales: number;
  puntosProyectados: string;
  probabilidadClasificar: string;
  escenarios: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

function etiquetaProbabilidad(pts: number): string {
  if (pts >= 7) return 'Clasificación asegurada como 1er del grupo (>99%)';
  if (pts >= 6) return 'Clasificación casi segura como 1er o 2do (~98%)';
  if (pts >= 5) return 'Muy alta probabilidad de pasar como 2do del grupo (~95%)';
  if (pts >= 4) return 'Alta probabilidad — pasás 2do o mejor tercero (~85-90%)';
  if (pts >= 3) return 'Probabilidad media — como mejor tercero (~50-60%)';
  if (pts >= 2) return 'Baja probabilidad — solo si otros terceros también empataron (~15-20%)';
  if (pts >= 1) return 'Muy baja probabilidad — solo milagro matemático (~2-5%)';
  return 'Eliminado matemáticamente';
}

export function mundial2026PuntosOctavos(i: Inputs): Outputs {
  const v = Number(i.victorias || 0);
  const e = Number(i.empates || 0);
  const d = Number(i.derrotas || 0);
  const partidosJugados = v + e + d;
  if (partidosJugados > 3) throw new Error('Fase de grupos es de 3 partidos máximo.');
  if (v < 0 || e < 0 || d < 0) throw new Error('Los resultados no pueden ser negativos.');

  const puntosActuales = v * 3 + e;
  const partidosRestantes = 3 - partidosJugados;
  const res = String(i.resultadoFinal || 'pendiente').toLowerCase();

  let proyectados = puntosActuales;
  let proyectadosText = `${puntosActuales} pts`;
  let escenarios = '';

  if (partidosRestantes > 0) {
    const vGain = partidosRestantes * 3;
    const eGain = partidosRestantes * 1;
    const dGain = 0;
    const maxPts = puntosActuales + vGain;
    const minPts = puntosActuales + dGain;

    if (res === 'victoria') {
      proyectados = puntosActuales + vGain;
      proyectadosText = `${proyectados} pts (si ganás los ${partidosRestantes} restantes)`;
    } else if (res === 'empate') {
      proyectados = puntosActuales + eGain;
      proyectadosText = `${proyectados} pts (si empatás los ${partidosRestantes} restantes)`;
    } else if (res === 'derrota') {
      proyectados = puntosActuales + dGain;
      proyectadosText = `${proyectados} pts (si perdés los ${partidosRestantes} restantes)`;
    } else {
      proyectados = puntosActuales;
      proyectadosText = `Entre ${minPts} y ${maxPts} pts (según resultado${partidosRestantes > 1 ? 's' : ''} restante${partidosRestantes > 1 ? 's' : ''})`;
    }

    escenarios = `**Último partido** — si ganás: ${puntosActuales + 3} pts (${etiquetaProbabilidad(puntosActuales + 3).split(' (')[0]}). Si empatás: ${puntosActuales + 1} pts (${etiquetaProbabilidad(puntosActuales + 1).split(' (')[0]}). Si perdés: ${puntosActuales} pts (${etiquetaProbabilidad(puntosActuales).split(' (')[0]}).`;
  } else {
    escenarios = 'Fase de grupos completa — los puntos actuales son los finales.';
  }

  const prob = etiquetaProbabilidad(proyectados);

  let insightTone: 'good' | 'warn' | 'neutral';
  if (proyectados >= 5) insightTone = 'good';
  else if (proyectados >= 3) insightTone = 'neutral';
  else insightTone = 'warn';

  const probCorto = prob.split(' (')[0];
  const insightText = partidosRestantes > 0
    ? `Hoy sumás **${puntosActuales} pts** y proyectás **${proyectados} pts** en este escenario: ${probCorto}. Quedan ${partidosRestantes} partido${partidosRestantes > 1 ? 's' : ''} por jugar.`
    : `Cerraste la fase de grupos con **${puntosActuales} pts**: ${probCorto}.`;

  return {
    puntosActuales,
    puntosProyectados: proyectadosText,
    probabilidadClasificar: prob,
    escenarios,
    resumen: `Con **${puntosActuales} pts** tras ${partidosJugados} partido${partidosJugados !== 1 ? 's' : ''}: ${prob}. ${partidosRestantes > 0 ? `Queda${partidosRestantes > 1 ? 'n' : ''} ${partidosRestantes} partido${partidosRestantes > 1 ? 's' : ''}.` : 'Fase de grupos terminada.'}`,
    _insight: {
      title: 'Lectura de la clasificación',
      text: insightText,
      tone: insightTone,
      icon: '⚽',
    },
    _chart: {
      type: 'scale',
      marker: proyectados,
      markerLabel: `${proyectados} pts`,
      min: 0,
      segments: [
        { nombre: 'Improbable', max: 3, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Al filo', max: 4, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Probable', max: 6, color: '#3b82f6', colorDark: '#2563eb' },
        { nombre: 'Asegurado', max: 9.5, color: '#22c55e', colorDark: '#16a34a' },
      ],
      ariaLabel: `Puntos proyectados ${proyectados} sobre una escala de 0 a 9 para clasificar a octavos`,
    },
  };
}
