export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; }
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
      insightTitle: 'Qué significa tu SpO2',
      insightGood: (s: number, min: number, a: number) => `Una SpO2 de **${s}%** está dentro de lo normal para una altitud de **${a} m** (mínimo esperado **${min}%**). El oxígeno en sangre es adecuado.`,
      insightMild: (s: number, min: number, a: number) => `Una SpO2 de **${s}%** está apenas por debajo de lo esperado a **${a} m** (mínimo **${min}%**). Volvé a medir en reposo; si persiste o hay síntomas, consultá.`,
      insightLow: (s: number, min: number, a: number) => `Una SpO2 de **${s}%** indica **hipoxia significativa** para **${a} m** (mínimo esperado **${min}%**). Consultá de inmediato.`,
      segNormal: 'Normal', segLeve: 'Leve hipoxia', segSign: 'Hipoxia significativa',
      markerLabel: (s: number) => `Tu SpO2: ${s}%`,
      ariaScale: 'Escala de saturación de oxígeno ajustada por altitud: hipoxia significativa, leve y normal.',
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
      insightTitle: 'What your SpO2 means',
      insightGood: (s: number, min: number, a: number) => `An SpO2 of **${s}%** is within the normal range for an altitude of **${a} m** (expected minimum **${min}%**). Blood oxygen is adequate.`,
      insightMild: (s: number, min: number, a: number) => `An SpO2 of **${s}%** is just below the expected level at **${a} m** (minimum **${min}%**). Re-measure at rest; if it persists or symptoms appear, see a doctor.`,
      insightLow: (s: number, min: number, a: number) => `An SpO2 of **${s}%** indicates **significant hypoxia** for **${a} m** (expected minimum **${min}%**). Seek care immediately.`,
      segNormal: 'Normal', segLeve: 'Mild hypoxia', segSign: 'Significant hypoxia',
      markerLabel: (s: number) => `Your SpO2: ${s}%`,
      ariaScale: 'Altitude-adjusted oxygen saturation scale: significant hypoxia, mild and normal.',
    },
  } as const)[__lang];
  const s=Number(i.spo2)||0; const a=Number(i.altitudMetros)||0;
  let normalMin=95;
  if(a>3500) normalMin=88; else if(a>2500) normalMin=90; else if(a>1500) normalMin=93;
  let clas='', interp='', rec='', tone='', insightText='';
  if(s>=normalMin&&s<=100){clas=T.normal;interp=T.dentroDeRango(a);rec=T.ok;tone='good';insightText=T.insightGood(s,normalMin,a)}
  else if(s>=normalMin-5){clas=T.leveHipoxia;interp=T.puedeNecesitar;rec=T.consultaSiPersiste;tone='warn';insightText=T.insightMild(s,normalMin,a)}
  else {clas=T.hipoxiaSignificativa;interp=T.menosde90;rec=T.consultaMedica;tone='warn';insightText=T.insightLow(s,normalMin,a)}

  const chart = {
    type: 'scale' as const,
    marker: s,
    markerLabel: T.markerLabel(s),
    min: Math.min(70, Math.floor(s) - 1),
    unit: '%',
    segments: [
      { nombre: T.segSign, max: normalMin - 5, color: '#fecaca', colorDark: '#b91c1c' },
      { nombre: T.segLeve, max: normalMin, color: '#fde68a', colorDark: '#b45309' },
      { nombre: T.segNormal, max: Math.max(100, Math.ceil(s) + 1), color: '#bbf7d0', colorDark: '#166534' },
    ],
    ariaLabel: T.ariaScale,
  };

  return {
    clasificacion:clas, interpretacion:interp, recomendacion:rec,
    _chart: chart,
    _insight: { title: T.insightTitle, text: insightText, tone, icon: tone === 'good' ? '🫁' : '⚠️' },
  };
}
