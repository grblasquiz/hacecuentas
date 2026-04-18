export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoPantallaRecomendadoHijoEdad(i: Inputs): Outputs {
  const e=Number(i.edad)||0;
  let max:string; let c:string;
  if (e<2) { max='0h (evitar)'; c='Solo videollamadas familia'; }
  else if (e<6) { max='1h'; c='Contenido de calidad, acompañar'; }
  else if (e<12) { max='2h'; c='Límites claros, sin pantallas mientras come'; }
  else { max='2-3h'; c='Ayudar a autorregular, charlar sobre consumo'; }
  return { maxDia:max, consejos:c, resumen:`Edad ${e}: máx ${max}. ${c}.` };
}
