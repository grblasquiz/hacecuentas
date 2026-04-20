export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function bienesPersonalesMinimoNoImponible2026(i: Inputs): Outputs {
  const p=Number(i.patrimonio)||0; const m=Number(i.mni)||0; const v=Number(i.aliVivienda)||0;
  const baseImponible=Math.max(0, p-m-v);
  let imp=0; let ant=0;
  const tramos=[[250000000,0.005],[500000000,0.0075],[1000000000,0.01],[2000000000,0.0125],[Infinity,0.0175]];
  let r=baseImponible;
  for (const [tope,tasa] of tramos){ const seg=Math.min(r,(tope as number)-ant); if(seg<=0) break; imp+=seg*(tasa as number); r-=seg; ant=tope as number; if(r<=0) break; }
  const alic=p>0?(imp/p*100):0;
  return { impuesto:`$${Math.round(imp).toLocaleString('es-AR')}`, alicuota:`${alic.toFixed(2)}%`, interpretacion:`Con patrimonio $${(p/1e6).toFixed(0)}M y MNI $${(m/1e6).toFixed(0)}M: impuesto anual ~$${(imp/1e6).toFixed(2)}M.` };
}
