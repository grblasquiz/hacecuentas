export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function vtvRutaVencimientoVigenciaMeses(i: Inputs): Outputs {
  const a=Number(i.anio)||2020; const u=Number(i.ultima)||1;
  const edad=new Date().getFullYear()-a;
  let fr:string; let meses:number;
  if (edad<=4) { fr='Cada 3 años'; meses=36; }
  else if (edad<=9) { fr='Anual'; meses=12; }
  else { fr='Semestral'; meses=6; }
  return { frecuencia:fr, proxima:`${meses} meses`, resumen:`Auto ${a} (${edad}a): VTV ${fr}.` };
}
