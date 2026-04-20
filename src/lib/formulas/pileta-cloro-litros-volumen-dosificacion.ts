export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function piletaCloroLitrosVolumenDosificacion(i: Inputs): Outputs {
  const l=Number(i.largoM)||0; const a=Number(i.anchoM)||0; const p=Number(i.profundidadM)||0;
  const ppm=Number(i.ppmObjetivo)||2;
  const vol=l*a*p*1000; // litros
  const cloro=vol/1000*ppm*2;
  return { volumen:`${Math.round(vol).toLocaleString('es-AR')} L`, cloroGranulos:`${Math.round(cloro)} g`, frecuencia:'Mantenimiento diario + shock semanal' };
}
