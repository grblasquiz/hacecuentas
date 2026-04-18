export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function horasEstudioIdiomaFluidezFsi(i: Inputs): Outputs {
  const id=String(i.idioma||'ingles');
  const h:Record<string,[number,string]>={ingles:[600,'I'],frances:[600,'I'],aleman:[900,'II'],ruso:[1100,'III'],chino:[2200,'IV'],japones:[2200,'IV']};
  const [hr,cat]=h[id]||[600,'I'];
  return { horas:`${hr}h`, meses:`${(hr/30).toFixed(1)} meses`, categoria:cat, resumen:`${id} cat ${cat}: ${hr}h estudio (${(hr/30).toFixed(0)} meses a 1h/día).` };
}
