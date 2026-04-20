export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function adolescenteEstaturaFinalPrediccionEdadHuesos(i: Inputs): Outputs {
  const e=Number(i.edad)||0; const s=String(i.sexo||'varon'); const a=Number(i.alturaActualCm)||0;
  const p=Number(i.alturaPadre)||0; const m=Number(i.alturaMadre)||0;
  let estGenetica=0;
  if(s==='varon') estGenetica=(p+m+13)/2;
  else estGenetica=(p+m-13)/2;
  let estAproxEdad=0;
  if(s==='varon'){ estAproxEdad=e<13?a+((18-e)*4):a+((18-e)*2) }
  else { estAproxEdad=e<11?a+((16-e)*3):a+((16-e)*1.5) }
  const prom=(estGenetica+estAproxEdad)/2;
  return { estaturaFinal:`${Math.round(prom)} cm`, rango:`${Math.round(prom-5)}-${Math.round(prom+5)} cm (±5 cm)`, observacion:'Aproximación. Nutrición, genética y pubertad afectan.' };
}
