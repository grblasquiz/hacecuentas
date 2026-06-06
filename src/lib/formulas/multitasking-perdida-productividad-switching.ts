/**
 * Pérdida de productividad por multitasking (switching cost).
 * Calcula los minutos perdidos por cambios de tarea y qué porcentaje
 * de la jornada se evapora en re-enfoque cognitivo (attention residue).
 *
 * Coeficientes de costo por transición basados en Sophie Leroy
 * (attention residue) y Gloria Mark (UC Irvine):
 *   - simple/rutinaria: 4 min
 *   - media: 6.5 min
 *   - compleja: 11 min
 *   - creativa profunda: 17 min
 */
export interface Inputs {
  switches: number;        // cambios de tarea / interrupciones por día
  tipoTarea?: string;      // 'simple' | 'media' | 'compleja' | 'creativa'
  jornada?: number;        // duración de la jornada en minutos
  [k: string]: number | string | undefined;
}
export interface Outputs {
  resultado: string;       // % de la jornada perdida (output primario)
  minutosPerdidos: number; // minutos perdidos por switching
  ratio: number;           // fracción 0-1
  resumen: string;
  _insight?: any;
  _chart?: any;
}

const COSTO_POR_TIPO: Record<string, { min: number; label: string }> = {
  simple:   { min: 4,    label: 'simple / rutinaria' },
  media:    { min: 6.5,  label: 'cognitiva media' },
  compleja: { min: 11,   label: 'cognitiva compleja' },
  creativa: { min: 17,   label: 'creativa profunda' },
};

export function multitaskingPerdidaProductividadSwitching(i: Inputs): Outputs {
  const switches = Number(i.switches);
  const jornada = Number(i.jornada) > 0 ? Number(i.jornada) : 480;
  const tipo = String(i.tipoTarea || 'media');
  const costo = COSTO_POR_TIPO[tipo] || COSTO_POR_TIPO.media;

  if (!Number.isFinite(switches) || switches < 0) {
    throw new Error('Ingresá un número de cambios de tarea válido (0 o más).');
  }

  // Minutos perdidos = cambios × costo por transición (tope = jornada).
  const brutoPerdido = switches * costo.min;
  const minutosPerdidos = Math.min(brutoPerdido, jornada);
  const ratio = jornada > 0 ? minutosPerdidos / jornada : 0;
  const pct = ratio * 100;

  const pctFmt = pct.toLocaleString('es-AR', { maximumFractionDigits: 1 });
  const minFmt = Math.round(minutosPerdidos).toLocaleString('es-AR');
  const horasProductivas = Math.max(0, (jornada - minutosPerdidos) / 60);
  const horasFmt = horasProductivas.toLocaleString('es-AR', { maximumFractionDigits: 1 });

  // Zona de severidad (referencia: <15% bajo, 15-30% medio, >30% alto).
  let zona: string;
  let tone: 'good' | 'warn' | 'neutral';
  if (pct < 15) { zona = 'Impacto bajo'; tone = 'good'; }
  else if (pct < 30) { zona = 'Impacto medio'; tone = 'neutral'; }
  else { zona = 'Impacto alto'; tone = 'warn'; }

  const _insight = {
    title: `${zona}: perdés el ${pctFmt}% de tu jornada`,
    text: `Con **${switches} cambios de tarea** por día (tipo ${costo.label}, ~${costo.min} min cada uno) perdés **${minFmt} minutos** en re-enfoque cognitivo. Eso es el **${pctFmt}%** de una jornada de ${jornada} min: te quedan **${horasFmt} h** de trabajo realmente productivo. ${
      pct < 15
        ? 'Tu gestión de la atención es buena: seguí protegiendo tus bloques de foco.'
        : pct < 30
          ? 'Recortando interrupciones con time blocking o batching podés recuperar buena parte de ese tiempo.'
          : 'Casi un tercio o más de tu día se va en switching: priorizá bloques de deep work y notificaciones en silencio.'
    }`,
    tone,
    icon: '🔀',
  };

  const _chart = {
    type: 'scale',
    marker: Number(pct.toFixed(1)),
    markerLabel: `${pctFmt}%`,
    min: 0,
    segments: [
      { nombre: 'Bajo', max: 15, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Medio', max: 30, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Alto', max: Math.max(50, Math.ceil(pct) + 5), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Escala de pérdida de productividad por multitasking: ${pctFmt}% de la jornada en zona ${zona}.`,
  };

  return {
    resultado: `${pctFmt}%`,
    minutosPerdidos: Math.round(minutosPerdidos),
    ratio: Number(ratio.toFixed(3)),
    resumen: `${switches} cambios × ${costo.min} min = ${minFmt} min perdidos sobre ${jornada} min de jornada = ${pctFmt}% (te quedan ${horasFmt} h productivas).`,
    _insight,
    _chart,
  };
}
