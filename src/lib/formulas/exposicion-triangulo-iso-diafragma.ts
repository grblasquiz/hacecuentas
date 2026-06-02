/**
 * Calculadora de triángulo de exposición (ISO, diafragma, velocidad)
 */

export interface Inputs {
  isoBase: number; aperturaBase: number; velocidadBase: number; isoNuevo: number;
}

export interface Outputs {
  stopsIso: string; aperturaCompensada: string; velocidadCompensada: string; explicacion: string; _insight?: any;
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
  const absS = Math.abs(stops);
  return {
    stopsIso: `${signo}${stops.toFixed(1)} stops luz`,
    aperturaCompensada: `f/${aNuevo.toFixed(1)} (para misma exposición)`,
    velocidadCompensada: `1/${Math.round(vNuevo)} s`,
    explicacion: stops > 0 ? `ISO sube: cerrá diafragma o acelerá obturación ${stops.toFixed(1)} stops.` : `ISO baja: abrí diafragma o lentá obturación ${Math.abs(stops).toFixed(1)} stops.`,
    _insight: {
      title: 'Cómo mantener la exposición',
      text: stops > 0
        ? `Subir de **ISO ${i1}** a **ISO ${i2}** suma **+${stops.toFixed(1)} stops** de luz. Para no quemar la foto, compensá: cerrá a **f/${aNuevo.toFixed(1)}** o acelerá el obturador a **1/${Math.round(vNuevo)} s**.`
        : `Bajar de **ISO ${i1}** a **ISO ${i2}** resta **${absS.toFixed(1)} stops**. Para no oscurecer, recuperá luz: abrí a **f/${aNuevo.toFixed(1)}** o lentá el obturador a **1/${Math.round(vNuevo)} s**.`,
      tone: 'neutral',
      icon: '📷',
    },
  };
}
