/** Capital inicial para abrir un negocio.
 * Suma la inversión inicial fija (alquiler+depósito, equipamiento, mercadería,
 * habilitaciones, marketing) más un colchón de supervivencia = meses × gastos mensuales.
 * Convención: el colchón cubre los primeros meses de operación hasta que el negocio
 * factura lo suficiente. 3 meses es el default conservador habitual. */
export interface Inputs {
  alquilerDeposito: number;
  equipamiento: number;
  mercaderiaInicial: number;
  habilitaciones: number;
  marketingInicial: number;
  mesesColchon: number;
  gastosMensuales: number;
  __lang?: string;
}
export interface Outputs {
  capitalTotal: number;
  colchonSupervivencia: number;
  inversionInicialFija: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function capitalInicialAbrirNegocio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorAll: 'Completá al menos un rubro de inversión y los gastos mensuales',
      insightTitle: 'Cuánto pesa el colchón',
      alquiler: 'Alquiler y depósito',
      equipamiento: 'Equipamiento',
      mercaderia: 'Mercadería inicial',
      habilitaciones: 'Habilitaciones',
      marketing: 'Marketing inicial',
      colchon: 'Colchón de supervivencia',
      total: 'Capital total',
      chartAria: 'Composición del capital inicial por rubro, incluyendo el colchón de supervivencia.',
    },
    en: {
      errorAll: 'Enter at least one investment item and your monthly expenses',
      insightTitle: 'How much the runway weighs',
      alquiler: 'Rent and deposit',
      equipamiento: 'Equipment',
      mercaderia: 'Initial inventory',
      habilitaciones: 'Permits',
      marketing: 'Initial marketing',
      colchon: 'Survival runway',
      total: 'Total capital',
      chartAria: 'Startup capital breakdown by item, including the survival runway.',
    },
  } as const)[__lang];

  const alquilerDeposito = Number(i.alquilerDeposito) || 0;
  const equipamiento = Number(i.equipamiento) || 0;
  const mercaderiaInicial = Number(i.mercaderiaInicial) || 0;
  const habilitaciones = Number(i.habilitaciones) || 0;
  const marketingInicial = Number(i.marketingInicial) || 0;
  const mesesColchon = Number(i.mesesColchon) || 0;
  const gastosMensuales = Number(i.gastosMensuales) || 0;

  const inversionInicialFija =
    alquilerDeposito + equipamiento + mercaderiaInicial + habilitaciones + marketingInicial;
  const colchonSupervivencia = mesesColchon * gastosMensuales;
  const capitalTotal = inversionInicialFija + colchonSupervivencia;

  if (capitalTotal <= 0) throw new Error(T.errorAll);

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const pctColchon = capitalTotal > 0 ? (colchonSupervivencia / capitalTotal) * 100 : 0;
  const slices = [
    { label: T.alquiler, value: Math.round(alquilerDeposito) },
    { label: T.equipamiento, value: Math.round(equipamiento) },
    { label: T.mercaderia, value: Math.round(mercaderiaInicial) },
    { label: T.habilitaciones, value: Math.round(habilitaciones) },
    { label: T.marketing, value: Math.round(marketingInicial) },
    { label: T.colchon, value: Math.round(colchonSupervivencia) },
  ].filter((s) => s.value > 0);

  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + Math.round(capitalTotal).toLocaleString(locale),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `Of the **$${Math.round(capitalTotal).toLocaleString(locale)}** you need to open, **$${Math.round(colchonSupervivencia).toLocaleString(locale)}** (**${pctColchon.toFixed(0)}%**) is the survival runway: cash to keep going while the business ramps up. Skipping it is the #1 reason new businesses close early.`
      : `De los **$${Math.round(capitalTotal).toLocaleString(locale)}** que necesitás para abrir, **$${Math.round(colchonSupervivencia).toLocaleString(locale)}** (**${pctColchon.toFixed(0)}%**) son el colchón de supervivencia: plata para aguantar mientras el negocio arranca. Saltearlo es la causa #1 de cierre temprano.`,
    tone: 'warn' as const,
    icon: '🏪',
  };

  return {
    capitalTotal: Math.round(capitalTotal),
    colchonSupervivencia: Math.round(colchonSupervivencia),
    inversionInicialFija: Math.round(inversionInicialFija),
    formula: `Capital = (${Math.round(alquilerDeposito)} + ${Math.round(equipamiento)} + ${Math.round(mercaderiaInicial)} + ${Math.round(habilitaciones)} + ${Math.round(marketingInicial)}) + ${mesesColchon} × ${Math.round(gastosMensuales)} = ${Math.round(capitalTotal)}`,
    _chart: chart,
    _insight: insight,
  };
}
