export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function libretaSanitariaCostoHueriaFood(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      validez: '1 año',
      resumenTpl: (m: string, v: string) => `Libreta sanitaria ${m}: $${v}/año.`,
      insightTitle: 'Costo y vigencia',
      insightTpl: (m: string, v: string) => `La libreta sanitaria en **${m}** cuesta unos **$${v}** y vence al **año**, así que es un gasto anual de renovación obligatorio para manipular alimentos. El valor varía por municipio.`,
    },
    en: {
      validez: '1 year',
      resumenTpl: (m: string, v: string) => `Health permit ${m}: $${v}/year.`,
      insightTitle: 'Cost and validity',
      insightTpl: (m: string, v: string) => `The health permit in **${m}** costs about **$${v}** and expires after **1 year**, so it is a mandatory yearly renewal cost to handle food. The amount varies by municipality.`,
    },
  } as const)[__lang];
  const m=String(i.municipio||'caba');
  const c: Record<string,number> = { caba:15000, 'la-plata':12000, cba:13000, rosario:11000 };
  const val = (c[m]||15000).toLocaleString('es-AR');
  const _insight = {
    title: T.insightTitle,
    text: T.insightTpl(m, val),
    tone: 'neutral',
    icon: '🪪',
  };
  return { costo:'$'+val, validez: T.validez, resumen: T.resumenTpl(m, val), _insight };
}
