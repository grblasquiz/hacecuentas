/** Derivada de funciones polinómicas básicas (regla de potencia) */
export interface Inputs {
  coef1: number;
  exp1: number;
  coef2?: number;
  exp2?: number;
  coef3?: number;
  exp3?: number;
}

export interface Outputs {
  result: string;
  funcionOriginal: string;
  detalle: string;
}

function formatTerm(coef: number, exp: number): string {
  if (coef === 0) return '';
  if (exp === 0) return `${coef}`;
  if (exp === 1) return coef === 1 ? 'x' : coef === -1 ? '-x' : `${coef}x`;
  const c = coef === 1 ? '' : coef === -1 ? '-' : `${coef}`;
  return `${c}x^${exp}`;
}

function deriveTerm(coef: number, exp: number): { coef: number; exp: number; paso: string } {
  if (exp === 0) {
    return { coef: 0, exp: 0, paso: `${coef} → derivada = **0** (constante)` };
  }
  const newCoef = coef * exp;
  const newExp = exp - 1;
  const original = formatTerm(coef, exp);
  const derived = formatTerm(newCoef, newExp);
  return {
    coef: newCoef,
    exp: newExp,
    paso: `${original} → ${coef} × ${exp} × x^(${exp}−1) = **${derived}**`,
  };
}

function buildPoly(terms: { coef: number; exp: number }[]): string {
  const parts: string[] = [];
  for (const t of terms) {
    if (t.coef === 0) continue;
    const s = formatTerm(t.coef, t.exp);
    if (parts.length === 0) {
      parts.push(s);
    } else {
      parts.push(t.coef > 0 ? `+ ${s}` : `− ${formatTerm(Math.abs(t.coef), t.exp)}`);
    }
  }
  return parts.length > 0 ? parts.join(' ') : '0';
}

export function derivadaFuncionBasica(i: Inputs): Outputs {
  const terms: { coef: number; exp: number }[] = [];

  const c1 = Number(i.coef1);
  const e1 = Number(i.exp1);
  if (isNaN(c1) || isNaN(e1)) throw new Error('Ingresá coeficiente y exponente del primer término');
  terms.push({ coef: c1, exp: e1 });

  if (i.coef2 !== undefined && i.coef2 !== null && String(i.coef2) !== '') {
    terms.push({ coef: Number(i.coef2), exp: Number(i.exp2) || 0 });
  }
  if (i.coef3 !== undefined && i.coef3 !== null && String(i.coef3) !== '') {
    terms.push({ coef: Number(i.coef3), exp: Number(i.exp3) || 0 });
  }

  const original = buildPoly(terms);
  const derivadas = terms.map((t) => deriveTerm(t.coef, t.exp));
  const resultTerms = derivadas.map((d) => ({ coef: d.coef, exp: d.exp }));
  const resultado = buildPoly(resultTerms);

  const pasos = derivadas.map((d, idx) => `Término ${idx + 1}: ${d.paso}`).join('\n');

  return {
    result: `f'(x) = ${resultado}`,
    funcionOriginal: `f(x) = ${original}`,
    detalle: `**f(x) = ${original}**\n\n${pasos}\n\n**Resultado: f'(x) = ${resultado}**`,
  };
}
