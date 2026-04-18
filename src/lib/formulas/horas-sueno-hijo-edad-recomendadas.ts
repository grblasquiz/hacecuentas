export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasSuenoHijoEdadRecomendadas(i: Inputs): Outputs {
  const e=Number(i.edad)||0;
  let h:string; let s:string;
  if (e<1) { h='12-17h'; s='3-4 siestas'; }
  else if (e<3) { h='11-14h'; s='1-2 siestas'; }
  else if (e<6) { h='10-13h'; s='1 siesta opcional'; }
  else if (e<14) { h='9-11h'; s='Sin siesta'; }
  else { h='8-10h'; s='Sin siesta'; }
  return { horas:h, siestas:s, resumen:`Edad ${e}: ${h}, ${s}.` };
}
