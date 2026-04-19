export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function impuestoPaulistaIibbInfluencerRedes(i: Inputs): Outputs {
  const i_=Number(i.ingresos)||0; const p=String(i.provincia||'caba');
  const alic: Record<string,number> = { caba:0.04, pba:0.045, cba:0.05 };
  const a=alic[p]||0.04;
  const iibb=i_*a;
  return { iibb:'$'+iibb.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), alicuota:(a*100).toFixed(1)+'%', resumen:`$${i_.toLocaleString('es-AR')} en ${p.toUpperCase()}: IIBB $${iibb.toFixed(0)} (${(a*100).toFixed(1)}%).` };
}
