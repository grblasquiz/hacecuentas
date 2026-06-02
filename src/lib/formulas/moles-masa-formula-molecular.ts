export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function molesMasaFormulaMolecular(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { error: 'Completá', moleculas: 'moléculas', insTitle: 'Cantidad de sustancia', insText: (m: number, mw: number, n: number, mol: string) => `**${m} g** de una sustancia de masa molecular **${mw} g/mol** equivalen a **${n.toFixed(3)} mol**, o sea **${mol} moléculas**. Para duplicar los moles, duplicá la masa: la relación es lineal.` },
    en: { error: 'Fill in all fields', moleculas: 'molecules', insTitle: 'Amount of substance', insText: (m: number, mw: number, n: number, mol: string) => `**${m} g** of a substance with molecular mass **${mw} g/mol** equal **${n.toFixed(3)} mol**, that is **${mol} molecules**. To double the moles, double the mass: the relationship is linear.` },
    pt: { error: 'Preencha todos os campos', moleculas: 'moléculas', insTitle: 'Quantidade de substância', insText: (m: number, mw: number, n: number, mol: string) => `**${m} g** de uma substância com massa molecular **${mw} g/mol** equivalem a **${n.toFixed(3)} mol**, ou seja **${mol} moléculas**. Para dobrar os mols, dobre a massa: a relação é linear.` },
  } as const)[__lang];
  const m = Number(i.m); const mw = Number(i.mw);
  if (!m || !mw) throw new Error(T.error);
  const n = m / mw;
  const molec = n * 6.022e23;
  return {
    moles: n.toFixed(4) + ' mol',
    moleculas: molec.toExponential(3),
    resumen: `${m}g / ${mw}g/mol = ${n.toFixed(3)} mol (${molec.toExponential(2)} ${T.moleculas}).`,
    _insight: {
      title: T.insTitle,
      text: T.insText(m, mw, n, molec.toExponential(2)),
      tone: 'neutral',
      icon: '🧪',
    },
  };
}
