/** Primer millón: iterar mes a mes (aporte + capitalización) hasta alcanzar el objetivo */
export interface Inputs {
  ahorroMensual: number;
  tasaAnual: number;
  montoInicial?: number;
  objetivo?: number;
  __lang?: string;
}
export interface Outputs {
  meses: number;
  anios: number;
  totalAportado: number;
  interesGanado: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function primerMillonAhorroInteres(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá el ahorro mensual y la tasa anual',
      errorNoLlega: 'Con esos datos nunca alcanzás el objetivo: subí el ahorro mensual, la tasa o el monto inicial.',
      insightTitle: 'Tu camino al objetivo',
      aportado: 'Lo que aportás vos',
      interes: 'Lo que suma el interés',
      total: 'Objetivo',
      chartAria: 'Composición del objetivo: aportes propios más interés generado.',
      years: 'años',
    },
    en: {
      errorRequired: 'Please enter the monthly saving and the annual rate',
      errorNoLlega: 'You never reach the goal with these inputs: raise the monthly saving, the rate or the starting amount.',
      insightTitle: 'Your path to the goal',
      aportado: 'What you contribute',
      interes: 'What interest adds',
      total: 'Goal',
      chartAria: 'Goal breakdown: your own contributions plus interest earned.',
      years: 'years',
    },
  } as const)[__lang];

  const aporte = Number(i.ahorroMensual);
  const tasaAnual = Number(i.tasaAnual) / 100;
  const montoInicial = Number(i.montoInicial) || 0;
  const objetivo = Number(i.objetivo) || 1000000;
  if ((!aporte && aporte !== 0) || isNaN(tasaAnual)) throw new Error(T.errorRequired);

  // Tasa mensual equivalente a la anual
  const m = Math.pow(1 + tasaAnual, 1 / 12) - 1;

  let saldo = montoInicial;
  let meses = 0;
  const MAX_MESES = 1200; // 100 años: tope de seguridad

  // ¿Ya arranca por encima del objetivo?
  if (saldo >= objetivo) {
    const totalAportado = montoInicial;
    const interesGanado = 0;
    return buildResult(0, 0, totalAportado, 0, objetivo, montoInicial, aporte, m, T, __lang);
  }

  while (saldo < objetivo && meses < MAX_MESES) {
    saldo = saldo * (1 + m) + aporte;
    meses++;
  }

  if (saldo < objetivo) {
    // No llega dentro del tope (ej: aporte 0 y tasa 0)
    throw new Error(T.errorNoLlega);
  }

  const totalAportado = montoInicial + aporte * meses;
  const interesGanado = saldo - totalAportado;

  return buildResult(meses, meses / 12, totalAportado, interesGanado, objetivo, montoInicial, aporte, m, T, __lang, saldo);
}

function buildResult(
  meses: number,
  anios: number,
  totalAportado: number,
  interesGanado: number,
  objetivo: number,
  montoInicial: number,
  aporte: number,
  m: number,
  T: any,
  __lang: string,
  saldoFinal?: number,
): Outputs {
  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const money = (n: number) => '$' + Math.round(n).toLocaleString(locale);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.aportado, value: Math.round(totalAportado) },
      { label: T.interes, value: Math.round(interesGanado) },
    ],
    prefix: '$',
    centerValue: money(objetivo),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };

  const aniosTxt = (anios).toFixed(1);
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `You reach **${money(objetivo)}** in **${meses}** months (~${aniosTxt} years). You put in **${money(totalAportado)}** and interest adds **${money(interesGanado)}**.`
      : `Llegás a **${money(objetivo)}** en **${meses}** meses (~${aniosTxt} años). Vos ponés **${money(totalAportado)}** y el interés suma **${money(interesGanado)}**.`,
    tone: 'good' as const,
    icon: '🎯',
  };

  return {
    meses,
    anios: Math.round(anios * 100) / 100,
    totalAportado: Math.round(totalAportado),
    interesGanado: Math.round(interesGanado),
    formula: `${meses} meses aportando $${Math.round(aporte)}/mes a una tasa mensual de ${(m * 100).toFixed(3)}% (desde $${Math.round(montoInicial)}) para llegar a $${Math.round(objetivo)}`,
    _chart: chart,
    _insight: insight,
  };
}
