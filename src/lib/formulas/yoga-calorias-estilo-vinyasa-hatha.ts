export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function yogaCaloriasEstiloVinyasaHatha(i: Inputs): Outputs {
  const e=String(i.estilo||'vinyasa'); const p=Number(i.pesoKg)||0; const m=Number(i.minutos)||0;
  const met={'hatha':2.5,'vinyasa':4,'ashtanga':4.5,'bikram':5,'yin':2}[e];
  const cal=met*p*m/60;
  const ben={'hatha':'Flexibilidad + calma','vinyasa':'Cardio suave + fuerza','ashtanga':'Disciplina + fuerza','bikram':'Detox + flexibilidad','yin':'Relajación profunda'}[e];
  return { caloriasQuemadas:`${Math.round(cal)} kcal`, beneficio:ben, intensidad:met>3?'Moderada-Alta':'Suave' };
}
