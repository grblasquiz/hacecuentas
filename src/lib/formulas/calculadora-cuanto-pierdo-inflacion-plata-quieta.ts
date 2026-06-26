/** Cuánto pierdo si dejo la plata quieta con inflación: valorReal = monto / (1+infl)^(meses/12) */
export interface Inputs {
  monto: number;
  inflacionAnual: number;
  meses: number;
  __lang?: string;
}
export interface Outputs {
  valorReal: number;
  perdida: number;
  pctPerdido: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function cuantoPierdoInflacionPlataQuieta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá monto, inflación anual y meses',
      insightTitle: 'Lo que te come la inflación',
      queda: 'Poder de compra que queda',
      perdido: 'Poder de compra perdido',
      total: 'Valor real',
      chartAria: 'Composición del poder de compra: el que queda y el perdido por inflación.',
    },
    en: {
      errorRequired: 'Please enter amount, annual inflation and months',
      insightTitle: 'What inflation eats',
      queda: 'Purchasing power left',
      perdido: 'Purchasing power lost',
      total: 'Real value',
      chartAria: 'Purchasing power breakdown: what is left and what inflation eroded.',
    },
  } as const)[__lang];

  const monto = Number(i.monto);
  const inflacionAnual = Number(i.inflacionAnual) / 100;
  const meses = Number(i.meses);
  if (!monto || isNaN(inflacionAnual) || !meses) throw new Error(T.errorRequired);
  if (inflacionAnual < 0 || meses < 0) throw new Error(T.errorRequired);

  // Valor real del dinero hoy quieto, descontado por inflación acumulada del período
  const factor = Math.pow(1 + inflacionAnual, meses / 12);
  const valorReal = monto / factor;
  const perdida = monto - valorReal;
  const pctPerdido = monto > 0 ? (perdida / monto) * 100 : 0;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.queda, value: Math.round(valorReal) },
      { label: T.perdido, value: Math.round(perdida) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(valorReal).toLocaleString(locale),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `If you leave **$${Math.round(monto).toLocaleString(locale)}** idle for **${meses}** months with **${(inflacionAnual * 100).toFixed(0)}%** annual inflation, it ends up worth only **$${Math.round(valorReal).toLocaleString(locale)}** in today's purchasing power — you lose **${pctPerdido.toFixed(1)}%**.`
      : `Si dejás **$${Math.round(monto).toLocaleString(locale)}** quietos **${meses}** meses con **${(inflacionAnual * 100).toFixed(0)}%** de inflación anual, equivalen a apenas **$${Math.round(valorReal).toLocaleString(locale)}** de hoy: perdés el **${pctPerdido.toFixed(1)}%** de tu poder de compra.`,
    tone: 'warn' as const,
    icon: '💸',
  };

  return {
    valorReal: Math.round(valorReal),
    perdida: Math.round(perdida),
    pctPerdido: Math.round(pctPerdido * 100) / 100,
    formula: `valor real = ${Math.round(monto)} / (1 + ${(inflacionAnual * 100).toFixed(1)}%)^(${meses}/12) = ${Math.round(valorReal)}`,
    _chart: chart,
    _insight: insight,
  };
}
