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
  _insight?: any;
  _chart?: any;
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

  const fcMaxR = Math.round(fcMax);
  // Objetivo aeróbico: 75% (centro de Z3), siempre dentro de las zonas y por debajo de FCmax
  const objetivoAerobico = Math.round(base + reserva * 0.75);
  const metodoTxt = useKarvonen ? ' (zonas por método Karvonen, usando tu FC reposo)' : '';

  return {
    fcMax: fcMaxR,
    zona1Min: z1lo, zona1Max: z1hi,
    zona2Min: z2lo, zona2Max: z2hi,
    zona3Min: z3lo, zona3Max: z3hi,
    zona4Min: z4lo, zona4Max: z4hi,
    zona5Min: z5lo, zona5Max: z5hi,
    formulaUsada: nombreF + (useKarvonen ? ' + Karvonen' : ''),
    _insight: {
      title: 'Tu FCmax y zonas',
      text: `Tu FCmax es **${fcMaxR} lpm** (${nombreF})${metodoTxt}. Para fondo aeróbico y quema de grasa, entrená en zona 2-3: **${z2lo}-${z3hi} lpm**. Las zonas 4-5 (${z4lo} lpm en adelante) son esfuerzo alto, solo en series cortas.`,
      tone: 'neutral',
      icon: '❤️',
    },
    _chart: {
      type: 'scale',
      marker: objetivoAerobico,
      markerLabel: `Aeróbico ${objetivoAerobico}`,
      min: base > 0 ? base : Math.round(fcMax * 0.5),
      segments: [
        { nombre: 'Z1', max: z1hi, color: '#22c55e', colorDark: '#4ade80' },
        { nombre: 'Z2', max: z2hi, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Z3', max: z3hi, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Z4', max: z4hi, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Z5 (FCmax)', max: z5hi, color: '#ef4444', colorDark: '#f87171' },
      ],
      ariaLabel: `FCmax ${fcMaxR} lpm y zonas de entrenamiento; objetivo aeróbico en ${objetivoAerobico} lpm`,
    },
  };
}
