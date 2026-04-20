export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function creatinaCargaMantenimientoPeso(i: Inputs): Outputs {
  const p=Number(i.pesoKg)||0; const f=String(i.fase||'mantenimiento');
  let d='', dur='', mom='';
  if(f==='carga'){d=`${(p*0.3).toFixed(1)} g/día`;dur='5-7 días';mom='4 tomas iguales con comida'}
  else if(f==='mantenimiento'){d='3-5 g/día';dur='Indefinido';mom='Cualquier momento, con o sin comida'}
  else {d='5 g/día';dur='Desde día 1 (saturación 3-4 semanas)';mom='Cualquier momento'}
  return { dosis:d, duracion:dur, momento:mom };
}
