/** Regla de tres compuesta: 3 magnitudes, todas directas o mezcla */
export interface Inputs {
  a1: number;
  a2: number;
  b1: number;
  b2: number;
  c1: number;
  relacionB?: string;
  relacionC?: string;
}
export interface Outputs {
  resultado: number;
  formula: string;
  explicacion: string;
}

export function reglaTresCompuesta(i: Inputs): Outputs {
  const a1 = Number(i.a1);
  const a2 = Number(i.a2);
  const b1 = Number(i.b1);
  const b2 = Number(i.b2);
  const c1 = Number(i.c1);
  const relB = String(i.relacionB || 'directa');
  const relC = String(i.relacionC || 'directa');

  if (!a1 || !b1 || !c1) throw new Error('Los valores conocidos no pueden ser 0');
  if (isNaN(a2) || isNaN(b2)) throw new Error('Ingresá los nuevos valores de A y B');

  // Para magnitudes B y C, si son inversas a A (la incógnita c2),
  // se invierte el factor: directa = b2/b1, inversa = b1/b2.
  const factorB = relB === 'inversa' ? b1 / b2 : b2 / b1;
  const factorC = relC === 'inversa' ? a1 / a2 : a2 / a1;

  const c2 = c1 * factorC * factorB;

  const explicacion = `Como A es ${relC === 'inversa' ? 'inversamente' : 'directamente'} proporcional a C, y B es ${relB === 'inversa' ? 'inversamente' : 'directamente'} proporcional a C, multiplicamos c1 por los factores correspondientes.`;

  return {
    resultado: Number(c2.toFixed(6)),
    formula: `c2 = ${c1} × (${relC === 'inversa' ? `${a1}/${a2}` : `${a2}/${a1}`}) × (${relB === 'inversa' ? `${b1}/${b2}` : `${b2}/${b1}`}) = ${Number(c2.toFixed(4))}`,
    explicacion,
  };
}
