export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function resorteLeyHookeConstante(i: Inputs): Outputs {
  const modo = String(i.modo); const v1 = Number(i.val1); const v2 = Number(i.val2);
  let result: number; let label: string;
  if (modo === 'F') { result = v1 * v2; label = result.toFixed(2) + ' N'; }
  else if (modo === 'x') { if (!v2) throw new Error('k no puede ser 0'); result = v1 / v2; label = result.toFixed(4) + ' m'; }
  else { if (!v2) throw new Error('x no puede ser 0'); result = v1 / v2; label = result.toFixed(2) + ' N/m'; }
  return { resultado: label, resumen: `${modo} = ${label} (con valores ${v1} y ${v2}).` };
}
