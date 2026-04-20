export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function mbaRoiRetornoInversionArgentinaEvaluacion(i: Inputs): Outputs {
  const c=Number(i.costoMba)||0; const sa=Number(i.sueldoActual)||0; const sp=Number(i.sueldoPostEsperado)||0;
  const aumento=sp-sa;
  const roi=aumento>0?c/aumento:Infinity;
  let rec='';
  if(roi<3) rec='ROI muy bueno. Hacelo si te interesa.';
  else if(roi<7) rec='ROI razonable. Pensalo bien si el network+oportunidades compensan.';
  else rec='ROI lento. Evaluá alternativas: master específico o online.';
  return { aumentoAnual:`USD ${aumento.toLocaleString('en-US')}/año`, roiAnios:`${roi.toFixed(1)} años`, recomendacion:rec };
}
