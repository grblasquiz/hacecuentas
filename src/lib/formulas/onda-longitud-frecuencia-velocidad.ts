/** Calculadora de Ondas — v = λf */
export interface Inputs { velocidad?: number; longitudOnda?: number; frecuencia?: number; __lang?: string; }
export interface Outputs { resultado: string; velocidadMs: number; longitudOndaM: string; frecuenciaHz: string; }

export function ondaLongitudFrecuenciaVelocidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      atLeastTwo: 'Ingresá al menos dos de los tres valores',
      freqZero: 'La frecuencia no puede ser 0',
      lambdaZero: 'La longitud de onda no puede ser 0',
    },
    en: {
      atLeastTwo: 'Enter at least two of the three values',
      freqZero: 'Frequency cannot be 0',
      lambdaZero: 'Wavelength cannot be 0',
    },
  } as const)[__lang];

  const v = i.velocidad != null && i.velocidad !== 0 ? Number(i.velocidad) : null;
  const l = i.longitudOnda != null && i.longitudOnda !== 0 ? Number(i.longitudOnda) : null;
  const f = i.frecuencia != null && i.frecuencia !== 0 ? Number(i.frecuencia) : null;
  const filled = [v, l, f].filter(x => x !== null).length;
  if (filled < 2) throw new Error(T.atLeastTwo);

  let vel: number, lambda: number, freq: number;
  if (v === null) { lambda = l!; freq = f!; vel = lambda * freq; }
  else if (l === null) { vel = v; freq = f!; if (freq === 0) throw new Error(T.freqZero); lambda = vel / freq; }
  else if (f === null) { vel = v; lambda = l; if (lambda === 0) throw new Error(T.lambdaZero); freq = vel / lambda; }
  else { vel = v; lambda = l; freq = f; }

  // Format lambda and freq with appropriate units
  let lambdaStr: string;
  if (lambda < 1e-9) lambdaStr = `${(lambda * 1e12).toFixed(2)} pm`;
  else if (lambda < 1e-6) lambdaStr = `${(lambda * 1e9).toFixed(2)} nm`;
  else if (lambda < 1e-3) lambdaStr = `${(lambda * 1e6).toFixed(2)} μm`;
  else if (lambda < 1) lambdaStr = `${(lambda * 100).toFixed(2)} cm`;
  else lambdaStr = `${lambda.toFixed(4)} m`;

  let freqStr: string;
  if (freq >= 1e9) freqStr = `${(freq / 1e9).toFixed(4)} GHz`;
  else if (freq >= 1e6) freqStr = `${(freq / 1e6).toFixed(4)} MHz`;
  else if (freq >= 1e3) freqStr = `${(freq / 1e3).toFixed(4)} kHz`;
  else freqStr = `${freq.toFixed(4)} Hz`;

  return {
    resultado: `v = ${vel.toFixed(2)} m/s, λ = ${lambdaStr}, f = ${freqStr}`,
    velocidadMs: Number(vel.toFixed(4)),
    longitudOndaM: lambdaStr,
    frecuenciaHz: freqStr,
  };
}
