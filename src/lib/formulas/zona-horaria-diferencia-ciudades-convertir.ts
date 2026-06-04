export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// UTC offsets in minutes (to support half-hour / quarter-hour zones)
// Values represent standard time (non-DST) offsets
const CITY_OFFSETS: Record<string, number> = {
  // Americas — South
  'buenos_aires':   -180, // UTC-3 (no DST)
  'montevideo':     -180, // UTC-3 (no DST)
  'sao_paulo':      -180, // UTC-3 (DST oct-feb: -120, using standard)
  'santiago':       -240, // UTC-4 (DST sep-abr: -180, using standard)
  'asuncion':       -240, // UTC-4 (DST oct-mar: -180, using standard)
  'bogota':         -300, // UTC-5 (no DST)
  'lima':           -300, // UTC-5 (no DST)
  'caracas':        -240, // UTC-4 (no DST)
  'la_paz':         -240, // UTC-4 (no DST)
  'quito':          -300, // UTC-5 (no DST)
  // Americas — North & Central
  'ciudad_de_mexico': -360, // UTC-6 (DST abr-oct: -300, using standard)
  'nueva_york':     -300, // UTC-5 (DST mar-nov: -240, using standard)
  'los_angeles':    -480, // UTC-8 (DST mar-nov: -420, using standard)
  'chicago':        -360, // UTC-6 (DST mar-nov: -300, using standard)
  'miami':          -300, // UTC-5 (DST mar-nov: -240, using standard)
  'toronto':        -300, // UTC-5 (DST mar-nov: -240, using standard)
  'vancouver':      -480, // UTC-8 (DST mar-nov: -420, using standard)
  'havana':         -300, // UTC-5 (DST mar-oct: -240, using standard)
  // Europe
  'madrid':          60,  // UTC+1 (DST mar-oct: +120, using standard)
  'londres':          0,  // UTC+0 (DST mar-oct: +60, using standard)
  'paris':           60,  // UTC+1 (DST mar-oct: +120, using standard)
  'berlin':          60,  // UTC+1 (DST mar-oct: +120, using standard)
  'roma':            60,  // UTC+1 (DST mar-oct: +120, using standard)
  'amsterdam':       60,  // UTC+1 (DST mar-oct: +120, using standard)
  'zurich':          60,  // UTC+1 (DST mar-oct: +120, using standard)
  'lisboa':           0,  // UTC+0 (DST mar-oct: +60, using standard)
  'atenas':         120,  // UTC+2 (DST mar-oct: +180, using standard)
  'moscú':          180,  // UTC+3 (no DST desde 2014)
  'varsovia':        60,  // UTC+1 (DST mar-oct: +120, using standard)
  'estocolmo':       60,  // UTC+1 (DST mar-oct: +120, using standard)
  'helsinki':       120,  // UTC+2 (DST mar-oct: +180, using standard)
  'kiev':           120,  // UTC+2 (DST mar-oct: +180, using standard)
  'bucarest':       120,  // UTC+2 (DST mar-oct: +180, using standard)
  // Africa & Middle East
  'cairo':          120,  // UTC+2 (no DST)
  'johannesburgo':  120,  // UTC+2 (no DST)
  'lagos':           60,  // UTC+1 (no DST)
  'nairobi':        180,  // UTC+3 (no DST)
  'dubai':          240,  // UTC+4 (no DST)
  'riyadh':         180,  // UTC+3 (no DST)
  'tel_aviv':       120,  // UTC+2 (DST mar-oct: +180, using standard)
  'istanbul':       180,  // UTC+3 (no DST desde 2016)
  'bagdad':         180,  // UTC+3 (no DST)
  // Asia
  'tehran':         210,  // UTC+3:30 (no DST)
  'karachi':        300,  // UTC+5 (no DST)
  'nueva_delhi':    330,  // UTC+5:30 (no DST)
  'dacca':          360,  // UTC+6 (no DST)
  'colombo':        330,  // UTC+5:30 (no DST)
  'bangkok':        420,  // UTC+7 (no DST)
  'yakarta':        420,  // UTC+7 (no DST)
  'singapur':       480,  // UTC+8 (no DST)
  'hong_kong':      480,  // UTC+8 (no DST)
  'beijing':        480,  // UTC+8 (no DST)
  'shanghai':       480,  // UTC+8 (no DST)
  'tokio':          540,  // UTC+9 (no DST)
  'seul':           540,  // UTC+9 (no DST)
  'kuala_lumpur':   480,  // UTC+8 (no DST)
  'manila':         480,  // UTC+8 (no DST)
  // Oceania
  'sydney':         600,  // UTC+10 (DST oct-abr: +660, using standard)
  'melbourne':      600,  // UTC+10 (DST oct-abr: +660, using standard)
  'auckland':       720,  // UTC+12 (DST sep-abr: +780, using standard)
  'brisbane':       600,  // UTC+10 (no DST)
  'perth':          480,  // UTC+8 (no DST)
  // Pacific
  'honolulu':      -600,  // UTC-10 (no DST)
  'suva':           720,  // UTC+12 (no DST)
};

function offsetToLabel(offsetMin: number): string {
  const sign = offsetMin >= 0 ? '+' : '−';
  const abs = Math.abs(offsetMin);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m === 0 ? `UTC${sign}${h}` : `UTC${sign}${h}:${String(m).padStart(2, '0')}`;
}

