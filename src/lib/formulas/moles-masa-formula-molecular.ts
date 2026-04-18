export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function molesMasaFormulaMolecular(i: Inputs): Outputs {
  const m = Number(i.m); const mw = Number(i.mw);
  if (!m || !mw) throw new Error('Completá');
  const n = m / mw;
  const molec = n * 6.022e23;
  return { moles: n.toFixed(4) + ' mol', moleculas: molec.toExponential(3), resumen: `${m}g / ${mw}g/mol = ${n.toFixed(3)} mol (${molec.toExponential(2)} moléculas).` };
}
