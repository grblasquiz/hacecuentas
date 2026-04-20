export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function presionArterialClasificacionOms(i: Inputs): Outputs {
  const s=Number(i.sistolica)||0; const d=Number(i.diastolica)||0;
  let clas='', riesgo='', rec='';
  if(s>=180||d>=120){clas='Crisis hipertensiva';riesgo='EMERGENCIA';rec='Consulta urgente'}
  else if(s>=140||d>=90){clas='Hipertensión estadio 2';riesgo='Alto';rec='Tratamiento farmacológico probable'}
  else if(s>=130||d>=80){clas='Hipertensión estadio 1';riesgo='Medio-Alto';rec='Cambios de estilo + seguimiento'}
  else if(s>=120){clas='Presión elevada';riesgo='Medio';rec='Dieta, ejercicio, reducir sodio'}
  else {clas='Normal';riesgo='Bajo';rec='Mantener hábitos saludables'}
  return { clasificacion:clas, riesgo:riesgo, recomendacion:rec };
}
