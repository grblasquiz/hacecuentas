export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function autonomiaBateriaDispositivoMah(i: Inputs): Outputs {
  const mah=Number(i.mah)||0; const ma=Number(i.ma)||0;
  if (ma===0) return { horas:'—', dias:'—', resumen:'Consumo no puede ser 0.' };
  const h=mah/ma;
  return { horas:`${h.toFixed(2)} h`, dias:`${(h/24).toFixed(2)} días`, resumen:`${mah}mAh / ${ma}mA = ${h.toFixed(1)}h continuas.` };
}
