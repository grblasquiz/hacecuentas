export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function dietaHipocaloricaDeficitSaludableMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      agresivo: 'Agresivo — considera más semanas',
      moderado: 'Moderado — saludable',
      conservador: 'Conservador — sostenible',
      insightTitle: 'Tu déficit semanal',
      insightAgr: (kg: string, kcal: number) => `Bajar **${kg} kg por semana** exige un déficit de ~**${kcal} kcal por día**: es un ritmo **agresivo**. Sostenido suele costar masa muscular y rebote — estirá el plazo unas semanas para aflojar la exigencia.`,
      insightMod: (kg: string, kcal: number) => `Perder **${kg} kg por semana** con ~**${kcal} kcal/día** de déficit cae en la franja **saludable y sostenible** que recomiendan los nutricionistas (0,5–1 kg/sem). Buen equilibrio entre resultado y adherencia.`,
      insightCon: (kg: string, kcal: number) => `**${kg} kg por semana** (~**${kcal} kcal/día**) es un ritmo **conservador**: más lento pero muy fácil de mantener y con bajísimo riesgo de rebote. Ideal si priorizás constancia.`,
      scaleLabel: (kg: string) => `${kg} kg/sem`,
      segLento: 'Conservador',
      segSano: 'Saludable',
      segAgr: 'Agresivo',
      aria: (kg: string) => `Pérdida de peso semanal: ${kg} kg por semana.`,
    },
    en: {
      agresivo: 'Aggressive — consider more weeks',
      moderado: 'Moderate — healthy',
      conservador: 'Conservative — sustainable',
      insightTitle: 'Your weekly deficit',
      insightAgr: (kg: string, kcal: number) => `Losing **${kg} kg per week** demands a deficit of ~**${kcal} kcal per day**: that's an **aggressive** pace. Sustained, it tends to cost muscle and cause rebound — stretch the timeline a few weeks to ease off.`,
      insightMod: (kg: string, kcal: number) => `Losing **${kg} kg per week** with a ~**${kcal} kcal/day** deficit lands in the **healthy, sustainable** range nutritionists recommend (0.5–1 kg/wk). A solid balance of results and adherence.`,
      insightCon: (kg: string, kcal: number) => `**${kg} kg per week** (~**${kcal} kcal/day**) is a **conservative** pace: slower but very easy to keep up, with minimal rebound risk. Ideal if you value consistency.`,
      scaleLabel: (kg: string) => `${kg} kg/wk`,
      segLento: 'Conservative',
      segSano: 'Healthy',
      segAgr: 'Aggressive',
      aria: (kg: string) => `Weekly weight loss: ${kg} kg per week.`,
    },
  } as const)[__lang];
  const pa=Number(i.pesoActual)||0; const po=Number(i.pesoObjetivo)||0; const s=Number(i.semanasObjetivo)||1;
  const diff=pa-po;
  const perdidaSem=diff/s;
  const deficitDia=perdidaSem*1100;
  let riesgo='';
  if(perdidaSem>1) riesgo=T.agresivo;
  else if(perdidaSem>0.5) riesgo=T.moderado;
  else riesgo=T.conservador;

  const kgStr = perdidaSem.toFixed(2);
  const kcalR = Math.round(deficitDia);
  const tone: 'good' | 'warn' | 'neutral' = perdidaSem > 1 ? 'warn' : perdidaSem > 0.5 ? 'good' : 'neutral';
  const insightText = perdidaSem > 1 ? T.insightAgr(kgStr, kcalR) : perdidaSem > 0.5 ? T.insightMod(kgStr, kcalR) : T.insightCon(kgStr, kcalR);
  const _insight = { title: T.insightTitle, text: insightText, tone, icon: '⚖️' };

  const markerVal = Math.max(0, perdidaSem);
  const segMax = Math.max(2, Math.ceil(markerVal * 10) / 10 + 0.2);
  const _chart = {
    type: 'scale',
    marker: markerVal,
    markerLabel: T.scaleLabel(kgStr),
    min: 0,
    segments: [
      { nombre: T.segLento, max: 0.5, color: '#bae6fd', colorDark: '#0284c7' },
      { nombre: T.segSano, max: 1, color: '#22c55e', colorDark: '#16a34a' },
      { nombre: T.segAgr, max: segMax, color: '#ef4444', colorDark: '#dc2626' },
    ],
    ariaLabel: T.aria(kgStr),
  };

  return { deficitDiario:`${kcalR} kcal`, perdidaSemanal:`${kgStr} kg`, riesgo:riesgo, _insight, _chart };
}
