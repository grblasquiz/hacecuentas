export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function almacenamientoVideoBitrateDuracion(i: Inputs): Outputs {
  const br=Number(i.bitrate)||0; const min=Number(i.duracion)||0;
  const gb=(br*min*60)/8/1024;
  return { tamano:`${(gb*1024).toFixed(1)} MB`, gb:`${gb.toFixed(2)} GB`, resumen:`${min} min a ${br}Mbps = ${gb.toFixed(2)} GB.` };
}
