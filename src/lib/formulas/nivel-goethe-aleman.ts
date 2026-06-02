/** Nivel Goethe-Zertifikat de Alemán */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  total: number;
  resultado: string;
  mencion: string;
  moduloDebil: string;
  _chart?: any;
  _insight?: any;
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

  const tone = !apto ? 'warn' : (total >= 80 ? 'good' : 'neutral');
  const insight = {
    title: apto ? 'Examen aprobado' : 'Examen no aprobado',
    text: apto
      ? `Sumaste **${total}/100** con mención **${mencion}**. Tu módulo más flojo es **${debil.n}** (${debil.v}/25): reforzalo para subir la nota.`
      : `Con **${total}/100** todavía no aprobás${aprobaTotal ? '' : ` (hace falta llegar a 60)`}${reprueba.length ? `, y reprobás ${reprueba.map(m => m.n).join(', ')} por estar bajo 15` : ''}. Enfocá la práctica en **${debil.n}** (${debil.v}/25).`,
    tone,
    icon: apto ? '🎓' : '📚',
  };
  const chart = {
    type: 'scale' as const,
    marker: total,
    markerLabel: `${total}/100`,
    min: 0,
    segments: [
      { nombre: 'No aprobado', max: 60, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Suficiente', max: 70, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Satisfactorio', max: 80, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Bien', max: 90, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Excelente', max: Math.max(100, total + 1), color: '#16a34a', colorDark: '#22c55e' },
    ],
    ariaLabel: `Puntaje Goethe de ${total} sobre 100, mención ${mencion}`,
  };

  return {
    total,
    resultado: res,
    mencion,
    moduloDebil: `${debil.n} con ${debil.v}/25`,
    _chart: chart,
    _insight: insight,
  };

}
