export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function zocaloMetrosLineal(i: Inputs): Outputs {
  const L = Number(i.largo) || 0; const A = Number(i.ancho) || 0; const p = Number(i.puertas) || 0;
  const m = 2 * (L + A) - p;
  const total = m * 1.08;
  const var_ = Math.ceil(total / 2.4);
  return { metrosLineales: m.toFixed(1) + ' m', varillas: var_.toString(),
    resumen: `${m.toFixed(1)} m lineales de zócalo = ${var_} varillas de 2.4 m.` };
}
