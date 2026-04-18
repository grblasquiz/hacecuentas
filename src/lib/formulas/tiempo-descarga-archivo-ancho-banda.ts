export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoDescargaArchivoAnchoBanda(i: Inputs): Outputs {
  const mb=Number(i.tamano)||0; const mbps=Number(i.velocidad)||0;
  if (mbps===0) return { tiempo:'—', tiempoH:'—', resumen:'Velocidad no puede ser 0.' };
  const seg=mb*8/mbps;
  const h=Math.floor(seg/3600); const m=Math.floor((seg%3600)/60); const s=Math.round(seg%60);
  return { tiempo:`${seg.toFixed(1)} seg`, tiempoH:`${h}h ${m}m ${s}s`, resumen:`Descarga de ${mb}MB a ${mbps}Mbps = ${h}h ${m}m ${s}s.` };
}
