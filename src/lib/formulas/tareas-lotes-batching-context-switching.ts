export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Ratio de reducción de context switching + tiempo recuperado por día.
// v1 = cambios de contexto actuales por día (sin batching)
// v2 = bloques de tareas agrupadas planificados por día (con batching)
// Costo de recuperación por switch profundo: 23 min (Gloria Mark, UC Irvine, 2008).
const COSTO_SWITCH_MIN = 23;

function fmtMin(min: number): string {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h} h` : `${h} h ${r} min`;
}

export function tareasLotesBatchingContextSwitching(i: Inputs): Outputs {
  const switches = Math.max(0, Number(i.v1) || 0);
  const bloques = Math.max(1, Number(i.v2) || 1);

  const ratio = switches / bloques;
  // Switches evitados por jornada (no puede ser negativo).
  const switchesEvitados = Math.max(0, switches - bloques);
  const tiempoRecuperado = switchesEvitados * COSTO_SWITCH_MIN;
  const tiempoPerdidoSin = switches * COSTO_SWITCH_MIN;
  const tiempoPerdidoCon = bloques * COSTO_SWITCH_MIN;

  const ratioStr = ratio.toFixed(2).replace('.', ',');

  let tone = 'neutral';
  let icon = '🔀';
  if (ratio >= 4) { tone = 'positive'; icon = '🚀'; }
  else if (ratio >= 2) { tone = 'positive'; icon = '✅'; }
  else if (ratio <= 1) { tone = 'warning'; icon = '⚠️'; }

  const resumen = ratio <= 1
    ? `Con ${switches} switches y ${bloques} bloques no hay reducción: ya trabajás agrupado o planificaste más bloques que interrupciones.`
    : `Sin batching te interrumpís ${ratioStr}× más que con tu esquema de ${bloques} bloques. Evitás ${switchesEvitados} switches por día y recuperás ${fmtMin(tiempoRecuperado)} de tiempo productivo (a 23 min de recuperación por interrupción).`;

  const _insight = {
    title: ratio <= 1 ? 'Ya estás optimizado' : `Recuperás ${fmtMin(tiempoRecuperado)} por día`,
    text: ratio <= 1
      ? `Tu ratio es **${ratioStr}×**: con ${bloques} bloques planificados para ${switches} switches actuales ya no hay margen de mejora por batching.`
      : `Tu ratio de reducción es **${ratioStr}×**. Pasás de **${fmtMin(tiempoPerdidoSin)}/día** perdidos en recuperación (${switches} switches × 23 min) a **${fmtMin(tiempoPerdidoCon)}/día** (${bloques} bloques × 23 min): recuperás **${fmtMin(tiempoRecuperado)}** de foco por jornada.`,
    tone,
    icon,
  };

  return {
    resultado: `${ratioStr}×`,
    resumen,
    _insight,
  };
}
