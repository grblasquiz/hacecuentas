/** Puntaje DELF de Francés */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  total: number;
  resultado: string;
  faltaTotal: number;
  pruebaDebil: string;
}

export function puntajeDelfFrances(i: Inputs): Outputs {
  const co = Number(i.comprensionOral) || 0;
  const ce = Number(i.comprensionEscrita) || 0;
  const pe = Number(i.produccionEscrita) || 0;
  const po = Number(i.produccionOral) || 0;
  if ([co, ce, pe, po].some(v => v < 0 || v > 25)) throw new Error('Puntajes 0-25');

  const total = co + ce + pe + po;
  const aprobaTotal = total >= 50;
  const pruebas = [
    { n: 'CO', v: co },
    { n: 'CE', v: ce },
    { n: 'PE', v: pe },
    { n: 'PO', v: po },
  ];
  const reprueba = pruebas.filter(p => p.v < 5);
  const apto = aprobaTotal && reprueba.length === 0;

  let res = apto ? '✅ APTO' : '❌ NO APTO';
  if (!apto) {
    const fails: string[] = [];
    if (!aprobaTotal) fails.push(`total ${total}<50`);
    reprueba.forEach(p => fails.push(`${p.n} ${p.v}<5`));
    res += ` — falla: ${fails.join(', ')}`;
  }

  const masDebil = pruebas.reduce((a, b) => a.v < b.v ? a : b);

  return {
    total,
    resultado: res,
    faltaTotal: Math.max(0, 50 - total),
    pruebaDebil: `${masDebil.n} con ${masDebil.v}/25`,
  };

}
