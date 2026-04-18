export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function presionNeumaticoPsiBarAuto(i: Inputs): Outputs {
  const v=Number(i.v)||0; const de=String(i.de||'psi');
  let bar:number;
  if (de==='psi') bar=v/14.504; else if (de==='kpa') bar=v/100; else bar=v;
  return { psi:`${(bar*14.504).toFixed(1)} PSI`, bar:`${bar.toFixed(2)} bar`, kpa:`${(bar*100).toFixed(0)} kPa`, resumen:`${v} ${de} = ${bar.toFixed(2)} bar.` };
}
