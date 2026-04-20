export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function diasVacacionesGanadasAntiguedadLct(i: Inputs): Outputs {
  const a=Number(i.antiguedadMeses)||0; const anios=a/12;
  let d=0, t='';
  if(anios<0.5){d=Math.floor(a);t='proporcional primer año'}
  else if(anios<=5){d=14;t='hasta 5 años'}
  else if(anios<=10){d=21;t='5-10 años'}
  else if(anios<=20){d=28;t='10-20 años'}
  else {d=35;t='más de 20 años'}
  return { dias:`${d} días corridos`, interpretacion:`Con ${anios.toFixed(1)} años (${a} meses) de antigüedad: ${d} días (tramo: ${t}).` };
}
