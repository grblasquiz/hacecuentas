export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function dpiPppImpresionResolucion(i: Inputs): Outputs {
  const ac=Number(i.anchoCm)||0; const al=Number(i.altoCm)||0; const dpi=Number(i.dpi)||300;
  const pxW=Math.round(ac/2.54*dpi); const pxH=Math.round(al/2.54*dpi);
  const mpx=pxW*pxH/1e6;
  return { px:`${pxW} x ${pxH} px`, mpx:`${mpx.toFixed(1)} MP`, resumen:`${ac}×${al}cm a ${dpi}DPI = ${pxW}×${pxH} px (${mpx.toFixed(1)} MP).` };
}
