export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionHpKwCaballosKilowatts(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const de=String(i.desde||'hp');
  let kw:number;
  if (de==='hp') kw=v*0.7457; else if (de==='cv') kw=v*0.7355; else kw=v;
  return { hp:`${(kw/0.7457).toFixed(2)} HP`, kw:`${kw.toFixed(2)} kW`, cv:`${(kw/0.7355).toFixed(2)} CV`, resumen:`${v} ${de} = ${kw.toFixed(1)} kW.` };
}
