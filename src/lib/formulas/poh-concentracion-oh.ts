export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function pohConcentracionOh(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const oh = Number(i.oh);
  if (!oh || oh <= 0) throw new Error(__lang === 'en' ? 'Enter [OH⁻]' : 'Ingresá [OH⁻]');
  const poh = -Math.log10(oh);
  const ph = 14 - poh;
  const nature = __lang === 'en'
    ? (ph > 7 ? 'alkaline' : 'acidic')
    : (ph > 7 ? 'alcalino' : 'ácido');
  const resumen = __lang === 'en'
    ? `pOH = ${poh.toFixed(2)}, pH = ${ph.toFixed(2)} (${nature}).`
    : `pOH = ${poh.toFixed(2)}, pH = ${ph.toFixed(2)} (${nature}).`;
  return { poh: poh.toFixed(2), ph: ph.toFixed(2), resumen };
}
