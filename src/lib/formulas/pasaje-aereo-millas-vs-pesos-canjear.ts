export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function pasajeAereoMillasVsPesosCanjear(i: Inputs): Outputs {
  const p=Number(i.pasajePesos)||0; const m=Number(i.millasRequeridas)||1;
  const valor=p/m;
  let conv='', rec='';
  if(valor>12){conv='Muy buen valor';rec='Canjealo. Milla mejor uso.'}
  else if(valor>8){conv='Buen valor';rec='Canjear conviene.'}
  else if(valor>5){conv='Valor medio';rec='Considerar si no necesitás millas para otro viaje.'}
  else {conv='Mal valor';rec='Paga en efectivo, guardá millas para pasajes más caros.'}
  return { valorMilla:`$${valor.toFixed(2)}/milla`, conviene:conv, recomendacion:rec };
}
