/** YT Shorts Fund ingreso */
export interface YoutubeShortsFundIngresoInputs { vistasMensualesShorts: number; rpmShorts: number; }
export interface YoutubeShortsFundIngresoOutputs { ingresoMensual: number; ingresoAnual: number; vistasPara1000: number; }
export function youtubeShortsFundIngreso(i: YoutubeShortsFundIngresoInputs): YoutubeShortsFundIngresoOutputs {
  const v=Number(i.vistasMensualesShorts), r=Number(i.rpmShorts);
  if (!v || v<=0) throw new Error('Vistas invalidas');
  if (!r || r<=0) throw new Error('RPM invalido');
  const m=(v/1000)*r;
  return { ingresoMensual:+m.toFixed(2), ingresoAnual:+(m*12).toFixed(2), vistasPara1000: Math.ceil(1000/r*1000) };
}
