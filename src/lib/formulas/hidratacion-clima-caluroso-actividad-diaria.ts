export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function hidratacionClimaCalurosoActividadDiaria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      vasos: (v: number) => `${v} vasos`,
      recordatorio: (ml: number) => `Divide en 8 tomas. Mañana 500 mL, cada hora ${Math.round(ml/16)} mL.`,
      insightTitle: 'Tu meta de hidratación',
      insightHot: (L: string, v: number, t: number) => `Apuntá a **${L} L** (${v} vasos). Con **${t}°C** tu cuerpo pierde más por sudor, así que tené la botella siempre a mano y no esperes a tener sed.`,
      insightMild: (L: string, v: number) => `Apuntá a **${L} L** (${v} vasos) repartidos durante el día. Arrancá con un par de vasos al despertar.`,
    },
    en: {
      vasos: (v: number) => `${v} glasses`,
      recordatorio: (ml: number) => `Split into 8 servings. Morning 500 mL, each hour ${Math.round(ml/16)} mL.`,
      insightTitle: 'Your hydration goal',
      insightHot: (L: string, v: number, t: number) => `Aim for **${L} L** (${v} glasses). At **${t}°C** your body loses more through sweat, so keep your bottle handy and don't wait until you're thirsty.`,
      insightMild: (L: string, v: number) => `Aim for **${L} L** (${v} glasses) spread through the day. Start with a couple of glasses when you wake up.`,
    },
  } as const)[__lang];
  const p=Number(i.pesoKg)||0; const t=Number(i.temperaturaC)||20; const a=Number(i.actividadMin)||0;
  let ml=p*35;
  if(t>25) ml*=1+(t-25)/5*0.15;
  ml+=a*17;
  const L=ml/1000; const v=Math.round(ml/250);
  const Lf = L.toFixed(1);
  const _insight = {
    title: T.insightTitle,
    text: t > 25 ? T.insightHot(Lf, v, t) : T.insightMild(Lf, v),
    tone: t >= 32 ? 'warn' : 'neutral',
    icon: t > 25 ? '🌡️' : '💧',
  };
  return { litrosDia:`${Lf} L`, vasos:T.vasos(v), recordatorio:T.recordatorio(ml), _insight };
}
