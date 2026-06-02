export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function piletaCloroLitrosVolumenDosificacion(i: Inputs): Outputs {
  const l=Number(i.largoM)||0; const a=Number(i.anchoM)||0; const p=Number(i.profundidadM)||0;
  const ppm=Number(i.ppmObjetivo)||2;
  const vol=l*a*p*1000; // litros
  const cloro=vol/1000*ppm*2;

  const volFmt=Math.round(vol).toLocaleString('es-AR');
  const cloroFmt=Math.round(cloro).toLocaleString('es-AR');
  const m3Fmt=Math.round(vol/1000).toLocaleString('es-AR');
  const _insight = {
    title: 'Dosis de cloro',
    text: `Tu pileta tiene unos **${m3Fmt} m³** (**${volFmt} L**). Para alcanzar **${ppm} ppm** de cloro libre agregá **${cloroFmt} g** de cloro granulado. Disolvelo y distribuilo con la bomba en marcha; medí el nivel antes de bañarte.`,
    tone: 'neutral',
    icon: '🏊',
  };

  return { volumen:`${Math.round(vol).toLocaleString('es-AR')} L`, cloroGranulos:`${Math.round(cloro)} g`, frecuencia:'Mantenimiento diario + shock semanal', _insight };
}
