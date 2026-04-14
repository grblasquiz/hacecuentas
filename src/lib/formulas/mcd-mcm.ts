/** MCD y MCM de dos o más números */
export interface Inputs { numeros: string; }
export interface Outputs {
  mcd: number;
  mcm: number;
  numeros: string;
  descomposicion: string;
}

function gcd(a: number, b: number): number {
  while (b) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
}

function primeFactors(n: number): Record<number, number> {
  const factors: Record<number, number> = {};
  let num = Math.abs(n);
  for (let i = 2; i * i <= num; i++) {
    while (num % i === 0) {
      factors[i] = (factors[i] || 0) + 1;
      num /= i;
    }
  }
  if (num > 1) factors[num] = (factors[num] || 0) + 1;
  return factors;
}

export function mcdMcm(i: Inputs): Outputs {
  const str = String(i.numeros || '').trim();
  if (!str) throw new Error('Ingresá números separados por coma');

  const nums = str.split(/[,\s;]+/).map(s => Math.floor(Number(s))).filter(n => !isNaN(n) && n !== 0);
  if (nums.length < 2) throw new Error('Ingresá al menos 2 números distintos de 0');

  const mcd = nums.reduce((a, b) => gcd(a, b));
  const mcm = nums.reduce((a, b) => lcm(a, b));

  // Descomposición en factores primos
  const factores = nums.map(n => {
    const f = primeFactors(n);
    const partes = Object.entries(f).map(([p, e]) => e === 1 ? p : `${p}^${e}`);
    return `${n} = ${partes.join(' × ') || '1'}`;
  }).join('\n');

  return {
    mcd,
    mcm,
    numeros: nums.join(', '),
    descomposicion: factores,
  };
}
