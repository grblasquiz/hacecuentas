/** Factorial, combinatoria y permutaciones */
export interface Inputs { n: number; r?: number; tipo?: string; __lang?: string; }
export interface Outputs {
  resultado: string;
  resultadoNum: number;
  formula: string;
  descripcion: string;
  _insight?: any;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function factorialStr(n: number): string {
  // BigInt para n grandes
  if (n <= 20) return factorial(n).toString();
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r.toString();
}

export function factorialCalc(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const n = Math.floor(Number(i.n));
  const r = Math.floor(Number(i.r) || 0);
  const tipo = String(i.tipo || 'factorial');

  if (n < 0) throw new Error(__lang === 'en' ? 'n must be ≥ 0' : 'n debe ser ≥ 0');
  if (n > 170 && tipo === 'factorial') {
    // n! > Number.MAX; usar BigInt
  }

  let resultado = '';
  let resNum = 0;
  let formula = '';
  let descripcion = '';

  switch (tipo) {
    case 'factorial':
      resultado = factorialStr(n);
      resNum = n <= 20 ? factorial(n) : Infinity;
      formula = `${n}! = ${n} × ${n - 1} × ... × 1`;
      descripcion = __lang === 'en'
        ? `Ways to arrange ${n} distinct objects.`
        : `Formas de ordenar ${n} objetos distintos.`;
      break;
    case 'permutacion':
      // P(n,r) = n! / (n-r)!
      if (r > n) throw new Error(__lang === 'en' ? 'r cannot be greater than n' : 'r no puede ser mayor que n');
      if (n - r <= 20) {
        resNum = factorial(n) / factorial(n - r);
        resultado = resNum.toString();
      } else {
        // BigInt
        let acc = 1n;
        for (let i = n; i > n - r; i--) acc *= BigInt(i);
        resultado = acc.toString();
        resNum = Number(acc);
      }
      formula = `P(${n}, ${r}) = ${n}! / (${n}−${r})!`;
      descripcion = __lang === 'en'
        ? `Ways to arrange ${r} elements taken from ${n} (order matters).`
        : `Formas de ordenar ${r} elementos tomados de ${n} (importa el orden).`;
      break;
    case 'combinacion':
      // C(n,r) = n! / (r! × (n-r)!)
      if (r > n) throw new Error(__lang === 'en' ? 'r cannot be greater than n' : 'r no puede ser mayor que n');
      let accC = 1n;
      for (let i = n; i > n - r; i--) accC *= BigInt(i);
      for (let i = 1n; i <= BigInt(r); i++) accC /= i; // división entera
      // Recalculo más seguro:
      let num = 1n, den = 1n;
      const rSmall = Math.min(r, n - r);
      for (let i = 0; i < rSmall; i++) {
        num *= BigInt(n - i);
        den *= BigInt(i + 1);
      }
      const combo = num / den;
      resultado = combo.toString();
      resNum = Number(combo);
      formula = `C(${n}, ${r}) = ${n}! / (${r}! × ${n - r}!)`;
      descripcion = __lang === 'en'
        ? `Ways to choose ${r} elements from ${n} (order does NOT matter).`
        : `Formas de elegir ${r} elementos de ${n} (NO importa el orden).`;
      break;
  }

  let insightText: string;
  if (tipo === 'permutacion') {
    insightText = __lang === 'en'
      ? `There are **${resultado}** ordered arrangements of ${r} elements taken from ${n} — order matters, so ABC and CBA count separately.`
      : `Hay **${resultado}** maneras ordenadas de tomar ${r} elementos de ${n}: importa el orden, así que ABC y CBA cuentan por separado.`;
  } else if (tipo === 'combinacion') {
    insightText = __lang === 'en'
      ? `There are **${resultado}** ways to pick ${r} elements from ${n} when order doesn't matter — ABC and CBA are the same group.`
      : `Hay **${resultado}** formas de elegir ${r} elementos de ${n} sin que importe el orden: ABC y CBA son el mismo grupo.`;
  } else {
    insightText = __lang === 'en'
      ? `**${n}!** = ${resultado}: the number of distinct ways to arrange ${n} different objects in a row.`
      : `**${n}!** = ${resultado}: la cantidad de formas distintas de ordenar ${n} objetos diferentes en fila.`;
  }

  return {
    resultado,
    resultadoNum: isFinite(resNum) ? resNum : 0,
    formula,
    descripcion,
    _insight: {
      title: __lang === 'en' ? 'What it means' : 'Qué significa',
      text: insightText,
      tone: 'neutral',
      icon: '🔢',
    },
  };
}
