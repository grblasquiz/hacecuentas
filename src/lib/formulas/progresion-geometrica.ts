/** Progresión geométrica: término n y suma de los primeros n */
export interface Inputs {
  primerTermino: number;
  razon: number;
  n: number;
}
export interface Outputs {
  terminoN: number;
  suma: number;
  sumaInfinita: number | string;
  formulaTermino: string;
  formulaSuma: string;
  serie: string;
  _insight?: any;
}

export function progresionGeometrica(i: Inputs): Outputs {
  const a1 = Number(i.primerTermino);
  const r = Number(i.razon);
  const n = Math.floor(Number(i.n));

  if (isNaN(a1) || isNaN(r)) throw new Error('Ingresá primer término y razón');
  if (!n || n < 1) throw new Error('n debe ser un entero ≥ 1');
  if (n > 1000) throw new Error('n demasiado grande, máximo 1.000');

  // a_n = a_1 × r^(n-1)
  const an = a1 * Math.pow(r, n - 1);

  // S_n = a_1 × (1 - r^n) / (1 - r)  si r ≠ 1
  // S_n = a_1 × n  si r = 1
  let sn = 0;
  if (r === 1) {
    sn = a1 * n;
  } else {
    sn = a1 * (1 - Math.pow(r, n)) / (1 - r);
  }

  // Suma infinita (solo converge si |r| < 1)
  let sumaInfinita: number | string = '∞ (no converge)';
  if (Math.abs(r) < 1) {
    sumaInfinita = Number((a1 / (1 - r)).toFixed(6));
  }

  // Serie: primeros 10 + ... + último
  const seriePrev: string[] = [];
  const max = Math.min(n, 10);
  for (let i = 0; i < max; i++) {
    const t = a1 * Math.pow(r, i);
    seriePrev.push(Math.abs(t) < 1e-4 || Math.abs(t) > 1e10 ? t.toExponential(2) : String(Number(t.toFixed(4))));
  }
  let serie = seriePrev.join(', ');
  if (n > 10) {
    const lastStr = Math.abs(an) < 1e-4 || Math.abs(an) > 1e10 ? an.toExponential(2) : String(Number(an.toFixed(4)));
    serie += `, ..., ${lastStr}`;
  }

  const ar = Math.abs(r);
  const fmt = (x: number) => isFinite(x) ? Number(x.toFixed(4)).toLocaleString('es-AR') : 'overflow';
  let insTone: string; let insIcon: string; let insText: string;
  if (ar < 1 && ar > 0) {
    insTone = 'good'; insIcon = '🎯';
    insText = `Como |razón| = **${fmt(ar)}** es menor que 1, los términos se achican y la serie **converge**: sumando infinitos términos se estabiliza en **${fmt(Number(sumaInfinita))}**. Los primeros ${n} ya suman ${fmt(sn)}.`;
  } else if (ar > 1) {
    insTone = 'warn'; insIcon = '🚀';
    insText = `Con |razón| = **${fmt(ar)}** mayor que 1, cada término multiplica al anterior y la serie **diverge**: no tiene suma infinita. En ${n} términos ya alcanza a${n} = **${fmt(an)}** y acumula **${fmt(sn)}**.`;
  } else {
    insTone = 'neutral'; insIcon = '📊';
    insText = ar === 1
      ? `Con razón ±1 la sucesión no se achica, así que **no converge**: los ${n} términos suman **${fmt(sn)}**.`
      : `Con razón 0 todos los términos tras el primero valen 0; la suma queda en **${fmt(sn)}**.`;
  }
  const _insight = { title: '¿Converge o diverge?', text: insText, tone: insTone, icon: insIcon };

  return {
    terminoN: isFinite(an) ? Number(an.toFixed(6)) : 0,
    suma: isFinite(sn) ? Number(sn.toFixed(6)) : 0,
    sumaInfinita,
    formulaTermino: `a_${n} = ${a1} × ${r}^(${n}−1) = ${isFinite(an) ? an.toExponential(4) : 'overflow'}`,
    formulaSuma: r === 1
      ? `S_${n} = ${a1} × ${n} = ${sn}`
      : `S_${n} = ${a1} × (1 − ${r}^${n}) / (1 − ${r}) = ${isFinite(sn) ? sn.toExponential(4) : 'overflow'}`,
    serie,
    _insight,
  };
}
