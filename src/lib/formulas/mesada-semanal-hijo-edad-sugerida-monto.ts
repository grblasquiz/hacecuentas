export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mesadaSemanalHijoEdadSugeridaMonto(i: Inputs): Outputs {
  const e=Number(i.edad)||0; const n=String(i.nivelVida||'medio');
  const mult={'basico':1,'medio':2,'alto':4}[n];
  const sem=e*1000*mult;
  const mes=sem*4.33;
  return { mesadaSemanal:`$${Math.round(sem).toLocaleString('es-AR')}`, mensualEquivalente:`$${Math.round(mes).toLocaleString('es-AR')}`, proposito:'Educación financiera desde temprano. 10-20% ahorro obligatorio.' };
}
