/** Sueldo en dólares: usdHoy = sueldoPesos / dolarHoy; variación vs un dólar anterior opcional */
export interface Inputs {
  sueldoPesos: number;
  dolarHoy: number;
  dolarAntes?: number;
  __lang?: string;
}
export interface Outputs {
  usdHoy: number;
  usdAntes: number;
  variacionPct: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function sueldoEnDolaresPoderCompra(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá tu sueldo en pesos y el valor del dólar de hoy',
      errorDolar: 'El valor del dólar debe ser mayor a cero',
      insightTitle: 'Tu sueldo medido en dólares',
      antes: 'Sueldo antes (USD)',
      hoy: 'Sueldo hoy (USD)',
      total: 'Sueldo en USD',
      chartAria: 'Comparación del sueldo en dólares antes y ahora.',
      subio: 'subió',
      bajo: 'bajó',
    },
    en: {
      errorRequired: 'Please enter your salary in pesos and today\'s dollar value',
      errorDolar: 'The dollar value must be greater than zero',
      insightTitle: 'Your salary measured in dollars',
      antes: 'Salary before (USD)',
      hoy: 'Salary now (USD)',
      total: 'Salary in USD',
      chartAria: 'Comparison of salary in dollars before and now.',
      subio: 'rose',
      bajo: 'fell',
    },
  } as const)[__lang];

  const sueldoPesos = Number(i.sueldoPesos);
  const dolarHoy = Number(i.dolarHoy);
  const dolarAntes = Number(i.dolarAntes) || 0;
  if (!sueldoPesos || !dolarHoy) throw new Error(T.errorRequired);
  if (dolarHoy <= 0) throw new Error(T.errorDolar);

  const usdHoy = sueldoPesos / dolarHoy;
  let usdAntes = 0;
  let variacionPct = 0;
  if (dolarAntes > 0) {
    usdAntes = sueldoPesos / dolarAntes;
    variacionPct = usdAntes > 0 ? ((usdHoy - usdAntes) / usdAntes) * 100 : 0;
  }

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const usd = (n: number) => 'US$' + Math.round(n).toLocaleString(locale);

  let chart: any = undefined;
  if (dolarAntes > 0) {
    chart = {
      type: 'doughnut' as const,
      slices: [
        { label: T.antes, value: Math.round(usdAntes) },
        { label: T.hoy, value: Math.round(usdHoy) },
      ],
      prefix: 'US$',
      centerValue: usd(usdHoy),
      centerLabel: T.total,
      ariaLabel: T.chartAria,
    };
  }

  let insightText: string;
  if (dolarAntes > 0) {
    const dir = variacionPct >= 0 ? T.subio : T.bajo;
    insightText = __lang === 'en'
      ? `Your salary is worth **${usd(usdHoy)}** today vs **${usd(usdAntes)}** before — it **${dir}** **${Math.abs(variacionPct).toFixed(1)}%** in dollars, even if the peso amount didn't change.`
      : `Tu sueldo vale **${usd(usdHoy)}** hoy contra **${usd(usdAntes)}** antes: en dólares **${dir} ${Math.abs(variacionPct).toFixed(1)}%**, aunque el monto en pesos sea el mismo.`;
  } else {
    insightText = __lang === 'en'
      ? `At a dollar of **$${Math.round(dolarHoy).toLocaleString(locale)}**, your salary of **$${Math.round(sueldoPesos).toLocaleString(locale)}** equals **${usd(usdHoy)}**.`
      : `Con un dólar a **$${Math.round(dolarHoy).toLocaleString(locale)}**, tu sueldo de **$${Math.round(sueldoPesos).toLocaleString(locale)}** equivale a **${usd(usdHoy)}**.`;
  }
  const insight = {
    title: T.insightTitle,
    text: insightText,
    tone: (dolarAntes > 0 ? (variacionPct >= 0 ? 'good' : 'warn') : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '💵',
  };

  return {
    usdHoy: Math.round(usdHoy * 100) / 100,
    usdAntes: Math.round(usdAntes * 100) / 100,
    variacionPct: Math.round(variacionPct * 100) / 100,
    formula: `USD hoy = ${Math.round(sueldoPesos)} / ${Math.round(dolarHoy)} = ${Math.round(usdHoy * 100) / 100}`,
    _chart: chart,
    _insight: insight,
  };
}
