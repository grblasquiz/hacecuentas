/**
 * Calculadora de MCM (Mínimo Común Múltiplo) y MCD (Máximo Común Divisor)
 * Acepta múltiples números separados por coma
 * Usa el algoritmo de Euclides
 */

export interface McmMcdInputs {
  numeros: string;
  operacion: string;
}

export interface McmMcdOutputs {
  mcm: string;
  mcd: string;
  factorizacion: string;
  explicacion: string;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function factorizarPrimos(n: number): Record<number, number> {
  const factores: Record<number, number> = {};
  let num = Math.abs(n);
  for (let i = 2; i * i <= num; i++) {
    while (num % i === 0) {
      factores[i] = (factores[i] || 0) + 1;
      num /= i;
    }
  }
  if (num > 1) factores[num] = (factores[num] || 0) + 1;
  return factores;
}

function formatFactores(factores: Record<number, number>): string {
  const partes = Object.entries(factores).map(([p, e]) => e === 1 ? p : `${p}^${e}`);
  return partes.join(' × ') || '1';
}

export function mcmMcd(inputs: McmMcdInputs): McmMcdOutputs {
  const str = String(inputs.numeros || '').trim();
  const operacion = inputs.operacion || 'ambos';

  if (!str) throw new Error('Ingresá números separados por coma');

  const nums = str.split(/[,\s;]+/).map(s => Math.floor(Number(s))).filter(n => !isNaN(n) && n !== 0);
  if (nums.length < 2) throw new Error('Ingresá al menos 2 números distintos de 0');

  const mcdResult = nums.reduce((a, b) => gcd(a, b));
  const mcmResult = nums.reduce((a, b) => lcm(a, b));

  // Factorización en primos
  const factorizaciones = nums.map(n => {
    const f = factorizarPrimos(n);
    return `${n} = ${formatFactores(f)}`;
  });
  const factorizacion = factorizaciones.join('\n');

  const numerosStr = nums.join(', ');

  let explicacion = '';
  if (operacion === 'mcm' || operacion === 'ambos') {
    explicacion += `**MCM(${numerosStr}) = ${mcmResult}** — Es el menor número que es divisible por todos los números dados. Se usa para sumar fracciones con distinto denominador, sincronizar ciclos y resolver problemas de periodicidad.\n\n`;
  }
  if (operacion === 'mcd' || operacion === 'ambos') {
    explicacion += `**MCD(${numerosStr}) = ${mcdResult}** — Es el mayor número que divide a todos los números dados sin dejar resto. Se calcula con el algoritmo de Euclides. Se usa para simplificar fracciones, dividir en partes iguales y resolver problemas de distribución.\n\n`;
  }

  explicacion += `**Factorización en primos:**\n${factorizaciones.join('\n')}`;

  if (mcdResult === 1) {
    explicacion += `\n\nLos números ${numerosStr} son **coprimos** (su MCD es 1).`;
  }

  return {
    mcm: operacion === 'mcd' ? '—' : String(mcmResult),
    mcd: operacion === 'mcm' ? '—' : String(mcdResult),
    factorizacion,
    explicacion,
  };
}
