/**
 * Regla de los 2 minutos (GTD, David Allen) como árbol de decisión.
 * Entrada: tiempo estimado de la tarea (min) + si es delegable + si tiene
 * fecha límite. Salida: qué hacer (hacela ya / delegá / acción corta / agendá /
 * proyecto), con el overhead de gestión que te ahorrás o gastás.
 * Calc de decisión, no aritmética: el umbral de 2 min es el corte central.
 */
export interface Inputs {
  tiempoEstimado: number | string; // minutos
  delegable?: string; // 'si' | 'no'
  fechaLimite?: string; // 'si' | 'no'
  [k: string]: number | string | undefined;
}
export interface Outputs {
  decision: string;
  reglaAplica: string;
  overhead: string;
  resumen: string;
  _chart?: any;
  _insight?: any;
  [k: string]: string | number | any;
}

// Overhead administrativo estimado de "gestionar" una microtarea en vez de
// ejecutarla (escribirla, revisarla en listas, reprocesarla): 3–5 min (Allen).
const OVERHEAD_GESTION_MIN = 4;

export function regla2MinutosDecisionTareaInmediata(i: Inputs): Outputs {
  const t = Number(i.tiempoEstimado);
  if (!Number.isFinite(t) || t <= 0) {
    throw new Error('Ingresá el tiempo estimado de la tarea en minutos (mayor a 0).');
  }
  const delegable = String(i.delegable ?? 'no') === 'si';
  const conFecha = String(i.fechaLimite ?? 'no') === 'si';

  let decision: string;
  let icon: string;
  let tone: 'good' | 'warn' | 'neutral';
  let detalle: string;

  if (t <= 2) {
    decision = 'Hacela ahora';
    icon = '⚡';
    tone = 'good';
    detalle = `La regla de los 2 minutos aplica: gestionarla (anotarla, revisarla, reprocesarla) cuesta ~${OVERHEAD_GESTION_MIN} min de atención fragmentada, más que los ${fmt(t)} min de hacerla ya.`;
  } else if (delegable) {
    decision = 'Delegala';
    icon = '🤝';
    tone = 'neutral';
    detalle = `Supera los 2 minutos (${fmt(t)} min) y marcaste que hay alguien más adecuado: la acción de 2 minutos acá es **pedir la delegación**, no hacer la tarea.`;
  } else if (t <= 15) {
    decision = conFecha ? 'Agendala como próxima acción (hoy)' : 'Anotala como próxima acción';
    icon = '📝';
    tone = 'neutral';
    detalle = `Con ${fmt(t)} min no aplica la regla de los 2 minutos. Va a tu lista de próximas acciones${conFecha ? ', priorizada por su fecha límite' : ''}.`;
  } else if (t <= 60) {
    decision = 'Agendá un bloque en el calendario';
    icon = '📅';
    tone = 'warn';
    detalle = `Son ${fmt(t)} min de trabajo: reservá un bloque de tiempo concentrado en tu agenda${conFecha ? ' antes de la fecha límite' : ''} en vez de intentarla entre tareas.`;
  } else {
    decision = 'Convertila en proyecto';
    icon = '🗂️';
    tone = 'warn';
    detalle = `Más de una hora (${fmt(t)} min) ya no es una tarea: dividila en subtareas accionables y trazá los próximos pasos.`;
  }

  const reglaAplica = t <= 2
    ? 'Sí — hacela ya (≤ 2 min)'
    : 'No — necesita decisión (> 2 min)';

  // Overhead: si la hacés ya, ahorrás el overhead de gestión; si no, lo vas a pagar.
  const overhead = t <= 2
    ? `Ejecutarla ahora te ahorra ~${OVERHEAD_GESTION_MIN} min de gestión administrativa.`
    : `Procesarla bien (decidir y agendar) evita revisitarla 3–4 veces (~${OVERHEAD_GESTION_MIN} min perdidos).`;

  const chart = {
    type: 'scale' as const,
    marker: t,
    markerLabel: `Tu tarea: ${fmt(t)} min`,
    min: 0,
    unit: ' min',
    segments: [
      { nombre: 'Hacela ya', max: 2, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Acción corta', max: 15, color: '#fef9c3', colorDark: '#854d0e' },
      { nombre: 'Agendá', max: 60, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Proyecto', max: Math.max(120, Math.ceil(t) + 10), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: 'Escala de decisión GTD por tiempo de tarea: hacela ya, acción corta, agendá o proyecto.',
  };

  return {
    decision,
    reglaAplica,
    overhead,
    resumen: `${fmt(t)} min → ${decision}. ${detalle.replace(/\*\*/g, '')}`,
    _chart: chart,
    _insight: {
      title: 'Qué hacer con esta tarea',
      text: `**${decision}.** ${detalle}`,
      tone,
      icon,
    },
  };
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');
}
