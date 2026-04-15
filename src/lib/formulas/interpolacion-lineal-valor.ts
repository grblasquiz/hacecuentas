/** Interpolación lineal entre dos puntos */
export interface Inputs {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x: number;
}

export interface Outputs {
  result: number;
  proporcion: number;
  detalle: string;
}

export function interpolacionLinealValor(i: Inputs): Outputs {
  const x0 = Number(i.x0);
  const y0 = Number(i.y0);
  const x1 = Number(i.x1);
  const y1 = Number(i.y1);
  const x = Number(i.x);

  if (isNaN(x0) || isNaN(y0)) throw new Error('Ingresá el primer punto (x₀, y₀)');
  if (isNaN(x1) || isNaN(y1)) throw new Error('Ingresá el segundo punto (x₁, y₁)');
  if (isNaN(x)) throw new Error('Ingresá el valor de x a interpolar');
  if (x0 === x1) throw new Error('x₀ y x₁ no pueden ser iguales');

  const t = (x - x0) / (x1 - x0);
  const y = y0 + t * (y1 - y0);

  let tipoStr = 'interpolación';
  if (t < 0 || t > 1) tipoStr = 'extrapolación (fuera del rango)';

  return {
    result: Number(y.toFixed(6)),
    proporcion: Number(t.toFixed(6)),
    detalle: `**Puntos**: (${x0}, ${y0}) y (${x1}, ${y1})\n**x** = ${x}\n**t** = (${x} − ${x0}) / (${x1} − ${x0}) = **${t.toFixed(6)}** (${tipoStr})\n**y** = ${y0} + ${t.toFixed(6)} × (${y1} − ${y0}) = **${y.toFixed(6)}**`,
  };
}
