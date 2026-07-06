/**
 * "Regla de tres simple" — proporcionalidad directa e inversa.
 *
 * Planteo: "a es a b como c es a x". El usuario carga tres valores conocidos
 * (a, b, c) y el tipo de proporción, y devolvemos la incógnita x.
 *
 *   Directa (a mayor a, mayor b):   x = b · c / a
 *   Inversa (a mayor a, menor b):   x = a · b / c
 *
 * No hay datos que caduquen → `dataUpdate.frequency` = never. Es matemática
 * pura y estable, español neutro, no-YMYL.
 *
 * Los inputs llegan como string/number desde el formulario (FormData); los
 * coercionamos a Number defensivamente. División por cero → throw.
 *
 * Devuelve outputs + _insight (el planteo resuelto) + _table (proporción).
 */

export interface ReglaDeTresInputs {
  a: string | number;
  b: string | number;
  c: string | number;
  tipo?: string;
  __lang?: string;
}

export interface ReglaDeTresOutputs {
  x: number;
  _insight?: any;
  _table?: any;
}

// Formatea con separador de miles es-AR y hasta 4 decimales (sin ceros de más),
// para que el planteo se lea prolijo tanto con enteros como con fracciones.
function fmt(n: number): string {
  if (!isFinite(n)) return '—';
  const redondeado = Math.round(n * 10000) / 10000;
  return redondeado.toLocaleString('es-AR', { maximumFractionDigits: 4 });
}

export function reglaDeTresSimple(inputs: ReglaDeTresInputs): ReglaDeTresOutputs {
  const a = Number(inputs.a);
  const b = Number(inputs.b);
  const c = Number(inputs.c);
  const tipo = (inputs.tipo ?? 'directa').toString().toLowerCase() === 'inversa'
    ? 'inversa'
    : 'directa';

  if ([a, b, c].some((v) => !isFinite(v))) {
    throw new Error('Ingresá tres valores numéricos válidos para a, b y c.');
  }

  let x: number;
  if (tipo === 'directa') {
    // Proporción directa: a / b = c / x  →  x = b · c / a
    if (a === 0) {
      throw new Error('En la regla de tres directa el valor "a" no puede ser 0 (no se puede dividir por cero).');
    }
    x = (b * c) / a;
  } else {
    // Proporción inversa: a · b = c · x  →  x = a · b / c
    if (c === 0) {
      throw new Error('En la regla de tres inversa el valor "c" no puede ser 0 (no se puede dividir por cero).');
    }
    x = (a * b) / c;
  }

  // Insight: el planteo resuelto, con la fórmula usada según el tipo.
  const planteo = tipo === 'directa'
    ? `Proporción directa: **${fmt(a)}** es a **${fmt(b)}** como **${fmt(c)}** es a **x**. Como a más ${fmt(a)}, más ${fmt(b)}, se multiplica en cruz: x = (${fmt(b)} × ${fmt(c)}) ÷ ${fmt(a)} = **${fmt(x)}**.`
    : `Proporción inversa: **${fmt(a)}** es a **${fmt(b)}** como **${fmt(c)}** es a **x**. Como a más ${fmt(c)}, menos x, se multiplican los que van juntos: x = (${fmt(a)} × ${fmt(b)}) ÷ ${fmt(c)} = **${fmt(x)}**.`;

  return {
    x,
    _insight: { type: 'highlight', icon: '➗', text: planteo },
    _table: {
      title: 'La proporción resuelta',
      headers: ['Magnitud', 'Valor conocido', 'Valor buscado'],
      rows: [
        ['Primera cantidad', fmt(a), fmt(c)],
        ['Segunda cantidad', fmt(b), fmt(x)],
      ],
      note: tipo === 'directa'
        ? 'Regla de tres directa: las dos magnitudes crecen juntas. x = b × c ÷ a. Se multiplican los valores en diagonal (b y c) y se divide por el que queda (a).'
        : 'Regla de tres inversa: cuando una magnitud sube, la otra baja. x = a × b ÷ c. Se multiplican los dos valores de la misma fila (a y b) y se divide por c.',
    },
  };
}
