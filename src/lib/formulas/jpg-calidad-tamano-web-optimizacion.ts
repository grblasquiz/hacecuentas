export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function jpgCalidadTamanoWebOptimizacion(i: Inputs): Outputs {
  const mp=Number(i.mpx)||0; const q=Number(i.calidad)||85;
  const kb=mp*120*(q/85)**1.5;
  let rec='OK'; if (q>=95) rec='Excesivo para web'; else if (q<70) rec='Artefactos visibles';
  return { tamano:`${kb.toFixed(0)} KB`, recomendacion:rec, resumen:`${mp}MP a ${q}% ≈ ${kb.toFixed(0)} KB.` };
}
