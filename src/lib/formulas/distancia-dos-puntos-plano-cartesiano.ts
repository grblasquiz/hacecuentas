export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function distanciaDosPuntosPlanoCartesiano(i: Inputs): Outputs {
  const x1=Number(i.x1)||0; const y1=Number(i.y1)||0; const x2=Number(i.x2)||0; const y2=Number(i.y2)||0;
  const d=Math.sqrt((x2-x1)**2+(y2-y1)**2);
  return { d:d.toFixed(3), resumen:`Distancia entre (${x1},${y1}) y (${x2},${y2}): ${d.toFixed(2)}.` };
}
