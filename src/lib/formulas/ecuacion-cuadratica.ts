/** Ecuación cuadrática: ax² + bx + c = 0 */
export interface Inputs { a: number; b: number; c: number; }
export interface Outputs {
  x1: string;
  x2: string;
  discriminante: number;
  tipo: string;
  vertice: string;
  formula: string;
}

export function ecuacionCuadratica(i: Inputs): Outputs {
  const a = Number(i.a);
  const b = Number(i.b);
  const c = Number(i.c);
  if (!a) throw new Error('El coeficiente a no puede ser 0 (no sería cuadrática)');

  const disc = b * b - 4 * a * c;
  let x1 = '', x2 = '', tipo = '';

  if (disc > 0) {
    const r1 = (-b + Math.sqrt(disc)) / (2 * a);
    const r2 = (-b - Math.sqrt(disc)) / (2 * a);
    x1 = r1.toFixed(4);
    x2 = r2.toFixed(4);
    tipo = 'Dos raíces reales distintas';
  } else if (disc === 0) {
    const r = -b / (2 * a);
    x1 = r.toFixed(4);
    x2 = r.toFixed(4);
    tipo = 'Una raíz real (doble)';
  } else {
    const re = (-b / (2 * a)).toFixed(4);
    const im = (Math.sqrt(-disc) / Math.abs(2 * a)).toFixed(4);
    x1 = `${re} + ${im}i`;
    x2 = `${re} − ${im}i`;
    tipo = 'Dos raíces complejas conjugadas (no cortan al eje x)';
  }

  // Vértice de la parábola: x = -b/(2a), y = c - b²/(4a)
  const vx = -b / (2 * a);
  const vy = c - (b * b) / (4 * a);
  const vertice = `(${vx.toFixed(4)}, ${vy.toFixed(4)})`;

  const formula = `x = (−${b} ± √${disc}) / (2 × ${a})`;

  return {
    x1, x2,
    discriminante: Number(disc.toFixed(4)),
    tipo,
    vertice,
    formula,
  };
}
