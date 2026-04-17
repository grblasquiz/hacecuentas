/** Nivel Goethe-Zertifikat de Alemán */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  total: number;
  resultado: string;
  mencion: string;
  moduloDebil: string;
}

export function nivelGoetheAleman(i: Inputs): Outputs {
  const l = Number(i.lesen) || 0;
  const h = Number(i.horen) || 0;
  const s = Number(i.schreiben) || 0;
  const sp = Number(i.sprechen) || 0;
  if ([l, h, s, sp].some(v => v < 0 || v > 25)) throw new Error('Puntajes 0-25');

  const total = l + h + s + sp;
  const modulos = [
    { n: 'Lesen', v: l },
    { n: 'Hören', v: h },
    { n: 'Schreiben', v: s },
    { n: 'Sprechen', v: sp },
  ];
  const aprobaTotal = total >= 60;
  const reprueba = modulos.filter(m => m.v < 15);
  const apto = aprobaTotal && reprueba.length === 0;

  let res = apto ? '✅ APTO' : '❌ NO APTO';
  if (!apto) {
    const fails: string[] = [];
    if (!aprobaTotal) fails.push(`total ${total}<60`);
    reprueba.forEach(m => fails.push(`${m.n} ${m.v}<15`));
    res += ` — falla: ${fails.join(', ')}`;
  }

  let mencion = '';
  if (total >= 90) mencion = 'Sehr gut (excelente)';
  else if (total >= 80) mencion = 'Gut (bien)';
  else if (total >= 70) mencion = 'Befriedigend (satisfactorio)';
  else if (total >= 60) mencion = 'Ausreichend (suficiente)';
  else mencion = 'Nicht bestanden (no aprobado)';

  const debil = modulos.reduce((a, b) => a.v < b.v ? a : b);

  return {
    total,
    resultado: res,
    mencion,
    moduloDebil: `${debil.n} con ${debil.v}/25`,
  };

}
