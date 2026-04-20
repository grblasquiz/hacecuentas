export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function rugbyHandicapPuntosDescensoPromedio(i: Inputs): Outputs {
  const p=Number(i.puntosGanados)||0; const pj=Number(i.partidosJugados)||1;
  const prom=p/pj;
  let clas='', riesgo='';
  if(prom>=3){clas='Clasifica Copa de Oro';riesgo='Nulo'}
  else if(prom>=2.2){clas='Salvación cómoda';riesgo='Bajo'}
  else if(prom>=1.8){clas='Zona de riesgo';riesgo='Medio'}
  else {clas='Descenso probable';riesgo='Alto'}
  return { promedio:`${prom.toFixed(2)}`, clasificacion:clas, riesgoDescenso:riesgo };
}
