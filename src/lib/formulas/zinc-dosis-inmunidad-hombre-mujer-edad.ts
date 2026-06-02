export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function zincDosisInmunidadHombreMujerEdad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      forma: 'Picolinato o gluconato',
      advertenciaCorto: 'Solo uso corto (5-7 días). Tomar con comida.',
      advertenciaLargo: 'No exceder 40 mg/día largo plazo.',
      diasufijo: 'mg/día',
      insightTitle: 'Tu dosis de zinc sugerida',
      insightResfrio: (d: number) => `Para acortar un resfrío se usan dosis altas de **${d} mg/día**, pero **solo 5-7 días**: el límite seguro de largo plazo es 40 mg/día y el exceso interfiere con el cobre. Tomalo con comida.`,
      insightNormal: (d: number) => `Una dosis de **${d} mg/día** en forma de picolinato o gluconato cubre tu objetivo. No superes los **40 mg/día** de forma sostenida y tomalo con comida para evitar náuseas.`,
    },
    en: {
      forma: 'Picolinate or gluconate',
      advertenciaCorto: 'Short-term use only (5–7 days). Take with food.',
      advertenciaLargo: 'Do not exceed 40 mg/day long-term.',
      diasufijo: 'mg/day',
      insightTitle: 'Your suggested zinc dose',
      insightResfrio: (d: number) => `To shorten a cold, high doses of **${d} mg/day** are used, but **only 5–7 days**: the safe long-term limit is 40 mg/day and excess interferes with copper. Take it with food.`,
      insightNormal: (d: number) => `A dose of **${d} mg/day** as picolinate or gluconate covers your goal. Do not exceed **40 mg/day** on a sustained basis and take it with food to avoid nausea.`,
    },
  } as const)[__lang];
  const sx=String(i.sexo||'hombre'); const o=String(i.objetivo||'mantenimiento');
  let d=sx==='hombre'?11:8;
  if(o==='inmunidad') d=15;
  else if(o==='resfrio') d=50;
  else if(o==='embarazo') d=12;
  const esResfrio = o==='resfrio';
  const _insight = {
    title: T.insightTitle,
    text: esResfrio ? T.insightResfrio(d) : T.insightNormal(d),
    tone: esResfrio ? 'warn' : 'neutral',
    icon: '💊',
  };
  return { dosis:`${d} ${T.diasufijo}`, forma:T.forma, advertencia:o==='resfrio'?T.advertenciaCorto:T.advertenciaLargo, _insight };
}
