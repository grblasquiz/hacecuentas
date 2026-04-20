export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function saturacionOxigenoSpo2AltitudNormal(i: Inputs): Outputs {
  const s=Number(i.spo2)||0; const a=Number(i.altitudMetros)||0;
  let normalMin=95;
  if(a>3500) normalMin=88; else if(a>2500) normalMin=90; else if(a>1500) normalMin=93;
  let clas='', interp='', rec='';
  if(s>=normalMin&&s<=100){clas='Normal';interp=`Dentro de rango para altitud ${a}m`;rec='OK'}
  else if(s>=normalMin-5){clas='Leve hipoxia';interp='Puede necesitar atención';rec='Consulta si persiste o síntomas'}
  else {clas='Hipoxia significativa';interp='<90% o equivalente';rec='Consulta médica inmediata'}
  return { clasificacion:clas, interpretacion:interp, recomendacion:rec };
}
