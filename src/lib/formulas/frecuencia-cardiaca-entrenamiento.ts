/** Zonas de FC para entrenamiento — Fórmula Karvonen */
export interface Inputs {
  edad: number;
  fcReposo: number;
  __lang?: string;
}
export interface Outputs {
  fcMaxima: number;
  zona1Min: number; zona1Max: number;
  zona2Min: number; zona2Max: number;
  zona3Min: number; zona3Max: number;
  zona4Min: number; zona4Max: number;
  zona5Min: number; zona5Max: number;
  mensaje: string;
  _chart?: any;
}

export function frecuenciaCardiacaEntrenamiento(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errorEdad: 'Ingresá una edad válida',
      markerLabel: (fcMax: number) => 'FC máxima: ' + fcMax + ' bpm',
      z1: 'Z1 Recuperación',
      z2: 'Z2 Base aeróbica',
      z3: 'Z3 Aeróbico',
      z4: 'Z4 Umbral',
      z5: 'Z5 VO2max',
      ariaLabel: 'Escala de zonas de frecuencia cardíaca de entrenamiento (Karvonen)',
      mensaje: (fcMax: number, z2min: number, z2max: number, z3min: number, z3max: number) =>
        `FC máxima: ${fcMax} bpm. Zona quema grasa: ${z2min}–${z2max} bpm. Zona cardio: ${z3min}–${z3max} bpm.`,
    },
    en: {
      errorEdad: 'Enter a valid age',
      markerLabel: (fcMax: number) => 'Max HR: ' + fcMax + ' bpm',
      z1: 'Z1 Recovery',
      z2: 'Z2 Aerobic base',
      z3: 'Z3 Aerobic',
      z4: 'Z4 Threshold',
      z5: 'Z5 VO2max',
      ariaLabel: 'Heart rate training zones scale (Karvonen)',
      mensaje: (fcMax: number, z2min: number, z2max: number, z3min: number, z3max: number) =>
        `Max HR: ${fcMax} bpm. Fat burn zone: ${z2min}–${z2max} bpm. Cardio zone: ${z3min}–${z3max} bpm.`,
    },
  } as const)[__lang];

  const edad = Number(i.edad);
  const fcReposo = Number(i.fcReposo) || 60;
  if (!edad || edad < 10 || edad > 100) throw new Error(T.errorEdad);

  // FC máxima estimada (Tanaka 2001): 208 - 0.7 × edad
  const fcMaxima = 208 - 0.7 * edad;

  // Karvonen: FCobjetivo = FCreposo + % × (FCmax - FCreposo)
  const reserva = fcMaxima - fcReposo;

  const zona = (min: number, max: number) => ({
    min: Math.round(fcReposo + min * reserva),
    max: Math.round(fcReposo + max * reserva),
  });

  const z1 = zona(0.50, 0.60); // Recuperación
  const z2 = zona(0.60, 0.70); // Base aeróbica
  const z3 = zona(0.70, 0.80); // Aeróbico / tempo
  const z4 = zona(0.80, 0.90); // Umbral anaeróbico
  const z5 = zona(0.90, 1.00); // VO2max

  const chart = {
    type: 'scale' as const,
    marker: Math.round(fcMaxima),
    markerLabel: T.markerLabel(Math.round(fcMaxima)),
    min: z1.min,
    unit: ' bpm',
    segments: [
      { nombre: T.z1, max: z1.max, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: T.z2, max: z2.max, color: '#a7f3d0', colorDark: '#047857' },
      { nombre: T.z3, max: z3.max, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.z4, max: z4.max, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: T.z5, max: Math.max(z5.max, Math.round(fcMaxima)), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: T.ariaLabel,
  };

  return {
    fcMaxima: Math.round(fcMaxima),
    zona1Min: z1.min, zona1Max: z1.max,
    zona2Min: z2.min, zona2Max: z2.max,
    zona3Min: z3.min, zona3Max: z3.max,
    zona4Min: z4.min, zona4Max: z4.max,
    zona5Min: z5.min, zona5Max: z5.max,
    mensaje: T.mensaje(Math.round(fcMaxima), z2.min, z2.max, z3.min, z3.max),
    _chart: chart,
  };
}
