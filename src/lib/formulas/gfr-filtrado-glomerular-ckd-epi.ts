export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function gfrFiltradoGlomerularCkdEpi(i: Inputs): Outputs {
  const c=Number(i.creatinina)||0; const e=Number(i.edad)||0; const sx=String(i.sexo||'hombre');
  const k=sx==='hombre'?0.9:0.7; const a=sx==='hombre'?-0.302:-0.241;
  const min=Math.min(c/k,1); const max=Math.max(c/k,1);
  const gfr=142*Math.pow(min,a)*Math.pow(max,-1.200)*Math.pow(0.9938,e)*(sx==='mujer'?1.012:1);
  let etapa='', rec='';
  if(gfr>=90){etapa='G1 Normal';rec='Controles anuales'}
  else if(gfr>=60){etapa='G2 Leve';rec='Identificar causa, controlar'}
  else if(gfr>=45){etapa='G3a Moderada';rec='Nefrólogo'}
  else if(gfr>=30){etapa='G3b Moderada-severa';rec='Nefrólogo activo'}
  else if(gfr>=15){etapa='G4 Severa';rec='Preparar terapia renal'}
  else {etapa='G5 Falla renal';rec='Diálisis o trasplante'}
  return { gfr:`${Math.round(gfr)} mL/min/1.73m²`, etapa:etapa, recomendacion:rec };
}
