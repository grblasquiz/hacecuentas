export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: any; _insight?: any; }
export function seguroCaucionAlquilerCostoMensual(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      resumen: (a: number, p: number, prima: number) => `Alquiler $${a.toLocaleString('es-AR')} × ${p} meses: prima $${prima.toFixed(0)}.`,
      insTitle: 'Costo del seguro de caución',
      insText: (primaF: string, mensF: string, p: number, tasaPct: number) => `La prima única del seguro de caución es **$${primaF}** (${tasaPct}% del alquiler por un contrato de ${p} meses). Prorrateada equivale a **$${mensF}/mes**: un costo bajo frente a inmovilizar 1-2 meses de depósito en garantía.`,
    },
    en: {
      resumen: (a: number, p: number, prima: number) => `Rent $${a.toLocaleString('en-US')} × ${p} months: premium $${prima.toFixed(0)}.`,
      insTitle: 'Surety bond cost',
      insText: (primaF: string, mensF: string, p: number, tasaPct: number) => `The one-time surety bond premium is **$${primaF}** (${tasaPct}% of the rent for a ${p}-month lease). Spread out it equals **$${mensF}/month**: a low cost compared to locking up 1-2 months of rent as a deposit.`,
    },
  } as const)[__lang];
  const a=Number(i.alquilerMensual)||0; const p=Number(i.plazo)||24;
  const tasa=p===12?0.10:p===24?0.15:0.20;
  const prima=a*tasa;
  const primaF=prima.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const mensF=(prima/p).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  return {
    prima:'$'+primaF,
    mensualizada:'$'+mensF,
    resumen:T.resumen(a,p,prima),
    _insight: { title: T.insTitle, text: T.insText(primaF, mensF, p, Math.round(tasa*100)), tone: 'neutral', icon: '🏠' },
  };
}
