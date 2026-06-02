/** Progresión aritmética: término n y suma de los primeros n */
export interface Inputs {
  primerTermino: number;
  diferencia: number;
  n: number;
}
export interface Outputs {
  terminoN: number;
  suma: number;
  formulaTermino: string;
  formulaSuma: string;
  serie: string;
  _insight?: any;
}

export function progresionAritmetica(i: Inputs): Outputs {
  const a1 = Number(i.primerTermino);
  const d = Number(i.diferencia);
  const n = Math.floor(Number(i.n));

  if (isNaN(a1) || isNaN(d)) throw new Error('Ingresá primer término y diferencia');
  if (!n || n < 1) throw new Error('n debe ser un entero ≥ 1');
  if (n > 100000) throw new Error('n demasiado grande, máximo 100.000');

  // Término n: a_n = a_1 + (n-1) × d
  const an = a1 + (n - 1) * d;

  // Suma de los primeros n: S_n = n × (a_1 + a_n) / 2
  const sn = (n * (a1 + an)) / 2;

  // Generar serie (primeros 10 + ... + último)
  const seriePrev: string[] = [];
  const max = Math.min(n, 10);
  for (let i = 0; i < max; i++) {
    seriePrev.push(String(a1 + i * d));
  }
  let serie = seriePrev.join(', ');
  if (n > 10) serie += `, ..., ${an}`;

  const fmt = (x: number) => Number(x.toFixed(4)).toLocaleString('es-AR');
  const sentido = d > 0
    ? `sube **+${fmt(d)}** por término hasta llegar a **${fmt(an)}** en a${n}`
    : d < 0
      ? `baja **${fmt(d)}** por término hasta caer a **${fmt(an)}** en a${n}`
      : `se mantiene constante en **${fmt(a1)}** (diferencia 0)`;
  const _insight = {
    title: 'Cómo evoluciona la serie',
    text: `Desde un primer término de ${fmt(a1)}, la progresión ${sentido}. Sumando los **${n}** términos obtenés **${fmt(sn)}**.`,
    tone: 'neutral',
    icon: '📈',
  };

  return {
    terminoN: Number(an.toFixed(6)),
    suma: Number(sn.toFixed(6)),
    formulaTermino: `a_${n} = ${a1} + (${n}−1) × ${d} = ${an}`,
    formulaSuma: `S_${n} = ${n} × (${a1} + ${an}) / 2 = ${sn}`,
    serie,
    _insight,
  };
}
