export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function proyeccion21kDesde10kCameron(i: Inputs): Outputs {
  const t = Number(i.t10kMin) || 0;
  const t2 = t * Math.pow(2.11, 1.06);
  const h = Math.floor(t2 / 60); const m = Math.round(t2 % 60);
  return { proy21k: `${h}:${String(m).padStart(2,'0')}`, resumen: `21K proyectado desde ${t}min 10K: ${h}h${String(m).padStart(2,'0')}.` };
}
