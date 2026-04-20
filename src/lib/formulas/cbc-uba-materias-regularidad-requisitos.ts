export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function cbcUbaMateriasRegularidadRequisitos(i: Inputs): Outputs {
  const a=Number(i.asistenciaPorcentaje)||0; const p1=Number(i.parcial1)||0; const p2=Number(i.parcial2)||0;
  let reg='';
  if(a<75) reg='Libre por asistencia';
  else if(p1<4||p2<4) reg='Libre por parciales (recuperatorio disponible)';
  else reg='Regular — rinde final';
  const prom=(p1+p2)/2;
  return { regularidad:reg, promedio:prom.toFixed(1), observacion:reg.includes('Regular')?'Continuá con final oral/escrito.':'Revisá tu caso con docente.' };
}
