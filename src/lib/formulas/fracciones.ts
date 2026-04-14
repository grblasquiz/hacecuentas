/** Operaciones con fracciones: suma, resta, multiplicación, división, simplificar */
export interface Inputs {
  a: number;
  b: number;
  c?: number;
  d?: number;
  operacion?: string;
}
export interface Outputs {
  numerador: number;
  denominador: number;
  resultado: string;
  decimal: number;
  formula: string;
  mixto: string;
}

function gcd(x: number, y: number): number {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) { [x, y] = [y, x % y]; }
  return x || 1;
}

function simplificar(num: number, den: number): { n: number; d: number } {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(num, den);
  return { n: num / g, d: den / g };
}

function toMixto(num: number, den: number): string {
  if (Math.abs(num) < den) return `${num}/${den}`;
  const entero = Math.trunc(num / den);
  const resto = Math.abs(num) % den;
  if (resto === 0) return `${entero}`;
  return `${entero} ${resto}/${den}`;
}

export function fracciones(i: Inputs): Outputs {
  const a = Math.trunc(Number(i.a));
  const b = Math.trunc(Number(i.b));
  const c = Math.trunc(Number(i.c) || 0);
  const d = Math.trunc(Number(i.d) || 1);
  const op = String(i.operacion || 'simplificar');

  if (!b) throw new Error('El denominador de la primera fracción no puede ser 0');
  if ((op === 'suma' || op === 'resta' || op === 'multiplicacion' || op === 'division') && !d) {
    throw new Error('El denominador de la segunda fracción no puede ser 0');
  }
  if (op === 'division' && c === 0) throw new Error('No se puede dividir por una fracción 0');

  let num = 0, den = 1, formula = '';

  switch (op) {
    case 'suma':
      num = a * d + c * b;
      den = b * d;
      formula = `${a}/${b} + ${c}/${d} = (${a}×${d} + ${c}×${b}) / (${b}×${d}) = ${num}/${den}`;
      break;
    case 'resta':
      num = a * d - c * b;
      den = b * d;
      formula = `${a}/${b} − ${c}/${d} = (${a}×${d} − ${c}×${b}) / (${b}×${d}) = ${num}/${den}`;
      break;
    case 'multiplicacion':
      num = a * c;
      den = b * d;
      formula = `${a}/${b} × ${c}/${d} = (${a}×${c}) / (${b}×${d}) = ${num}/${den}`;
      break;
    case 'division':
      num = a * d;
      den = b * c;
      formula = `${a}/${b} ÷ ${c}/${d} = (${a}×${d}) / (${b}×${c}) = ${num}/${den}`;
      break;
    case 'simplificar':
    default:
      num = a;
      den = b;
      formula = `${a}/${b} simplificada`;
      break;
  }

  const s = simplificar(num, den);
  return {
    numerador: s.n,
    denominador: s.d,
    resultado: `${s.n}/${s.d}`,
    decimal: Number((s.n / s.d).toFixed(6)),
    formula,
    mixto: toMixto(s.n, s.d),
  };
}
