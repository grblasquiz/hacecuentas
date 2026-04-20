export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function streamerGananciasTwitchYoutubeViewersAfiliacion(i: Inputs): Outputs {
  const v=Number(i.viewersPromedio)||0; const h=Number(i.horasMensuales)||0; const p=String(i.plataforma||'twitch');
  const convRate={'twitch':0.08,'youtube':0.03,'kick':0.05}[p];
  const subs=Math.round(v*convRate);
  const subRev=p==='twitch'?subs*2.5:p==='youtube'?subs*2:subs*4.5;
  const hoursAdViews=h*v*0.15;
  const adsRev=hoursAdViews/1000*4;
  const donaciones=h*3;
  const total=subRev+adsRev+donaciones;
  return { subsEstimadas:`${subs} subs (USD ${Math.round(subRev)})`, adsEstimadas:`USD ${Math.round(adsRev)}`, ingresoTotal:`USD ${Math.round(total)}/mes` };
}
