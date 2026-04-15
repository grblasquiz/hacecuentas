/** Área de triángulo por coordenadas de vértices (Shoelace) */
export interface Inputs {
  x1: number; y1: number;
  x2: number; y2: number;
  x3: number; y3: number;
}

export interface Outputs {
  result: number;
  perimetro: number;
  tipo: string;
  detalle: string;
}

export function areaTrianguloVerticesCoordenadas(i: Inputs): Outputs {
  const x1 = Number(i.x1); const y1 = Number(i.y1);
  const x2 = Number(i.x2); const y2 = Number(i.y2);
  const x3 = Number(i.x3); const y3 = Number(i.y3);

  if ([x1, y1, x2, y2, x3, y3].some(isNaN)) throw new Error('Ingresá las coordenadas de los tres vértices');

  // Shoelace formula
  const det = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);
  const area = Math.abs(det) / 2;

  if (area === 0) throw new Error('Los tres puntos son colineales (están en la misma recta). No forman un triángulo.');

  // Lados
  const ab = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const bc = Math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2);
  const ca = Math.sqrt((x1 - x3) ** 2 + (y1 - y3) ** 2);
  const perimetro = ab + bc + ca;

  // Clasificación
  const sides = [ab, bc, ca].map((s) => Number(s.toFixed(6)));
  let tipo = 'Escaleno';
  if (sides[0] === sides[1] && sides[1] === sides[2]) tipo = 'Equilátero';
  else if (sides[0] === sides[1] || sides[1] === sides[2] || sides[0] === sides[2]) tipo = 'Isósceles';

  return {
    result: Number(area.toFixed(4)),
    perimetro: Number(perimetro.toFixed(4)),
    tipo,
    detalle: `**Vértices**: A(${x1},${y1}), B(${x2},${y2}), C(${x3},${y3})\n**Fórmula**: ½|${x1}(${y2}−${y3}) + ${x2}(${y3}−${y1}) + ${x3}(${y1}−${y2})|\n= ½|${det}| = **${area.toFixed(4)}**\n**Lados**: AB=${ab.toFixed(4)}, BC=${bc.toFixed(4)}, CA=${ca.toFixed(4)}\n**Perímetro**: ${perimetro.toFixed(4)}\n**Tipo**: ${tipo}`,
  };
}
