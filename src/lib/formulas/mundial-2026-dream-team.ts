/** Mundial 2026: combinaciones posibles del once según plantel y esquema */
export interface Inputs {
  arqueros: number;
  defensores: number;
  mediocampistas: number;
  delanteros: number;
  esquema: string;
}

export interface Outputs {
  combinacionesTotal: string;
  desgloseEsquema: string;
  flexibilidadComparada: string;
  resumen: string;
}

// Esquemas tácticos: [DEF, MED, DEL]
const ESQUEMAS: Record<string, [number, number, number]> = {
  '4-3-3': [4, 3, 3],
  '4-4-2': [4, 4, 2],
  '3-5-2': [3, 5, 2],
  '4-2-3-1': [4, 5, 1], // 2 volantes + 3 medias puntas + 1 delantero = 5 mediocampistas + 1 delantero
  '5-3-2': [5, 3, 2],
  '3-4-3': [3, 4, 3],
};

// C(n, k) combinatoria
function combinatoria(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  k = Math.min(k, n - k);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return Math.round(result);
}

function fmtNum(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + ' millones';
  return n.toLocaleString('es-AR');
}

export function mundial2026DreamTeam(i: Inputs): Outputs {
  const gk = Math.max(2, Math.min(4, Number(i.arqueros || 3)));
  const def = Math.max(6, Math.min(10, Number(i.defensores || 8)));
  const med = Math.max(6, Math.min(10, Number(i.mediocampistas || 8)));
  const del = Math.max(2, Math.min(6, Number(i.delanteros || 4)));

  const esquema = String(i.esquema || '4-3-3');
  const e = ESQUEMAS[esquema];
  if (!e) throw new Error('Esquema inválido.');
  const [reqDef, reqMed, reqDel] = e;

  if (def < reqDef) throw new Error(`El esquema ${esquema} necesita ${reqDef} defensores; tenés ${def}.`);
  if (med < reqMed) throw new Error(`El esquema ${esquema} necesita ${reqMed} mediocampistas; tenés ${med}.`);
  if (del < reqDel) throw new Error(`El esquema ${esquema} necesita ${reqDel} delanteros; tenés ${del}.`);

  const cGk = combinatoria(gk, 1);
  const cDef = combinatoria(def, reqDef);
  const cMed = combinatoria(med, reqMed);
  const cDel = combinatoria(del, reqDel);
  const total = cGk * cDef * cMed * cDel;

  // Comparar con otros esquemas
  const comparadas: string[] = [];
  for (const [nombre, [rd, rm, rdel]] of Object.entries(ESQUEMAS)) {
    if (nombre === esquema) continue;
    if (def < rd || med < rm || del < rdel) continue;
    const t = combinatoria(gk, 1) * combinatoria(def, rd) * combinatoria(med, rm) * combinatoria(del, rdel);
    comparadas.push(`${nombre}: ${fmtNum(t)}`);
  }

  const desglose = `**Arqueros**: C(${gk},1) = ${cGk}. **Defensores**: C(${def},${reqDef}) = ${cDef}. **Mediocampistas**: C(${med},${reqMed}) = ${cMed}. **Delanteros**: C(${del},${reqDel}) = ${cDel}. **Total**: ${cGk} × ${cDef} × ${cMed} × ${cDel} = ${fmtNum(total)} onces.`;

  return {
    combinacionesTotal: `${fmtNum(total)} onces posibles`,
    desgloseEsquema: desglose,
    flexibilidadComparada: comparadas.length > 0 ? comparadas.join(' · ') : 'Otros esquemas no compatibles con el plantel.',
    resumen: `Con **${gk + def + med + del} convocados** (${gk} GK + ${def} DEF + ${med} MED + ${del} DEL) en esquema **${esquema}**: **${fmtNum(total)} onces distintos posibles** matemáticamente. En la práctica, sólo 50-100 serían tácticamente viables.`,
  };
}
