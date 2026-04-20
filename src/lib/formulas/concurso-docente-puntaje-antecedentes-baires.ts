export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function concursoDocentePuntajeAntecedentesBaires(i: Inputs): Outputs {
  const t=Number(i.titulos)||0; const a=Number(i.antiguedad)||0; const p=Number(i.publicaciones)||0; const c=Number(i.cursos)||0;
  const tot=t+a+p+c;
  let n='', rec='';
  if(tot>=80){n='Alto';rec='Muy competitivo'}
  else if(tot>=50){n='Medio';rec='Competitivo'}
  else if(tot>=30){n='Básico';rec='Sumá cursos y antigüedad'}
  else {n='Inicial';rec='Suma formación'}
  return { puntajeTotal:`${tot} puntos`, nivelAproximado:n, recomendacion:rec };
}
