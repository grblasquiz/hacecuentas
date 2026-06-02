/** Puntaje DELF de Francés */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  total: number;
  resultado: string;
  faltaTotal: number;
  pruebaDebil: string;
  _insight?: any;
  _chart?: any;
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
  const faltaTotal = Math.max(0, 50 - total);

  const tone = apto ? 'good' : 'warn';
  const insightText = apto
    ? `Total **${total}/100**: aprobás el DELF. Necesitás **50 puntos** y al menos **5/25 en cada prueba**, y cumplís todo. Tu prueba más floja fue **${masDebil.n} (${masDebil.v}/25)**.`
    : !aprobaTotal
    ? `Total **${total}/100**: te faltan **${faltaTotal} puntos** para el mínimo de 50. ${reprueba.length ? `Además quedaste bajo el piso de 5 en: ${reprueba.map(p => p.n).join(', ')}. ` : ''}Tu prueba más floja es **${masDebil.n} (${masDebil.v}/25)** — ahí está el mayor margen de mejora.`
    : `Total **${total}/100** alcanza, pero no aprobás: hay prueba(s) bajo el piso de 5 (${reprueba.map(p => `${p.n} ${p.v}`).join(', ')}). El DELF elimina si una sola prueba queda por debajo de **5/25**.`;

  const out: Outputs = {
    total,
    resultado: res,
    faltaTotal,
    pruebaDebil: `${masDebil.n} con ${masDebil.v}/25`,
    _insight: { title: apto ? 'Apto en el DELF' : 'No aprobado', text: insightText, tone, icon: '🇫🇷' },
  };

  if (total > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Comprensión oral', value: co },
        { label: 'Comprensión escrita', value: ce },
        { label: 'Producción escrita', value: pe },
        { label: 'Producción oral', value: po },
      ],
      centerValue: `${total}/100`,
      centerLabel: 'Total DELF',
      ariaLabel: `Desglose del puntaje DELF por prueba: CO ${co}, CE ${ce}, PE ${pe}, PO ${po}`,
    };
  }

  return out;

}