function minutesToHHMM(totalMin: number): string {
  // Normalise to 0–1439 (24h cycle)
  const normalised = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(normalised / 60);
  const m = normalised % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function zonaHorariaDiferenciaCiudadesConvertir(i: Inputs, __lang = 'es'): Outputs {
  const ciudadOrigenKey = String(i.ciudad_origen || 'buenos_aires');
  const ciudadDestinoKey = String(i.ciudad_destino || 'madrid');

  // Parse origin time (HH:MM string or total minutes)
  let horaOrigenMin = 540; // default 09:00
  if (i.hora_origen !== undefined && i.hora_origen !== '') {
    const raw = String(i.hora_origen);
    if (raw.includes(':')) {
      const [hh, mm] = raw.split(':').map(Number);
      horaOrigenMin = (hh || 0) * 60 + (mm || 0);
    } else {
      horaOrigenMin = Number(raw) * 60 || 0;
    }
  }

  const offsetOrigen = CITY_OFFSETS[ciudadOrigenKey] ?? -180;
  const offsetDestino = CITY_OFFSETS[ciudadDestinoKey] ?? 60;

  // Core formula: difference = destino_offset − origen_offset
  const diferenciaMin = offsetDestino - offsetOrigen;
  const diferenciaHoras = diferenciaMin / 60;

  // Destination time = origin time + difference
  const horaDestinoMin = horaOrigenMin + diferenciaMin;

  const horaOrigenStr = minutesToHHMM(horaOrigenMin);
  const horaDestinoStr = minutesToHHMM(horaDestinoMin);
  const offsetOrigenLabel = offsetToLabel(offsetOrigen);
  const offsetDestinoLabel = offsetToLabel(offsetDestino);

  // Day shift
  const totalDestinoRaw = horaOrigenMin + diferenciaMin;
  let dayShift = 0;
  if (totalDestinoRaw < 0) dayShift = -1;
  else if (totalDestinoRaw >= 1440) dayShift = 1;

  const isEs = __lang !== 'en' && __lang !== 'pt';
  const isPt = __lang === 'pt';

  // Difference label
  let difLabel: string;
  if (diferenciaHoras === 0) {
    difLabel = isEs ? 'Sin diferencia horaria' : isPt ? 'Sem diferença de fuso' : 'No time difference';
  } else {
    const absH = Math.abs(diferenciaHoras);
    const absHDisplay = Number.isInteger(absH) ? `${absH}` : absH.toFixed(1);
    const horasLabel = isEs
      ? `${absHDisplay} hora${absH !== 1 ? 's' : ''}`
      : isPt
      ? `${absHDisplay} hora${absH !== 1 ? 's' : ''}`
      : `${absHDisplay} hour${absH !== 1 ? 's' : ''}`;
    if (diferenciaHoras > 0) {
      difLabel = isEs
        ? `${horasLabel} adelante`
        : isPt
        ? `${horasLabel} à frente`
        : `${horasLabel} ahead`;
    } else {
      difLabel = isEs
        ? `${horasLabel} atrás`
        : isPt
        ? `${horasLabel} atrás`
        : `${horasLabel} behind`;
    }
  }

  // Day shift note
  let dayNote = '';
  if (dayShift === 1) {
    dayNote = isEs ? ' (día siguiente)' : isPt ? ' (dia seguinte)' : ' (next day)';
  } else if (dayShift === -1) {
    dayNote = isEs ? ' (día anterior)' : isPt ? ' (dia anterior)' : ' (previous day)';
  }

  const resultado = isEs
    ? `${horaDestinoStr}${dayNote}`
    : isPt
    ? `${horaDestinoStr}${dayNote}`
    : `${horaDestinoStr}${dayNote}`;

  const resumen = isEs
    ? `${difLabel}. Cuando en el origen son las ${horaOrigenStr} (${offsetOrigenLabel}), en el destino son las ${horaDestinoStr}${dayNote} (${offsetDestinoLabel}).`
    : isPt
    ? `${difLabel}. Quando na origem são ${horaOrigenStr} (${offsetOrigenLabel}), no destino são ${horaDestinoStr}${dayNote} (${offsetDestinoLabel}).`
    : `${difLabel}. When it is ${horaOrigenStr} (${offsetOrigenLabel}) at origin, it is ${horaDestinoStr}${dayNote} (${offsetDestinoLabel}) at destination.`;

  const insightTitle = isEs ? 'Diferencia horaria' : isPt ? 'Diferença de fuso horário' : 'Time difference';

  const insightText = isEs
    ? `La diferencia es **${difLabel}** (${offsetOrigenLabel} → ${offsetDestinoLabel}). Hora en destino: **${horaDestinoStr}${dayNote}**.`
    : isPt
    ? `A diferença é **${difLabel}** (${offsetOrigenLabel} → ${offsetDestinoLabel}). Hora no destino: **${horaDestinoStr}${dayNote}**.`
    : `The difference is **${difLabel}** (${offsetOrigenLabel} → ${offsetDestinoLabel}). Destination time: **${horaDestinoStr}${dayNote}**.`;

  const tone = diferenciaHoras === 0 ? ('positive' as const) : ('neutral' as const);

  return {
    resultado,
    resumen,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone,
      icon: '🌐',
    },
  };
}
