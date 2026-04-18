export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function proyeccion10kDesde5kRiegel(i: Inputs): Outputs {
  const min = Number(i.t5kMin) || 0; const s = Number(i.t5kSeg) || 0;
  const t1 = min * 60 + s;
  const t2 = t1 * Math.pow(2, 1.06);
  const m = Math.floor(t2 / 60); const ss = Math.round(t2 % 60);
  return { proy10k: `${m}:${String(ss).padStart(2,'0')}`, resumen: `10K proyectado desde ${min}:${String(s).padStart(2,'0')} 5K → ${m}:${String(ss).padStart(2,'0')}.` };
}
