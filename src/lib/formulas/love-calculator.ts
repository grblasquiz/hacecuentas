/** Love Calculator clásico */
export interface Inputs { nombre1: string; nombre2: string; }
export interface Outputs { porcentaje: number; mensaje: string; }

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');
}

export function loveCalculator(i: Inputs): Outputs {
  const n1 = normalize(String(i.nombre1 || ''));
  const n2 = normalize(String(i.nombre2 || ''));
  if (!n1 || !n2) throw new Error('Ingresá ambos nombres');

  const combined = n1 + 'loves' + n2;
  // Count LOVES letters
  const counts = [
    (combined.match(/l/g) || []).length,
    (combined.match(/o/g) || []).length,
    (combined.match(/v/g) || []).length,
    (combined.match(/e/g) || []).length,
    (combined.match(/s/g) || []).length,
  ];

  // Reduce by summing adjacent pairs until 2 digits
  let digits = counts;
  while (digits.length > 2) {
    const next: number[] = [];
    for (let j = 0; j < digits.length - 1; j++) {
      next.push(digits[j] + digits[j + 1]);
    }
    // Flatten multi-digit numbers
    digits = next.flatMap(n => String(n).split('').map(Number));
    if (digits.length === 2) break;
    if (digits.length === 1) { digits = [digits[0], 0]; break; }
  }

  let pct = digits[0] * 10 + digits[1];
  if (pct > 100) pct = pct % 100 || 50;
  if (pct === 0) pct = 10;

  let msg = '';
  if (pct >= 90) msg = `¡${pct}%! Son almas gemelas según el love calculator. Fuego total.`;
  else if (pct >= 75) msg = `${pct}% — Hay mucha onda. ¡Animate!`;
  else if (pct >= 50) msg = `${pct}% — Buena base. Con esfuerzo puede ser algo lindo.`;
  else if (pct >= 25) msg = `${pct}% — Mmm, no es la mejor combinación, pero el amor es impredecible.`;
  else msg = `${pct}% — El algoritmo no los ve juntos, pero el corazón no entiende de matemáticas.`;

  return { porcentaje: pct, mensaje: msg };
}
