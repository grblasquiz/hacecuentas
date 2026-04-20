export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dashHipertensionSodioDiarioTabla(i: Inputs): Outputs {
  const t=String(i.tipoDash||'estandar');
  const na=t==='estricto'?1500:2300;
  const sal=na/400;
  return { sodioMaximo:`${na} mg/día`, equivalente:`${sal.toFixed(2)} g sal (1 cucharadita ≈ 2.3g)`, observacion:t==='estricto'?'Versión estricta: hipertensión severa o riesgo alto.':'Versión estándar para control PA general.' };
}
