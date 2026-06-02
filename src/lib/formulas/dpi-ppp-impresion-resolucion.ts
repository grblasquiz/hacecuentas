export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function dpiPppImpresionResolucion(i: Inputs): Outputs {
  const ac=Number(i.anchoCm)||0; const al=Number(i.altoCm)||0; const dpi=Number(i.dpi)||300;
  const pxW=Math.round(ac/2.54*dpi); const pxH=Math.round(al/2.54*dpi);
  const mpx=pxW*pxH/1e6;
  const tone = dpi >= 300 ? 'good' : dpi >= 150 ? 'neutral' : 'warn';
  const text = dpi >= 300
    ? `A **${dpi} DPI** tenés calidad de imprenta: ${pxW}×${pxH} px (**${mpx.toFixed(1)} MP**) para imprimir nítido a ${ac}×${al} cm.`
    : dpi >= 150
    ? `**${dpi} DPI** alcanza para gigantografía o pósters vistos de lejos: ${pxW}×${pxH} px (${mpx.toFixed(1)} MP) a ${ac}×${al} cm. Para folletería de mano apuntá a 300.`
    : `**${dpi} DPI** es baja para impresión: ${pxW}×${pxH} px puede verse pixelado de cerca a ${ac}×${al} cm. Subí a 300 DPI para calidad de imprenta.`;
  const _insight = { title: 'Resolución de impresión', text, tone, icon: '🖨️' };
  return { px:`${pxW} x ${pxH} px`, mpx:`${mpx.toFixed(1)} MP`, resumen:`${ac}×${al}cm a ${dpi}DPI = ${pxW}×${pxH} px (${mpx.toFixed(1)} MP).`, _insight };
}
