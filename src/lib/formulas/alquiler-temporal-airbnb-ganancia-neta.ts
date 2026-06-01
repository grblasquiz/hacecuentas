export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function alquilerTemporalAirbnbGananciaNeta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      resumen: (p: number, n: number, bruto: number, neto: number) => `$${p}/noche × ${n}: bruto $${bruto.toFixed(0)}, neto ~$${neto.toFixed(0)}.`,
      labelNeto: 'Ganancia neta',
      labelComision: 'Comisión plataforma (3%)',
      labelImpuestos: 'Impuestos (8%)',
      labelExpensas: 'Expensas',
      centerLabel: 'Bruto',
      ariaLabel: 'Composición del ingreso bruto del alquiler temporal: ganancia neta, comisión, impuestos y expensas.',
      insightTitle: 'Lo que te queda',
      insightText: (margen: number, neto: number) => `De cada $100 de ingreso bruto te quedan **$${margen.toFixed(0)}** netos (margen **${margen.toFixed(0)}%**): el resto se va en comisión, impuestos y expensas. Quedan **$${neto.toFixed(0)}** en el mes — bajar expensas o subir la ocupación es lo que más mueve la aguja.`,
    },
    en: {
      resumen: (p: number, n: number, bruto: number, neto: number) => `$${p}/night × ${n}: gross $${bruto.toFixed(0)}, net ~$${neto.toFixed(0)}.`,
      labelNeto: 'Net profit',
      labelComision: 'Platform fee (3%)',
      labelImpuestos: 'Taxes (8%)',
      labelExpensas: 'HOA/expenses',
      centerLabel: 'Gross',
      ariaLabel: 'Breakdown of gross rental income: net profit, platform fee, taxes, and expenses.',
      insightTitle: 'What you keep',
      insightText: (margen: number, neto: number) => `For every $100 of gross income you keep **$${margen.toFixed(0)}** net (**${margen.toFixed(0)}%** margin): the rest goes to platform fee, taxes and expenses. That leaves **$${neto.toFixed(0)}** for the month — cutting expenses or raising occupancy moves the needle most.`,
    },
  } as const)[__lang];
  const p=Number(i.precioNoche)||0; const n=Number(i.nochesMes)||0; const e=Number(i.expensas)||0;
  const bruto=p*n;
  const com=bruto*0.03;
  const imp=bruto*0.08;
  const neto=bruto-com-imp-e;
  const out: Outputs & { _chart?: any } = { bruto:'$'+bruto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), comisiones:'$'+com.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), neto:'$'+neto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), roiBruto:'~2.5x', resumen: T.resumen(p, n, bruto, neto) };
  if (bruto > 0 && neto >= 0) {
    const slices = [
      { label: T.labelNeto, value: Math.round(neto) },
      { label: T.labelComision, value: Math.round(com) },
      { label: T.labelImpuestos, value: Math.round(imp) },
    ];
    if (e > 0) slices.push({ label: T.labelExpensas, value: Math.round(e) });
    out._chart = {
      type: 'doughnut' as const,
      slices,
      prefix: '$',
      centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
      centerLabel: T.centerLabel,
      ariaLabel: T.ariaLabel,
    };
    const margen = (neto / bruto) * 100;
    out._insight = {
      title: T.insightTitle,
      text: T.insightText(margen, neto),
      tone: margen >= 70 ? 'good' : margen >= 50 ? 'neutral' : 'warn',
      icon: '🏠',
    };
  }
  return out;
}
