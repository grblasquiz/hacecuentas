/** Calculadora de Velocidad de Escape — ve = √(2GM/R) */
export interface Inputs { masa: number; radio: number; }
export interface Outputs { velocidadEscape: number; velocidadKms: number; velocidadKmh: number; formula: string; }

export function velocidadEscapePlaneta(i: Inputs): Outputs {
  const M = Number(i.masa);
  const R = Number(i.radio);
  if (!M || M <= 0) throw new Error('La masa debe ser mayor a 0');
  if (!R || R <= 0) throw new Error('El radio debe ser mayor a 0');

  const G = 6.674e-11; // N·m²/kg²
  const ve = Math.sqrt(2 * G * M / R);
  const veKms = ve / 1000;
  const veKmh = ve * 3.6;

  return {
    velocidadEscape: Number(ve.toFixed(2)),
    velocidadKms: Number(veKms.toFixed(4)),
    velocidadKmh: Number(veKmh.toFixed(0)),
    formula: `ve = √(2 × ${G.toExponential(3)} × ${M.toExponential(3)} / ${R.toExponential(3)}) = ${ve.toFixed(2)} m/s`,
  };
}
