export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function sueldoProgramadorDesarrolladorArgentinaSeniority(i: Inputs): Outputs {
  const s=String(i.seniority||'jr'); const m=String(i.modo||'relacion'); const d=Number(i.dolar)||1400;
  const rangosUsd: Record<string,[number,number]> = {
    trainee:[700,1200], jr:[1200,2200], ssr:[2200,3500], sr:[3500,5500], lead:[5000,8000], arch:[7000,12000]
  };
  const [minU,maxU]=rangosUsd[s]||rangosUsd.jr;
  let minAr:number, maxAr:number;
  if (m==='relacion') { minAr=minU*d*0.55; maxAr=maxU*d*0.55; }
  else if (m==='mono') { minAr=minU*d*0.80; maxAr=maxU*d*0.80; }
  else { minAr=minU*d; maxAr=maxU*d; }
  return { rangoAr:`$${Math.round(minAr).toLocaleString('es-AR')} - $${Math.round(maxAr).toLocaleString('es-AR')}`, rangoUsd:`USD ${minU}-${maxU}`, resumen:`${s} ${m}: ${m==='freelanceUSD'?'USD '+minU+'-'+maxU:'$'+Math.round(minAr).toLocaleString('es-AR')+'-'+Math.round(maxAr).toLocaleString('es-AR')}.` };
}
