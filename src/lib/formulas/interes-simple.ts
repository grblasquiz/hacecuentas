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

// ── A4 · Hooks opcionales de contenido computado (fórmula de PRUEBA) ──
// Contrato (ver Calculator.astro):
//   steps(inputs, outputs): string[]              → paso a paso (markdown inline)
//   schedule(inputs, outputs): { headers, rows }  → cronograma período a período
// Los valores ya vienen sustituidos; el runtime solo formatea/escapa.

/** Deriva capital, tasa (decimal) y tiempo-en-años desde los inputs crudos. */
function _parseInteresSimple(i: Inputs): { C: number; tasaPct: number; tasa: number; t: number; unidad: string; tYears: number } {
  const C = Number(i.capital);
  const tasaPct = Number(i.tasa);
  const tasa = tasaPct / 100;
  const t = Number(i.tiempo);
  const unidad = String(i.unidad || 'anos');
  const tYears = unidad === 'meses' ? t / 12 : unidad === 'dias' ? t / 365 : t;
  return { C, tasaPct, tasa, t, unidad, tYears };
}

export function steps(i: Inputs, o: Outputs): string[] {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const { C, tasaPct, tasa, t, unidad, tYears } = _parseInteresSimple(i);
  const loc = __lang === 'en' ? 'en-US' : 'es-AR';
  const m = (x: number) => '$' + Math.round(x).toLocaleString(loc);
  // Resultados desde el output ya calculado (no recalcular).
  const interes = Number(o.interes);
  const monto = Number(o.montoFinal);
  if (__lang === 'en') {
    const unitName = unidad === 'meses' ? 'months' : unidad === 'dias' ? 'days' : 'years';
    return [
      '**Formula:** `I = C × i × t`',
      `**Principal (C):** ${m(C)}`,
      `**Annual rate (i):** ${tasaPct}% = \`${tasa.toFixed(4)}\``,
      `**Time (t):** ${t} ${unitName} = \`${tYears.toFixed(4)}\` years`,
      `**Interest:** \`${Math.round(C)} × ${tasa.toFixed(4)} × ${tYears.toFixed(4)}\` = **${m(interes)}**`,
      `**Final amount:** \`${m(C)} + ${m(interes)}\` = **${m(monto)}**`,
    ];
  }
  const unitName = unidad === 'meses' ? 'meses' : unidad === 'dias' ? 'días' : 'años';
  return [
    '**Fórmula:** `I = C × i × t`',
    `**Capital (C):** ${m(C)}`,
    `**Tasa anual (i):** ${tasaPct}% = \`${tasa.toFixed(4)}\``,
    `**Tiempo (t):** ${t} ${unitName} = \`${tYears.toFixed(4)}\` años`,
    `**Interés:** \`${Math.round(C)} × ${tasa.toFixed(4)} × ${tYears.toFixed(4)}\` = **${m(interes)}**`,
    `**Monto final:** \`${m(C)} + ${m(interes)}\` = **${m(monto)}**`,
  ];
}

export function schedule(i: Inputs, _o: Outputs): { headers: string[]; rows: (string | number)[][] } {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const { C, tasa, tYears } = _parseInteresSimple(i);
  const loc = __lang === 'en' ? 'en-US' : 'es-AR';
  const m = (x: number) => '$' + Math.round(x).toLocaleString(loc);
  const headers = __lang === 'en'
    ? ['Year', 'Interest this period', 'Accrued interest', 'Balance']
    : ['Año', 'Interés del período', 'Interés acumulado', 'Saldo'];
  const rows: (string | number)[][] = [];
  // Interés simple: cada año acumula C × i (lineal). El último año prorratea la
  // fracción restante para plazos no enteros.
  const totalYears = Math.max(1, Math.ceil(tYears));
  let accrued = 0;
  for (let y = 1; y <= totalYears; y++) {
    const frac = Math.min(1, tYears - (y - 1));
    if (frac <= 0) break;
    const periodInt = C * tasa * frac;
    accrued += periodInt;
    rows.push([y, m(periodInt), m(accrued), m(C + accrued)]);
  }
  return { headers, rows };
}
