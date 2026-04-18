export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pohConcentracionOh(i: Inputs): Outputs {
  const oh = Number(i.oh);
  if (!oh || oh <= 0) throw new Error('Ingresá [OH⁻]');
  const poh = -Math.log10(oh);
  const ph = 14 - poh;
  return { poh: poh.toFixed(2), ph: ph.toFixed(2), resumen: `pOH = ${poh.toFixed(2)}, pH = ${ph.toFixed(2)} (${ph > 7 ? 'alcalino' : 'ácido'}).` };
}
