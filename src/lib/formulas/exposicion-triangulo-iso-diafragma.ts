/**
 * Calculadora de triángulo de exposición (ISO, diafragma, velocidad)
 */

export interface Inputs {
  isoBase: number; aperturaBase: number; velocidadBase: number; isoNuevo: number;
}

export interface Outputs {
  stopsIso: string; aperturaCompensada: string; velocidadCompensada: string; explicacion: string;
}

export function exposicionTrianguloIsoDiafragma(inputs: Inputs): Outputs {
  const i1 = Number(inputs.isoBase);
  const a1 = Number(inputs.aperturaBase);
  const v1 = Number(inputs.velocidadBase);
  const i2 = Number(inputs.isoNuevo);
  if (!i1 || !a1 || !v1 || !i2) throw new Error('Completá los campos');
  const stops = Math.log2(i2 / i1);
  // Apertura compensada: f/ nuevo = f/ base × sqrt(2)^stops
  const aNuevo = a1 * Math.pow(Math.sqrt(2), stops);
  // Velocidad compensada (1/seg): vNuevo denominador = v1 × 2^stops
  const vNuevo = v1 * Math.pow(2, stops);
  const signo = stops >= 0 ? '+' : '';
  return {
    stopsIso: `${signo}${stops.toFixed(1)} stops luz`,
    aperturaCompensada: `f/${aNuevo.toFixed(1)} (para misma exposición)`,
    velocidadCompensada: `1/${Math.round(vNuevo)} s`,
    explicacion: stops > 0 ? `ISO sube: cerrá diafragma o acelerá obturación ${stops.toFixed(1)} stops.` : `ISO baja: abrí diafragma o lentá obturación ${Math.abs(stops).toFixed(1)} stops.`,
  };
}
