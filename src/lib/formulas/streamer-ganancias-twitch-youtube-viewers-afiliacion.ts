export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function streamerGananciasTwitchYoutubeViewersAfiliacion(i: Inputs): Outputs {
  const v=Number(i.viewersPromedio)||0; const h=Number(i.horasMensuales)||0; const p=String(i.plataforma||'twitch');
  const convRate={'twitch':0.08,'youtube':0.03,'kick':0.05}[p];
  const subs=Math.round(v*convRate);
  const subRev=p==='twitch'?subs*2.5:p==='youtube'?subs*2:subs*4.5;
  const hoursAdViews=h*v*0.15;
  const adsRev=hoursAdViews/1000*4;
  const donaciones=h*3;
  const total=subRev+adsRev+donaciones;

  const totalR=Math.round(total);
  const subR=Math.round(subRev);
  const adsR=Math.round(adsRev);
  const donaR=totalR-subR-adsR; // cuadra exacto con el total mostrado
  const fuenteTop = subRev>=adsRev && subRev>=donaciones ? 'las suscripciones' : adsRev>=donaciones ? 'la publicidad' : 'las donaciones';
  const _insight = {
    title: 'Tu ingreso mensual estimado',
    text: `Con **${v} viewers promedio** y ${h} hs/mes en ${p}, podrías generar **USD ${totalR}/mes**: USD ${subR} de ${subs} subs, USD ${adsR} de ads y USD ${donaR > 0 ? donaR : 0} de donaciones. ${fuenteTop.charAt(0).toUpperCase()+fuenteTop.slice(1)} es tu mayor fuente de ingreso.`,
    tone: 'neutral',
    icon: '🎮',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Suscripciones', value: subR },
      { label: 'Publicidad (ads)', value: adsR },
      { label: 'Donaciones', value: donaR > 0 ? donaR : 0 },
    ],
    prefix: 'USD ',
    centerValue: `USD ${totalR}`,
    centerLabel: 'por mes',
    ariaLabel: `Ingreso mensual de USD ${totalR}: USD ${subR} de suscripciones, USD ${adsR} de publicidad y USD ${donaR > 0 ? donaR : 0} de donaciones`,
  };

  return { subsEstimadas:`${subs} subs (USD ${subR})`, adsEstimadas:`USD ${adsR}`, ingresoTotal:`USD ${totalR}/mes`, _insight, _chart };
}
