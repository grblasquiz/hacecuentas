/** Interés simple: I = C × i × t */
export interface Inputs {
  capital: number;
  tasa: number;
  tiempo: number;
  unidad?: string;
  __lang?: string;
}
export interface Outputs {
  interes: number;
  montoFinal: number;
  interesMensual: number;
  interesDiario: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function interesSimple(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá capital, tasa y tiempo',
      years: 'años',
      insightTitle: 'Cuánto pesa el interés',
      capital: 'Capital',
      interes: 'Interés',
      total: 'Monto final',
      chartAria: 'Composición del monto final: capital más interés simple.',
    },
    en: {
      errorRequired: 'Please enter capital, rate and time',
      years: 'years',
      insightTitle: 'How much the interest weighs',
      capital: 'Principal',
      interes: 'Interest',
      total: 'Final amount',
      chartAria: 'Final amount breakdown: principal plus simple interest.',
    },
  } as const)[__lang];

  const C = Number(i.capital);
  const tasa = Number(i.tasa) / 100;
  let t = Number(i.tiempo);
  const unidad = String(i.unidad || 'anos');
  if (!C || !tasa || !t) throw new Error(T.errorRequired);

  // Convertir tiempo a años (la tasa es anual)
  if (unidad === 'meses') t = t / 12;
  else if (unidad === 'dias') t = t / 365;

  const interes = C * tasa * t;
  const monto = C + interes;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const pctInteres = monto > 0 ? (interes / monto) * 100 : 0;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.capital, value: Math.round(C) },
      { label: T.interes, value: Math.round(interes) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(monto).toLocaleString(locale),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `Over a principal of **$${Math.round(C).toLocaleString(locale)}**, simple interest adds **$${Math.round(interes).toLocaleString(locale)}** — **${pctInteres.toFixed(1)}%** of the **$${Math.round(monto).toLocaleString(locale)}** final amount.`
      : `Sobre un capital de **$${Math.round(C).toLocaleString(locale)}**, el interés simple suma **$${Math.round(interes).toLocaleString(locale)}**: el **${pctInteres.toFixed(1)}%** del monto final de **$${Math.round(monto).toLocaleString(locale)}**.`,
    tone: 'neutral' as const,
    icon: '📈',
  };

  return {
    interes: Math.round(interes),
    montoFinal: Math.round(monto),
    interesMensual: Math.round(interes / (t * 12)),
    interesDiario: Math.round(interes / (t * 365)),
    formula: `I = ${Math.round(C)} × ${(tasa * 100).toFixed(2)}% × ${t.toFixed(4)} ${T.years} = ${Math.round(interes)}`,
    _chart: chart,
    _insight: insight,
  };
}
