/** Rule of three. Direct: x = (b × c) / a. Inverse: x = (a × b) / c. */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | undefined; }

export function reglaDeTresSimpleDirectaInversa(i: Inputs): Outputs {
  const modo = String(i.modo || 'dir');
  const a = Number(i.a) || 0;
  const b = Number(i.b) || 0;
  const c = Number(i.c) || 0;

  let x: number;
  let resumen: string;

  if (modo === 'inv') {
    if (c === 0) throw new Error("'c' cannot be zero in an inverse proportion (division by zero).");
    x = (a * b) / c;
    resumen = `Inverse proportion: x = (a × b) / c = (${a} × ${b}) / ${c} = ${Number(x.toFixed(4))}. The product stays constant: a × b = ${a * b} = c × x.`;
  } else {
    if (a === 0) throw new Error("'a' cannot be zero in a direct proportion (division by zero).");
    x = (b * c) / a;
    resumen = `Direct proportion: x = (b × c) / a = (${b} × ${c}) / ${a} = ${Number(x.toFixed(4))}. The ratio stays constant: a / b = c / x.`;
  }

  return { x: Number(x.toFixed(4)), resumen };
}
