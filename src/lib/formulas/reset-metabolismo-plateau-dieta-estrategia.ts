export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function resetMetabolismoPlateauDietaEstrategia(i: Inputs): Outputs {
  const s=Number(i.semanasPlateau)||0; const d=Number(i.deficitActual)||0;
  let e='', dur='', exp='';
  if(s<2){e='Verificá primero cumplimiento real. Muchos subestiman calorías';dur='Seguir 1-2 semanas más';exp='Posible sigue funcionando'}
  else if(s<4){e='Diet break: come a calorías de mantenimiento 7-14 días';dur='7-14 días';exp='Reset hormonal, luego retomá déficit'}
  else {e='Revisar: subir NEAT (+2000 pasos), aumentar proteína, dormir 7+h, reducir estrés';dur='2-4 semanas cambios';exp='Retomar pérdida 0.3-0.5 kg/sem'}
  return { estrategia:e, duracion:dur, expectativa:exp };
}
