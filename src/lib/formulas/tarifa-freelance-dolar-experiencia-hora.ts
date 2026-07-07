export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tarifaFreelanceDolarExperienciaHora(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const a=Number(i.experienciaAnos)||0; const ar=String(i.area||'fullstack');
  const base=a<2?20:a<5?40:a<10?70:110;
  const mult={'frontend':1,'backend':1.1,'fullstack':1.15,'devops':1.3,'data':1.35,'design':1,'pm':1.2,'marketing':0.9}[ar];
  const rate=Math.round(base*mult);
  const rateMax=Math.round(rate*1.5);
  const mes=rate*160;
  const promedioMensual = __lang === 'en'
    ? `USD ${mes.toLocaleString('en-US')}/month (160h)`
    : `USD ${mes.toLocaleString('en-US')}/mes (160h)`;
  const observacion = __lang === 'en'
    ? `${a} years in ${ar}: typical international market range ${rate}-${rateMax} USD/h.`
    : `${a} años en ${ar}: rango ${rate}-${rateMax} USD/h típico mercado internacional.`;

  const mesMax = rateMax * 160;
  const seniorityEs = a < 2 ? 'junior' : a < 5 ? 'semi-senior' : a < 10 ? 'senior' : 'lead/experto';
  const seniorityEn = a < 2 ? 'junior' : a < 5 ? 'mid-level' : a < 10 ? 'senior' : 'lead/expert';
  const _insight = {
    title: __lang === 'en' ? 'How to use this range' : 'Cómo usar este rango',
    text: __lang === 'en'
      ? `As a **${seniorityEn}** in **${ar}**, the market pays **USD ${rate}–${rateMax}/h**: full-time that's **USD ${mes.toLocaleString('en-US')}–${mesMax.toLocaleString('en-US')}/month**. Open negotiations near the top (**USD ${rateMax}/h**) — it's easier to drop than to raise.`
      : `Como **${seniorityEs}** en **${ar}**, el mercado paga **USD ${rate}–${rateMax}/h**: a tiempo completo son **USD ${mes.toLocaleString('en-US')}–${mesMax.toLocaleString('en-US')}/mes**. Arrancá negociando cerca del techo (**USD ${rateMax}/h**): siempre es más fácil bajar que subir.`,
    tone: 'good',
    icon: '💵',
  };

  return { rangoHora:`USD ${rate}-${rateMax}/h`, promedioMensual, observacion, _insight };
}
