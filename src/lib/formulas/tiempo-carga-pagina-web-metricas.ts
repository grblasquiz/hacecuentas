export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoCargaPaginaWebMetricas(i: Inputs): Outputs {
  const lcp=Number(i.lcp)||0; const fid=Number(i.fid)||0; const cls=Number(i.cls)||0;
  const e=(v:number,good:number,ok:number)=>v<=good?'Bien':v<=ok?'Mejorar':'Pobre';
  return { lcpEval:`${lcp}ms - ${e(lcp,2500,4000)}`, fidEval:`${fid}ms - ${e(fid,100,300)}`, clsEval:`${cls} - ${e(cls,0.1,0.25)}`, resumen:`LCP ${e(lcp,2500,4000)}, FID ${e(fid,100,300)}, CLS ${e(cls,0.1,0.25)}.` };
}
