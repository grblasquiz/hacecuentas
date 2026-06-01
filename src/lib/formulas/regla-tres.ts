/** Regla de tres simple: directa o inversa */
export interface Inputs {
  a: number;
  b: number;
  c: number;
  tipo?: string;
  __lang?: string;
}
export interface Outputs {
  resultado: number;
  formula: string;
  explicacion: string;
}

export function reglaTres(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errThree: 'Ingresá los tres valores',
      errZero: 'En regla de tres inversa, el tercer valor no puede ser 0 (división por cero)',
      expInversa: 'Inversa: cuando una magnitud crece, la otra disminuye en proporción (ej: más personas → menos horas para hacer la misma tarea).',
      expDirecta: 'Directa: cuando una magnitud crece, la otra crece en proporción (ej: más kilos → más precio).',
    },
    en: {
      errThree: 'Enter all three values',
      errZero: 'In inverse rule of three, the third value cannot be 0 (division by zero)',
      expInversa: 'Inverse: when one quantity increases, the other decreases proportionally (e.g. more workers → fewer hours to complete the same task).',
      expDirecta: 'Direct: when one quantity increases, the other increases proportionally (e.g. more kilos → higher price).',
    },
  } as const)[__lang];

  const a = Number(i.a);
  const b = Number(i.b);
  const c = Number(i.c);
  const tipo = String(i.tipo || 'directa');
  if (!a || isNaN(b) || isNaN(c)) throw new Error(T.errThree);
  if (tipo === 'inversa' && c === 0) throw new Error(T.errZero);

  let resultado = 0;
  let formula = '';
  let explicacion = '';

  if (tipo === 'inversa') {
    // a × b = c × x → x = (a × b) / c
    resultado = (a * b) / c;
    formula = `x = (${a} × ${b}) / ${c}`;
    explicacion = T.expInversa;
  } else {
    // a / b = c / x → x = (b × c) / a
    resultado = (b * c) / a;
    formula = `x = (${b} × ${c}) / ${a}`;
    explicacion = T.expDirecta;
  }

  return {
    resultado: Number(resultado.toFixed(4)),
    formula,
    explicacion,
  };
}
