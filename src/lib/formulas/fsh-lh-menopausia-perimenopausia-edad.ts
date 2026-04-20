export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function fshLhMenopausiaPerimenopausiaEdad(i: Inputs): Outputs {
  const f=Number(i.fsh)||0; const l=Number(i.lh)||0; const e=Number(i.edad)||0;
  let etapa='', interp='', rec='';
  if(f>=30&&e>=45){etapa='Menopausia establecida';interp='FSH elevada sostenida';rec='Terapia síntomas si aplican'}
  else if(f>=15&&f<30){etapa='Perimenopausia';interp='Transición hormonal';rec='Control ginecológico, evaluar síntomas'}
  else if(f<10){etapa='Pre-menopausia normal';interp='Función ovárica normal';rec='Controles de rutina'}
  else {etapa='Variable';interp='Interpretación según contexto clínico';rec='Consultar ginecólogo'}
  return { etapa:etapa, interpretacion:interp, recomendacion:rec };
}
