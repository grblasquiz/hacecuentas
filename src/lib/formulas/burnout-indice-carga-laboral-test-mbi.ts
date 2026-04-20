export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function burnoutIndiceCargaLaboralTestMbi(i: Inputs): Outputs {
  const ce=Number(i.cansancioEmocional)||0; const dp=Number(i.despersonalizacion)||0; const rp=Number(i.realizacionPersonal)||0;
  const burnout=(ce+dp+(10-rp))/3;
  let nivel='', interp='', rec='';
  if(burnout<4){nivel='Bajo';interp='Sin signos burnout';rec='Mantené hábitos saludables'}
  else if(burnout<6){nivel='Moderado';interp='Señales iniciales';rec='Descanso + asesoría. Establecer límites laborales.'}
  else if(burnout<8){nivel='Alto';interp='Burnout claro';rec='Licencia preventiva + tratamiento psicológico'}
  else {nivel='Severo';interp='Crisis';rec='Intervención urgente. No trabajar hasta estabilizar.'}
  return { nivel:nivel, interpretacion:interp, recomendacion:rec };
}
