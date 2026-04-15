/** Pendiente de una recta dados dos puntos */
export interface Inputs {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Outputs {
  result: number;
  ecuacion: string;
  ordenadaOrigen: number;
  angulo: number;
  detalle: string;
}

export function pendienteRectaDosPuntos(i: Inputs): Outputs {
  const x1 = Number(i.x1);
  const y1 = Number(i.y1);
  const x2 = Number(i.x2);
  const y2 = Number(i.y2);

  if (isNaN(x1) || isNaN(y1)) throw new Error('Ingresá las coordenadas del punto A');
  if (isNaN(x2) || isNaN(y2)) throw new Error('Ingresá las coordenadas del punto B');

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0) throw new Error('Los puntos tienen la misma x: la recta es vertical (pendiente indefinida). Ecuación: x = ' + x1);

  const m = dy / dx;
  const b = y1 - m * x1;
  const angulo = Math.atan(m) * (180 / Math.PI);

  // Ecuación y = mx + b
  let ecuacion = '';
  if (b === 0) {
    ecuacion = m === 1 ? 'y = x' : m === -1 ? 'y = -x' : `y = ${Number(m.toFixed(4))}x`;
  } else {
    const bStr = b > 0 ? `+ ${Number(Math.abs(b).toFixed(4))}` : `− ${Number(Math.abs(b).toFixed(4))}`;
    const mStr = m === 1 ? '' : m === -1 ? '-' : `${Number(m.toFixed(4))}`;
    ecuacion = `y = ${mStr}x ${bStr}`;
  }

  return {
    result: Number(m.toFixed(4)),
    ecuacion,
    ordenadaOrigen: Number(b.toFixed(4)),
    angulo: Number(angulo.toFixed(2)),
    detalle: `**Puntos**: (${x1}, ${y1}) y (${x2}, ${y2})\n**Pendiente**: m = (${y2} − ${y1}) / (${x2} − ${x1}) = ${dy} / ${dx} = **${Number(m.toFixed(4))}**\n**Ecuación**: ${ecuacion}\n**Ordenada al origen**: b = ${Number(b.toFixed(4))}\n**Ángulo**: ${Number(angulo.toFixed(2))}°`,
  };
}
