export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function saturacionOxigenoSpo2AltitudNormal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      normal: 'Normal',
      dentroDeRango: (a: number) => `Dentro de rango para altitud ${a}m`,
      ok: 'OK',
      leveHipoxia: 'Leve hipoxia',
      puedeNecesitar: 'Puede necesitar atención',
      consultaSiPersiste: 'Consulta si persiste o síntomas',
      hipoxiaSignificativa: 'Hipoxia significativa',
      menosde90: '<90% o equivalente',
      consultaMedica: 'Consulta médica inmediata',
    },
    en: {
      normal: 'Normal',
      dentroDeRango: (a: number) => `Within normal range for altitude ${a}m`,
      ok: 'OK',
      leveHipoxia: 'Mild hypoxia',
      puedeNecesitar: 'May need attention',
      consultaSiPersiste: 'Consult a doctor if it persists or symptoms appear',
      hipoxiaSignificativa: 'Significant hypoxia',
      menosde90: '<90% or equivalent',
      consultaMedica: 'Seek immediate medical attention',
    },
  } as const)[__lang];
  const s=Number(i.spo2)||0; const a=Number(i.altitudMetros)||0;
  let normalMin=95;
  if(a>3500) normalMin=88; else if(a>2500) normalMin=90; else if(a>1500) normalMin=93;
  let clas='', interp='', rec='';
  if(s>=normalMin&&s<=100){clas=T.normal;interp=T.dentroDeRango(a);rec=T.ok}
  else if(s>=normalMin-5){clas=T.leveHipoxia;interp=T.puedeNecesitar;rec=T.consultaSiPersiste}
  else {clas=T.hipoxiaSignificativa;interp=T.menosde90;rec=T.consultaMedica}
  return { clasificacion:clas, interpretacion:interp, recomendacion:rec };
}
