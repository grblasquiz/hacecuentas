export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function alturaAdultaHijoFormulaPadres(i: Inputs): Outputs {
  const pa=Number(i.papa)||0; const ma=Number(i.mama)||0; const s=String(i.sexo||'m');
  const base=s==='m'?(pa+ma+13)/2:(pa+ma-13)/2;
  return { estimada:`${base.toFixed(0)} cm`, rango:`${(base-8).toFixed(0)}-${(base+8).toFixed(0)} cm`, resumen:`Estimada: ${base.toFixed(0)}cm (±8cm genético).` };
}
