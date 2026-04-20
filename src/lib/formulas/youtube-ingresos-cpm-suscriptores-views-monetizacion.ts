export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function youtubeIngresosCpmSuscriptoresViewsMonetizacion(i: Inputs): Outputs {
  const v=Number(i.viewsMensuales)||0; const c=Number(i.cpm)||0; const n=String(i.nicho||'general');
  const cpmMult={'general':1,'finanzas':4,'tecnologia':2,'gaming':0.7,'educacion':3,'cocina':2}[n];
  const cpmEst=c*cpmMult;
  const ingAds=v/1000*cpmEst*0.55;
  return { ingresoAds:`USD ${Math.round(ingAds)}`, cpmEstimado:`CPM nicho USD ${cpmEst.toFixed(1)}`, total:`USD ${Math.round(ingAds).toLocaleString('en-US')}/mes` };
}
