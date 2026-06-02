/** YT Shorts Fund ingreso */
export interface YoutubeShortsFundIngresoInputs { vistasMensualesShorts: number; rpmShorts: number; }
export interface YoutubeShortsFundIngresoOutputs { ingresoMensual: number; ingresoAnual: number; vistasPara1000: number; _insight?: any; }
export function youtubeShortsFundIngreso(i: YoutubeShortsFundIngresoInputs): YoutubeShortsFundIngresoOutputs {
  const v=Number(i.vistasMensualesShorts), r=Number(i.rpmShorts);
  if (!v || v<=0) throw new Error('Vistas invalidas');
  if (!r || r<=0) throw new Error('RPM invalido');
  const m=(v/1000)*r;
  const vp1k = Math.ceil(1000/r*1000);
  const _insight = {
    title: 'Tu ingreso por Shorts',
    text: `Con **${v.toLocaleString('es-AR')}** vistas/mes en Shorts a un RPM de **USD ${r}**, ganás ~**USD ${m.toFixed(2)}/mes** (**USD ${(m*12).toFixed(2)}/año**). Tené en cuenta que el RPM de Shorts es bajo: para juntar USD 1.000 necesitás **${vp1k.toLocaleString('es-AR')}** vistas.`,
    tone: 'neutral',
    icon: '📱',
  };
  return { ingresoMensual:+m.toFixed(2), ingresoAnual:+(m*12).toFixed(2), vistasPara1000: vp1k, _insight };
}
