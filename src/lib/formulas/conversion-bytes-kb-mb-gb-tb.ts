export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function conversionBytesKbMbGbTb(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const de=String(i.desde||'B'); const a=String(i.a||'B'); const sis=String(i.sistema||'bin');
  const base=sis==='bin'?1024:1000;
  const idx:Record<string,number>={B:0,KB:1,MB:2,GB:3,TB:4};
  const bytes=v*Math.pow(base,idx[de]);
  const r=bytes/Math.pow(base,idx[a]);
  return { resultado:`${r.toLocaleString()} ${a}`, resumen:`${v} ${de} = ${r.toLocaleString()} ${a} (${sis}).` };
}
