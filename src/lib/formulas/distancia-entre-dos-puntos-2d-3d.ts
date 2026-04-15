/** Distancia euclidiana entre dos puntos (2D y 3D) */
export interface Inputs {
  x1: number; y1: number; z1?: number;
  x2: number; y2: number; z2?: number;
}

export interface Outputs {
  result: number;
  puntoMedio: string;
  detalle: string;
}

export function distanciaEntreDosPuntos2d3d(i: Inputs): Outputs {
  const x1 = Number(i.x1);
  const y1 = Number(i.y1);
  const z1 = Number(i.z1) || 0;
  const x2 = Number(i.x2);
  const y2 = Number(i.y2);
  const z2 = Number(i.z2) || 0;

  if (isNaN(x1) || isNaN(y1)) throw new Error('Ingresá las coordenadas del punto A');
  if (isNaN(x2) || isNaN(y2)) throw new Error('Ingresá las coordenadas del punto B');

  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const is3D = z1 !== 0 || z2 !== 0;

  const dist = Math.sqrt(dx ** 2 + dy ** 2 + dz ** 2);

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const mz = (z1 + z2) / 2;

  const pA = is3D ? `(${x1}, ${y1}, ${z1})` : `(${x1}, ${y1})`;
  const pB = is3D ? `(${x2}, ${y2}, ${z2})` : `(${x2}, ${y2})`;
  const pM = is3D ? `(${mx}, ${my}, ${mz})` : `(${mx}, ${my})`;

  const formula = is3D
    ? `√[(${dx})² + (${dy})² + (${dz})²] = √[${dx ** 2} + ${dy ** 2} + ${dz ** 2}] = √${dx ** 2 + dy ** 2 + dz ** 2}`
    : `√[(${dx})² + (${dy})²] = √[${dx ** 2} + ${dy ** 2}] = √${dx ** 2 + dy ** 2}`;

  return {
    result: Number(dist.toFixed(4)),
    puntoMedio: pM,
    detalle: `**A** = ${pA}, **B** = ${pB}\n**Δx** = ${dx}, **Δy** = ${dy}${is3D ? `, **Δz** = ${dz}` : ''}\n**Distancia** = ${formula} = **${dist.toFixed(4)}**\n**Punto medio** = ${pM}`,
  };
}
