/** N-ésimo término de la sucesión de Fibonacci */
export interface Inputs { n: number; }
export interface Outputs {
  termino: number;
  secuencia: string;
  detalle: string;
}

export function fibonacci(i: Inputs): Outputs {
  const n = Math.floor(Number(i.n));
  if (isNaN(n) || n < 0) throw new Error('Ingresá una posición válida (n ≥ 0)');
  if (n > 75) throw new Error('n máximo = 75 (límite de precisión numérica)');

  const seq: number[] = [];
  let a = 0;
  let b = 1;

  for (let idx = 0; idx <= n; idx++) {
    seq.push(a);
    [a, b] = [b, a + b];
  }

  const termino = seq[n];
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Mostrar máximo 30 términos en la secuencia para legibilidad
  const seqMostrada = seq.length <= 30
    ? seq.map(v => fmt.format(v)).join(', ')
    : seq.slice(0, 20).map(v => fmt.format(v)).join(', ') + ', ..., ' + fmt.format(seq[seq.length - 1]);

  return {
    termino,
    secuencia: seqMostrada,
    detalle: `F(${n}) = ${fmt.format(termino)}. Secuencia: ${seqMostrada}.`,
  };
}
