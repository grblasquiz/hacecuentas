/** Frecuencia cardíaca máxima y zonas de entrenamiento */
export interface Inputs { edad: number; formula?: string; frecuenciaReposo?: number; }
export interface Outputs {
  fcMax: number;
  zona1Min: number;
  zona1Max: number;
  zona2Min: number;
  zona2Max: number;
  zona3Min: number;
  zona3Max: number;
  zona4Min: number;
  zona4Max: number;
  zona5Min: number;
  zona5Max: number;
  formulaUsada: string;
}

export function frecuenciaCardiaca(i: Inputs): Outputs {
  const edad = Number(i.edad);
  const formula = String(i.formula || 'tanaka');
  const fcReposo = Number(i.frecuenciaReposo) || 0;
  if (!edad || edad <= 0) throw new Error('Ingresá la edad');

  let fcMax = 0;
  let nombreF = '';
  if (formula === 'fox') { fcMax = 220 - edad; nombreF = 'Fox (220 − edad)'; }
  else if (formula === 'tanaka') { fcMax = 208 - 0.7 * edad; nombreF = 'Tanaka (208 − 0.7 × edad)'; }
  else if (formula === 'gulati') { fcMax = 206 - 0.88 * edad; nombreF = 'Gulati (mujeres)'; }
  else { fcMax = 208 - 0.7 * edad; nombreF = 'Tanaka'; }

  // Si hay FC reposo, usar método Karvonen (reserva cardíaca)
  const useKarvonen = fcReposo > 0;
  const reserva = useKarvonen ? fcMax - fcReposo : fcMax;
  const base = useKarvonen ? fcReposo : 0;

  const pct = (lo: number, hi: number) => [
    Math.round(base + reserva * lo),
    Math.round(base + reserva * hi),
  ];

  const [z1lo, z1hi] = pct(0.50, 0.60);
  const [z2lo, z2hi] = pct(0.60, 0.70);
  const [z3lo, z3hi] = pct(0.70, 0.80);
  const [z4lo, z4hi] = pct(0.80, 0.90);
  const [z5lo, z5hi] = pct(0.90, 1.00);

  return {
    fcMax: Math.round(fcMax),
    zona1Min: z1lo, zona1Max: z1hi,
    zona2Min: z2lo, zona2Max: z2hi,
    zona3Min: z3lo, zona3Max: z3hi,
    zona4Min: z4lo, zona4Max: z4hi,
    zona5Min: z5lo, zona5Max: z5hi,
    formulaUsada: nombreF + (useKarvonen ? ' + Karvonen' : ''),
  };
}
