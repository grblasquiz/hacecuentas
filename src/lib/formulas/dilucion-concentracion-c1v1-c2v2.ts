export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dilucionConcentracionC1v1C2v2(i: Inputs): Outputs {
  const modo = String(i.modo); const c1 = Number(i.c1); const v1 = Number(i.v1);
  const c2 = Number(i.c2); const v2 = Number(i.v2);
  let r: number; let unit: string;
  if (modo === 'v2') { r = c1 * v1 / c2; unit = 'vol final'; }
  else if (modo === 'c2') { r = c1 * v1 / v2; unit = 'conc final'; }
  else { r = c2 * v2 / c1; unit = 'vol inicial'; }
  return { resultado: r.toFixed(3), resumen: `${unit} = ${r.toFixed(3)}. Para diluir ${c1} en ${v1} a ${c2}: preparar ${r.toFixed(1)} de vol total.` };
}
