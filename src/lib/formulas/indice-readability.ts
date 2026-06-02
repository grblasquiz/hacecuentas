/** Índice de legibilidad de un texto — Flesch adaptado español (Fernández Huerta) */
export interface Inputs {
  totalPalabras: number;
  totalOraciones: number;
  totalSilabas: number;
}
export interface Outputs {
  indiceFH: number;
  nivel: string;
  gradoEscolar: string;
  palabrasPorOracion: number;
  silabasPorPalabra: number;
  mensaje: string;
  _chart?: any;
  _insight?: any;
}

export function indiceReadability(i: Inputs): Outputs {
  const palabras = Number(i.totalPalabras);
  const oraciones = Number(i.totalOraciones);
  const silabas = Number(i.totalSilabas);

  if (!palabras || palabras <= 0) throw new Error('Ingresá la cantidad de palabras');
  if (!oraciones || oraciones <= 0) throw new Error('Ingresá la cantidad de oraciones');
  if (!silabas || silabas <= 0) throw new Error('Ingresá la cantidad de sílabas');

  const palabrasPorOracion = palabras / oraciones;
  const silabasPorPalabra = silabas / palabras;

  // Fernández Huerta (1959) — Flesch adaptado al español
  // ILFH = 206.84 - 60 × (sílabas/palabras) - 1.02 × (palabras/oraciones)
  const indiceFH = 206.84 - 60 * silabasPorPalabra - 1.02 * palabrasPorOracion;

  let nivel: string;
  let gradoEscolar: string;
  if (indiceFH >= 90) { nivel = 'Muy fácil'; gradoEscolar = 'Primaria (4to grado)'; }
  else if (indiceFH >= 80) { nivel = 'Fácil'; gradoEscolar = 'Primaria (5to-6to grado)'; }
  else if (indiceFH >= 70) { nivel = 'Bastante fácil'; gradoEscolar = 'Secundaria (1er-2do año)'; }
  else if (indiceFH >= 60) { nivel = 'Normal'; gradoEscolar = 'Secundaria (3er-4to año)'; }
  else if (indiceFH >= 50) { nivel = 'Algo difícil'; gradoEscolar = 'Secundaria (5to año) / universitario'; }
  else if (indiceFH >= 30) { nivel = 'Difícil'; gradoEscolar = 'Universitario / profesional'; }
  else { nivel = 'Muy difícil'; gradoEscolar = 'Posgrado / académico especializado'; }

  const fhRound = Number(indiceFH.toFixed(1));
  const chart = {
    type: 'scale' as const,
    marker: fhRound,
    markerLabel: 'ILFH: ' + fhRound.toFixed(0),
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Muy difícil', max: 30, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: 'Difícil', max: 50, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Algo difícil', max: 60, color: '#fde68a', colorDark: '#b45309' },
      { nombre: 'Normal', max: 70, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Fácil', max: 90, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Muy fácil', max: Math.max(105, Math.ceil(fhRound) + 5), color: '#86efac', colorDark: '#15803d' },
    ],
    ariaLabel: 'Escala de legibilidad Fernández Huerta de 0 a 100: valores bajos indican texto difícil y valores altos texto fácil de leer.',
  };

  const insight = {
    title: `Texto ${nivel.toLowerCase()} de leer`,
    text: `Con **${palabrasPorOracion.toFixed(1)} palabras por oración** y **${silabasPorPalabra.toFixed(2)} sílabas por palabra**, el texto obtiene un índice Fernández Huerta de **${indiceFH.toFixed(0)}**: nivel "${nivel}", apto para ${gradoEscolar.toLowerCase()}.`,
    tone: indiceFH >= 60 ? 'good' : indiceFH >= 50 ? 'neutral' : 'warn',
    icon: indiceFH >= 60 ? '📖' : indiceFH >= 50 ? '📝' : '🧐',
  };

  return {
    indiceFH: fhRound,
    nivel,
    gradoEscolar,
    palabrasPorOracion: Number(palabrasPorOracion.toFixed(1)),
    silabasPorPalabra: Number(silabasPorPalabra.toFixed(2)),
    mensaje: `Índice Fernández Huerta: ${indiceFH.toFixed(1)} — ${nivel}. Nivel: ${gradoEscolar}. Promedio ${palabrasPorOracion.toFixed(1)} palabras/oración, ${silabasPorPalabra.toFixed(2)} sílabas/palabra.`,
    _chart: chart,
    _insight: insight,
  };
}
