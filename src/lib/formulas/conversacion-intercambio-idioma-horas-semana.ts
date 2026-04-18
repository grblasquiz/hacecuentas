export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversacionIntercambioIdiomaHorasSemana(i: Inputs): Outputs {
  const n=String(i.nivelMeta||'b1');
  const h:Record<string,number>={a2:1,b1:2,b2:3,c1:5};
  const hr=h[n]||2;
  return { horas:`${hr}h/sem`, metodos:'Tandem, iTalki, intercambio', resumen:`Meta ${n.toUpperCase()}: ${hr}h conversación/sem.` };
}
