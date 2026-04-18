export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function distanciaFocalLenteDelgada(i: Inputs): Outputs {
  const modo = String(i.modo); const v1 = Number(i.val1); const v2 = Number(i.val2);
  let r: number;
  if (modo === 'f') { r = 1 / (1/v1 + 1/v2); }
  else if (modo === 's') { r = 1 / (1/v1 - 1/v2); }
  else { r = 1 / (1/v1 - 1/v2); }
  return { resultado: r.toFixed(2) + ' cm', resumen: `${modo} = ${r.toFixed(1)} cm (ecuación de lente delgada).` };
}
