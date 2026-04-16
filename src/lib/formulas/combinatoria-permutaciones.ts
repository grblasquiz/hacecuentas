/** Combinaciones y permutaciones */
export interface Inputs { n: number; r: number; tipo: string; }
export interface Outputs {
  resultado: number;
  formula: string;
  detalle: string;
}

function factorial(x: number): number {
  if (x < 0) return NaN;
  if (x === 0 || x === 1) return 1;
  let result = 1;
  for (let i = 2; i <= x; i++) result *= i;
  return result;
}

export function combinatoriaPermutaciones(i: Inputs): Outputs {
  const n = Math.floor(Number(i.n));
  const r = Math.floor(Number(i.r));
  const tipo = String(i.tipo || 'combinacion');
  if (isNaN(n) || n < 0) throw new Error('Ingresá un valor válido para n');
  if (isNaN(r) || r < 0) throw new Error('Ingresá un valor válido para r');
  if (n > 170) throw new Error('n no puede ser mayor a 170 (el factorial desborda el límite numérico de JavaScript)');

  let resultado: number;
  let formula: string;

  switch (tipo) {
    case 'combinacion':
      if (r > n) throw new Error('r no puede ser mayor que n en combinaciones sin repetición');
      resultado = factorial(n) / (factorial(r) * factorial(n - r));
      formula = `C(${n},${r}) = ${n}! / (${r}! × ${n - r}!) = ${Math.round(resultado)}`;
      break;
    case 'permutacion':
      if (r > n) throw new Error('r no puede ser mayor que n en permutaciones sin repetición');
      resultado = factorial(n) / factorial(n - r);
      formula = `P(${n},${r}) = ${n}! / ${n - r}! = ${Math.round(resultado)}`;
      break;
    case 'combinacion-repeticion':
      resultado = factorial(n + r - 1) / (factorial(r) * factorial(n - 1));
      formula = `CR(${n},${r}) = C(${n + r - 1},${r}) = ${n + r - 1}! / (${r}! × ${n - 1}!) = ${Math.round(resultado)}`;
      break;
    case 'permutacion-repeticion':
      resultado = Math.pow(n, r);
      formula = `${n}^${r} = ${resultado}`;
      break;
    default:
      throw new Error('Tipo de cálculo no reconocido');
  }

  const tipoNombres: Record<string, string> = {
    combinacion: 'Combinación sin repetición',
    permutacion: 'Permutación sin repetición',
    'combinacion-repeticion': 'Combinación con repetición',
    'permutacion-repeticion': 'Permutación con repetición',
  };

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    resultado: Math.round(resultado),
    formula,
    detalle: `${tipoNombres[tipo]}: n=${n}, r=${r}. ${formula}. Resultado: ${fmt.format(Math.round(resultado))}.`,
  };
}
