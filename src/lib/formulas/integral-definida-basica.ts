/** Integral definida de funciones polinómicas ax^n */
export interface Inputs {
  coef: number;
  exp: number;
  limInf: number;
  limSup: number;
}

export interface Outputs {
  result: number;
  primitiva: string;
  detalle: string;
}

export function integralDefinidaBasica(i: Inputs): Outputs {
  const a = Number(i.coef);
  const n = Number(i.exp);
  const inf = Number(i.limInf);
  const sup = Number(i.limSup);

  if (isNaN(a)) throw new Error('Ingresá el coeficiente');
  if (isNaN(n)) throw new Error('Ingresá el exponente');
  if (n === -1) throw new Error('Para n = -1 la primitiva es ln|x|, no soportada en esta calculadora');
  if (isNaN(inf) || isNaN(sup)) throw new Error('Ingresá los límites de integración');

  const newExp = n + 1;
  const newCoef = a / newExp;

  // F(x) = newCoef * x^newExp
  const Fsup = newCoef * Math.pow(sup, newExp);
  const Finf = newCoef * Math.pow(inf, newExp);
  const resultado = Fsup - Finf;

  // Formatear primitiva
  let primitivaStr = '';
  if (newCoef === 1) primitivaStr = `x^${newExp}`;
  else if (newCoef === -1) primitivaStr = `-x^${newExp}`;
  else primitivaStr = `${Number(newCoef.toFixed(4))}·x^${newExp}`;

  const funcionStr = a === 1 ? `x^${n}` : a === -1 ? `-x^${n}` : `${a}x^${n}`;

  return {
    result: Number(resultado.toFixed(6)),
    primitiva: `F(x) = ${primitivaStr}`,
    detalle: `**∫ ${funcionStr} dx** de ${inf} a ${sup}\n\nPrimitiva: F(x) = ${primitivaStr}\nF(${sup}) = ${Number(Fsup.toFixed(6))}\nF(${inf}) = ${Number(Finf.toFixed(6))}\n**Resultado**: F(${sup}) − F(${inf}) = **${Number(resultado.toFixed(6))}**`,
  };
}
