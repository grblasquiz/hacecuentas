/** Regla de tres simple: directa o inversa */
export interface Inputs {
  a: number;
  b: number;
  c: number;
  tipo?: string;
}
export interface Outputs {
  resultado: number;
  formula: string;
  explicacion: string;
}

export function reglaTres(i: Inputs): Outputs {
  const a = Number(i.a);
  const b = Number(i.b);
  const c = Number(i.c);
  const tipo = String(i.tipo || 'directa');
  if (!a || isNaN(b) || isNaN(c)) throw new Error('Ingresá los tres valores');

  let resultado = 0;
  let formula = '';
  let explicacion = '';

  if (tipo === 'inversa') {
    // a × b = c × x → x = (a × b) / c
    resultado = (a * b) / c;
    formula = `x = (${a} × ${b}) / ${c}`;
    explicacion = 'Inversa: cuando una magnitud crece, la otra disminuye en proporción (ej: más personas → menos horas para hacer la misma tarea).';
  } else {
    // a / b = c / x → x = (b × c) / a
    resultado = (b * c) / a;
    formula = `x = (${b} × ${c}) / ${a}`;
    explicacion = 'Directa: cuando una magnitud crece, la otra crece en proporción (ej: más kilos → más precio).';
  }

  return {
    resultado: Number(resultado.toFixed(4)),
    formula,
    explicacion,
  };
}
