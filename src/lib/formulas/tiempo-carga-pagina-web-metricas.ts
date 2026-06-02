export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoCargaPaginaWebMetricas(i: Inputs): Outputs {
  const lcp=Number(i.lcp)||0; const fid=Number(i.fid)||0; const cls=Number(i.cls)||0;
  const e=(v:number,good:number,ok:number)=>v<=good?'Bien':v<=ok?'Mejorar':'Pobre';
  const evals=[e(lcp,2500,4000),e(fid,100,300),e(cls,0.1,0.25)];
  const bien=evals.filter(x=>x==='Bien').length;
  const pobre=evals.filter(x=>x==='Pobre').length;
  const tone=pobre>0?'warn':bien===3?'good':'neutral';
  const text=bien===3
    ?`Tus tres Core Web Vitals están en **verde** (LCP ${lcp}ms, FID ${fid}ms, CLS ${cls}): la página aprueba la experiencia que Google premia.`
    :`**${bien} de 3** Core Web Vitals están en verde${pobre>0?`, y **${pobre}** en rojo`:''} (LCP ${lcp}ms, FID ${fid}ms, CLS ${cls}). ${pobre>0?'Priorizá las métricas en "Pobre" para no perder ranking.':'Apuntá a llevar las de "Mejorar" a verde.'}`;
  return {
    lcpEval:`${lcp}ms - ${e(lcp,2500,4000)}`,
    fidEval:`${fid}ms - ${e(fid,100,300)}`,
    clsEval:`${cls} - ${e(cls,0.1,0.25)}`,
    resumen:`LCP ${e(lcp,2500,4000)}, FID ${e(fid,100,300)}, CLS ${e(cls,0.1,0.25)}.`,
    _insight:{ title:'Diagnóstico Core Web Vitals', text, tone, icon:'⚡' }
  };
}
