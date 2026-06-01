export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function a1cHemoglobinaGlicosiladaDiabetes(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      normal: 'Normal',
      prediabetes: 'Prediabetes',
      diabetes: 'Diabetes',
      diabetesMalControlada: 'Diabetes mal controlada',
      bajo: 'Bajo',
      medio: 'Medio',
      alto: 'Alto',
      muyAlto: 'Muy alto',
      insightTitle: 'Glucosa promedio estimada',
      insightText: (g: number, clas: string) =>
        `Un A1c de **${h}%** equivale a una glucosa promedio de **${g} mg/dL** en los últimos 2-3 meses, en rango **${clas}**.`,
      insightNormal: ' Valores así son los esperados.',
      insightPre: ' Conviene revisar hábitos y repetir el control.',
      insightDiab: ' Está por encima de la meta habitual (< 7%): hablalo con tu médico.',
      scaleAria: (clas: string) => `Escala de hemoglobina glicosilada A1c: tu valor ${h}% en la zona ${clas}.`,
    },
    en: {
      normal: 'Normal',
      prediabetes: 'Prediabetes',
      diabetes: 'Diabetes',
      diabetesMalControlada: 'Poorly controlled diabetes',
      bajo: 'Low',
      medio: 'Medium',
      alto: 'High',
      muyAlto: 'Very high',
      insightTitle: 'Estimated average glucose',
      insightText: (g: number, clas: string) =>
        `An A1c of **${h}%** equals an average glucose of **${g} mg/dL** over the last 2-3 months, in the **${clas}** range.`,
      insightNormal: ' These values are what you want to see.',
      insightPre: ' Worth reviewing habits and repeating the test.',
      insightDiab: ' It is above the usual target (< 7%): talk to your doctor.',
      scaleAria: (clas: string) => `Glycated hemoglobin A1c scale: your value ${h}% in the ${clas} zone.`,
    },
  } as const)[__lang];
  const h=Number(i.hba1c)||0; const g=28.7*h-46.7;
  let clas='', riesgo='', tone: 'good'|'warn'|'neutral'='neutral', suffix='';
  if(h<5.7){clas=T.normal;riesgo=T.bajo;tone='good';suffix=T.insightNormal}
  else if(h<6.5){clas=T.prediabetes;riesgo=T.medio;tone='neutral';suffix=T.insightPre}
  else if(h<8){clas=T.diabetes;riesgo=T.alto;tone='warn';suffix=T.insightDiab}
  else {clas=T.diabetesMalControlada;riesgo=T.muyAlto;tone='warn';suffix=T.insightDiab}
  const gRound = Math.round(g);
  const _insight = {
    title: T.insightTitle,
    text: T.insightText(gRound, clas) + suffix,
    tone,
    icon: '🩸',
  };
  const _chart = {
    type: 'scale',
    marker: h,
    markerLabel: `${h}%`,
    min: 4,
    segments: [
      { nombre: T.normal, max: 5.7, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: T.prediabetes, max: 6.5, color: '#eab308', colorDark: '#facc15' },
      { nombre: T.diabetes, max: 8, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: T.diabetesMalControlada, max: Math.max(9, Math.ceil(h) + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: T.scaleAria(clas),
  };
  return { glucosaPromedio:`${gRound} mg/dL`, clasificacion:clas, riesgo:riesgo, _insight, _chart };
}
