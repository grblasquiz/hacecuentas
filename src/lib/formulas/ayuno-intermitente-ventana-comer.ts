export interface Inputs {
  protocol: string;
  eating_start_hour: string;
  lifestyle: string;
}

export interface Outputs {
  eating_window_hours: string;
  eating_start_label: string;
  eating_end_label: string;
  fast_hours: string;
  ketosis_start_label: string;
  autophagy_start_label: string;
  lifestyle_note: string;
}

// Umbrales metabólicos basados en literatura revisada (NEJM 2019, Cell Metabolism 2022)
// Cetosis leve detectable: ~12 h de ayuno (umbral conservador)
// Autofagia significativa: ~16 h de ayuno (umbral conservador)
const KETOSIS_THRESHOLD_H = 12;
const AUTOPHAGY_THRESHOLD_H = 16;

interface ProtocolConfig {
  fastHours: number;
  eatHours: number;
  label: string;
}

const PROTOCOLS: Record<string, ProtocolConfig> = {
  "16_8": { fastHours: 16, eatHours: 8, label: "16:8" },
  "18_6": { fastHours: 18, eatHours: 6, label: "18:6" },
  "20_4": { fastHours: 20, eatHours: 4, label: "20:4" },
  "omad":  { fastHours: 23, eatHours: 1, label: "OMAD" }
};

function formatHour(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  const hStr = String(h).padStart(2, "0");
  const mStr = String(m).padStart(2, "0");
  return `${hStr}:${mStr}`;
}

function addHours(baseMinutes: number, hoursToAdd: number): number {
  return baseMinutes + hoursToAdd * 60;
}

export function compute(i: Inputs): Outputs {
  const protocol = PROTOCOLS[i.protocol] ?? PROTOCOLS["16_8"];
  const startHour = parseInt(i.eating_start_hour, 10);
  const safeStart = isNaN(startHour) ? 12 : startHour;

  const startMinutes = safeStart * 60;

  // Hora de cierre de la ventana de alimentación
  const eatEndMinutes = addHours(startMinutes, protocol.eatHours);

  // El ayuno empieza al cerrar la ventana
  const fastStartMinutes = eatEndMinutes;

  // Cetosis estimada
  const ketosisMinutes = addHours(fastStartMinutes, KETOSIS_THRESHOLD_H);

  // Autofagia estimada
  const autophagyMinutes = addHours(fastStartMinutes, AUTOPHAGY_THRESHOLD_H);

  // Etiqueta de ventana
  const eatWindowLabel = `${protocol.eatHours} hora${protocol.eatHours === 1 ? "" : "s"} (protocolo ${protocol.label})`;

  // Nota de estilo de vida
  let lifestyleNote = "";
  if (i.lifestyle === "very_active") {
    lifestyleNote = "Estilo muy activo: el glucógeno se agota más rápido; podrías alcanzar cetosis antes del umbral estimado. Considera abrir tu ventana cerca del entrenamiento.";
  } else if (i.lifestyle === "active") {
    lifestyleNote = "Estilo activo: los tiempos estimados son representativos. Si entrenas en ayunas, hidrátate bien y observa tu rendimiento.";
  } else {
    lifestyleNote = "Estilo sedentario: el glucógeno se agota más lentamente. El inicio real de cetosis puede retrasarse si tu última comida fue alta en carbohidratos.";
  }

  // Determinar si el cierre cae al día siguiente
  const eatEndNormalized = ((eatEndMinutes % 1440) + 1440) % 1440;
  const crossesMidnight = eatEndMinutes >= 1440;
  const closingSuffix = crossesMidnight ? " (día siguiente)" : "";

  const ketosisNormalized = ((ketosisMinutes % 1440) + 1440) % 1440;
  const ketosisDay = ketosisMinutes >= 1440 ? " (día siguiente)" : "";

  const autophagyNormalized = ((autophagyMinutes % 1440) + 1440) % 1440;
  const autophagyDay = autophagyMinutes >= 1440 ? " (día siguiente)" : "";

  return {
    eating_window_hours: eatWindowLabel,
    eating_start_label: formatHour(startMinutes),
    eating_end_label: formatHour(eatEndMinutes) + closingSuffix,
    fast_hours: `${protocol.fastHours} horas de ayuno`,
    ketosis_start_label: `~${formatHour(ketosisMinutes)}${ketosisDay} (${KETOSIS_THRESHOLD_H} h desde el cierre)`,
    autophagy_start_label: `~${formatHour(autophagyMinutes)}${autophagyDay} (${AUTOPHAGY_THRESHOLD_H} h desde el cierre)`,
    lifestyle_note: lifestyleNote
  };
}
