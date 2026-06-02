/** N-ésimo término de la sucesión de Fibonacci */
export interface Inputs { n: number; }
export interface Outputs {
  termino: number;
  secuencia: string;
  detalle: string;
  _insight?: any;
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

  const prev = n >= 1 ? seq[n - 1] : 0;
  const ratio = prev > 0 ? termino / prev : 0;
  const _insight = ratio > 0
    ? {
        title: `F(${n}) = ${fmt.format(termino)}`,
        text: `El término **${fmt.format(termino)}** dividido por el anterior (${fmt.format(prev)}) da **${ratio.toFixed(6).replace('.', ',')}**, que se acerca al número áureo **φ ≈ 1,618034**. Cuanto más grande es n, más exacta es esa proporción.`,
        tone: 'neutral',
        icon: '🌀',
      }
    : {
        title: `F(${n}) = ${fmt.format(termino)}`,
        text: `Estás en el arranque de la sucesión: cada término es la suma de los dos anteriores (0, 1, 1, 2, 3...). A partir de F(2), el cociente entre términos consecutivos tiende al número áureo **φ ≈ 1,618**.`,
        tone: 'neutral',
        icon: '🌀',
      };

  return {
    termino,
    secuencia: seqMostrada,
    detalle: `F(${n}) = ${fmt.format(termino)}. Secuencia: ${seqMostrada}.`,
    _insight,
  };
}
