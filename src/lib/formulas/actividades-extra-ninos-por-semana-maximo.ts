export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function actividadesExtraNinosPorSemanaMaximo(i: Inputs): Outputs {
  const e=Number(i.edad)||0;
  let max:string; let tl:string;
  if (e<5) { max='0-1'; tl='180+ min'; }
  else if (e<10) { max='2-3'; tl='120 min'; }
  else { max='3-5'; tl='60-90 min'; }
  return { maxSemanal:max, tiempoLibre:tl, resumen:`Edad ${e}: máx ${max} actividades, juego libre ${tl}/día.` };
}
