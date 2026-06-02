/** Calculadora de Ondas — v = λf */
export interface Inputs { velocidad?: number; longitudOnda?: number; frecuencia?: number; __lang?: string; }
export interface Outputs { resultado: string; velocidadMs: number; longitudOndaM: string; frecuenciaHz: string; _insight?: any; }

export function ondaLongitudFrecuenciaVelocidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      atLeastTwo: 'Ingresá al menos dos de los tres valores',
      freqZero: 'La frecuencia no puede ser 0',
      lambdaZero: 'La longitud de onda no puede ser 0',
      insTitle: 'Lectura de la onda',
      solvedVel: 'velocidad',
      solvedLambda: 'longitud de onda',
      solvedFreq: 'frecuencia',
      solvedNone: 'comprobación',
      insBody: (s: string, v: string) => `Despejaste la **${s}**: ${v}. Recordá que v = λ·f, así que si subís la frecuencia manteniendo la velocidad, la longitud de onda baja en la misma proporción.`,
      insBodyCheck: (v: string) => `Con los tres valores cargados, esto verifica la relación v = λ·f: ${v}.`,
      band: (b: string) => ` Cae en la banda de **${b}**.`,
      radio: 'radio', micro: 'microondas', infra: 'infrarrojo / THz', visible: 'luz visible', uv: 'ultravioleta o superior',
    },
    en: {
      atLeastTwo: 'Enter at least two of the three values',
      freqZero: 'Frequency cannot be 0',
      lambdaZero: 'Wavelength cannot be 0',
      insTitle: 'Reading the wave',
      solvedVel: 'speed',
      solvedLambda: 'wavelength',
      solvedFreq: 'frequency',
      solvedNone: 'check',
      insBody: (s: string, v: string) => `You solved for **${s}**: ${v}. Remember v = λ·f, so raising the frequency at constant speed shrinks the wavelength in the same proportion.`,
      insBodyCheck: (v: string) => `With all three values entered, this verifies the relation v = λ·f: ${v}.`,
      band: (b: string) => ` It falls in the **${b}** band.`,
      radio: 'radio', micro: 'microwave', infra: 'infrared / THz', visible: 'visible light', uv: 'ultraviolet or above',
    },
  } as const)[__lang];

  const v = i.velocidad != null && i.velocidad !== 0 ? Number(i.velocidad) : null;
  const l = i.longitudOnda != null && i.longitudOnda !== 0 ? Number(i.longitudOnda) : null;
  const f = i.frecuencia != null && i.frecuencia !== 0 ? Number(i.frecuencia) : null;
  const filled = [v, l, f].filter(x => x !== null).length;
  if (filled < 2) throw new Error(T.atLeastTwo);

  let vel: number, lambda: number, freq: number;
  let solved: 'vel' | 'lambda' | 'freq' | 'none';
  if (v === null) { lambda = l!; freq = f!; vel = lambda * freq; solved = 'vel'; }
  else if (l === null) { vel = v; freq = f!; if (freq === 0) throw new Error(T.freqZero); lambda = vel / freq; solved = 'lambda'; }
  else if (f === null) { vel = v; lambda = l; if (lambda === 0) throw new Error(T.lambdaZero); freq = vel / lambda; solved = 'freq'; }
  else { vel = v; lambda = l; freq = f; solved = 'none'; }

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

  // Banda del espectro EM por frecuencia (sólo informativo, aplica a ondas EM)
  let band = '';
  if (freq > 0) {
    if (freq < 3e9) band = T.radio;
    else if (freq < 3e11) band = T.micro;
    else if (freq < 4e14) band = T.infra;
    else if (freq < 7.9e14) band = T.visible;
    else band = T.uv;
  }
  const solvedLabel = solved === 'vel' ? T.solvedVel : solved === 'lambda' ? T.solvedLambda : solved === 'freq' ? T.solvedFreq : T.solvedNone;
  const solvedVal = solved === 'vel' ? `${vel.toFixed(2)} m/s` : solved === 'lambda' ? lambdaStr : solved === 'freq' ? freqStr : `${vel.toFixed(2)} m/s · ${lambdaStr} · ${freqStr}`;
  const insBody = solved === 'none' ? T.insBodyCheck(solvedVal) : T.insBody(solvedLabel, solvedVal);

  return {
    resultado: `v = ${vel.toFixed(2)} m/s, λ = ${lambdaStr}, f = ${freqStr}`,
    velocidadMs: Number(vel.toFixed(4)),
    longitudOndaM: lambdaStr,
    frecuenciaHz: freqStr,
    _insight: {
      title: T.insTitle,
      text: insBody + (band ? T.band(band) : ''),
      tone: 'neutral',
      icon: '🌊',
    },
  };
}
