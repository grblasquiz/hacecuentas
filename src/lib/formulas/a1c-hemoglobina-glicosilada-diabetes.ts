export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function a1cHemoglobinaGlicosiladaDiabetes(i: Inputs): Outputs {
  const h=Number(i.hba1c)||0; const g=28.7*h-46.7;
  let clas='', riesgo='';
  if(h<5.7){clas='Normal';riesgo='Bajo'}
  else if(h<6.5){clas='Prediabetes';riesgo='Medio'}
  else if(h<8){clas='Diabetes';riesgo='Alto'}
  else {clas='Diabetes mal controlada';riesgo='Muy alto'}
  return { glucosaPromedio:`${Math.round(g)} mg/dL`, clasificacion:clas, riesgo:riesgo };
}
