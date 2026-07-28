export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function youtubeIngresosCpmSuscriptoresViewsMonetizacion(i: Inputs): Outputs {
  const v=Number(i.viewsMensuales)||0; const c=Number(i.cpm)||0; const n=String(i.nicho||'general');
  // CPM absoluto típico por nicho (USD), consistente con youtube-cpm-por-nicho.ts.
  const cpmNicho:Record<string,number>={'general':3,'finanzas':12,'tecnologia':6,'gaming':2.1,'educacion':9,'cocina':6};
  // Si el usuario carga su CPM real, se usa tal cual: NO se multiplica por el nicho.
  const cpmEst=c>0?c:(cpmNicho[n]??3);
  const ingAds=v/1000*cpmEst*0.55;
  const anual=Math.round(ingAds*12);
  const _insight = {
    title: 'Tu ingreso estimado por ads',
    text: `Con **${v.toLocaleString('es-AR')}** views/mes en el nicho **${n}** (CPM USD ${cpmEst.toFixed(1)}), YouTube te paga ~**USD ${Math.round(ingAds).toLocaleString('es-AR')}/mes** (ya descontado el 45% que se queda la plataforma). Eso son **USD ${anual.toLocaleString('es-AR')}** al año.`,
    tone: 'neutral',
    icon: '💰',
  };
  return { ingresoAds:`USD ${Math.round(ingAds)}`, cpmEstimado:`CPM USD ${cpmEst.toFixed(1)}`, total:`USD ${Math.round(ingAds).toLocaleString('en-US')}/mes`, _insight };
}
