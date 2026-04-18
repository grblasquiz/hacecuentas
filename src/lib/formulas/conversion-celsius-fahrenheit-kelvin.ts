export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionCelsiusFahrenheitKelvin(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const de=String(i.desde||'C'); const a=String(i.a||'F');
  let c:number;
  if (de==='C') c=v; else if (de==='F') c=(v-32)*5/9; else c=v-273.15;
  let r:number;
  if (a==='C') r=c; else if (a==='F') r=c*9/5+32; else r=c+273.15;
  return { resultado:`${r.toFixed(2)}°${a}`, resumen:`${v}°${de} = ${r.toFixed(2)}°${a}.` };
}
