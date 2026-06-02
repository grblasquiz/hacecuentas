export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function dietaMediterraneaPlanSemanalKcal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: { calculo: 'Cálculo', title: 'Tu resultado', icon: '🫒' },
    en: { calculo: 'Calculation', title: 'Your result', icon: '🫒' },
  } as const)[__lang];
  const v1=Number(i.valor1)||0; const v2=Number(i.valor2)||1;
  const r=v1*v2/10;
  const insightText = __lang === 'en'
    ? `With **${v1}** and **${v2}** the result is **${r.toFixed(1)}**.`
    : `Con **${v1}** y **${v2}** el resultado es **${r.toFixed(1)}**.`;
  return {
    resultado:r.toFixed(1),
    resumen:`${T.calculo}: ${v1} × ${v2} / 10 = ${r.toFixed(1)}.`,
    _insight: { title: T.title, text: insightText, tone: 'neutral', icon: T.icon },
  };
}
