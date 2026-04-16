/** Calculadora Moles-Gramos — n = m/M */
export interface Inputs { masa?: number; masaMolar: number; moles?: number; }
export interface Outputs { resultado: string; molesOut: number; masaOut: number; particulas: string; }

export function molesGramosConversion(i: Inputs): Outputs {
  const M = Number(i.masaMolar);
  if (!M || M <= 0) throw new Error('La masa molar debe ser mayor a 0');
  const m = i.masa != null && Number(i.masa) > 0 ? Number(i.masa) : null;
  const n = i.moles != null && Number(i.moles) > 0 ? Number(i.moles) : null;
  if (!m && !n) throw new Error('Ingresá la masa o los moles');

  const NA = 6.02214076e23;
  let moles: number, masa: number;
  if (m !== null) { moles = m / M; masa = m; }
  else { moles = n!; masa = moles * M; }

  const particulas = moles * NA;

  return {
    resultado: `${masa.toFixed(4)} g = ${moles.toFixed(6)} mol de sustancia (M = ${M} g/mol)`,
    molesOut: Number(moles.toFixed(6)),
    masaOut: Number(masa.toFixed(4)),
    particulas: `${particulas.toExponential(4)} partículas`,
  };
}
