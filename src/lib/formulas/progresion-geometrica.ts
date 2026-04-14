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

  return {
    terminoN: isFinite(an) ? Number(an.toFixed(6)) : 0,
    suma: isFinite(sn) ? Number(sn.toFixed(6)) : 0,
    sumaInfinita,
    formulaTermino: `a_${n} = ${a1} × ${r}^(${n}−1) = ${isFinite(an) ? an.toExponential(4) : 'overflow'}`,
    formulaSuma: r === 1
      ? `S_${n} = ${a1} × ${n} = ${sn}`
      : `S_${n} = ${a1} × (1 − ${r}^${n}) / (1 − ${r}) = ${isFinite(sn) ? sn.toExponential(4) : 'overflow'}`,
    serie,
  };
}
