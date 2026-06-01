export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function molesMasaFormulaMolecular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { error: 'Completá', moleculas: 'moléculas' },
    en: { error: 'Fill in all fields', moleculas: 'molecules' },
    pt: { error: 'Preencha todos os campos', moleculas: 'moléculas' },
  } as const)[__lang];
  const m = Number(i.m); const mw = Number(i.mw);
  if (!m || !mw) throw new Error(T.error);
  const n = m / mw;
  const molec = n * 6.022e23;
  return { moles: n.toFixed(4) + ' mol', moleculas: molec.toExponential(3), resumen: `${m}g / ${mw}g/mol = ${n.toFixed(3)} mol (${molec.toExponential(2)} ${T.moleculas}).` };
}
