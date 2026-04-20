export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function estampilladoSelladoInmueblePbaCaba2026(i: Inputs): Outputs {
  const v=Number(i.valor)||0; const j=String(i.jurisdiccion||'pba');
  const aliq=j==='otra'?0.035:0.036;
  const sellos=v*aliq; const parte=sellos/2;
  const esc=v*0.02*1.21; // honorarios + IVA
  const total=sellos+esc;
  return { sellosTotal:`$${Math.round(sellos).toLocaleString('es-AR')}`, porParte:`$${Math.round(parte).toLocaleString('es-AR')}`, escrituracionTotal:`$${Math.round(total).toLocaleString('es-AR')} (sellos + honorarios + IVA)` };
}
