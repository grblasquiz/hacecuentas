/** Proyección ahorro jubilación: FV de aportes mensuales + ahorro inicial; renta sostenible ~tasa real */
export interface Inputs {
  edadActual: number;
  edadJubilacion: number;
  aporteMensual: number;
  tasaAnual: number;
  ahorroActual?: number;
  __lang?: string;
}
export interface Outputs {
  montoFinal: number;
  rentaMensualEstimada: number;
  totalAportado: number;
  interesGanado: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

// Tasa real de retiro sostenible anual usada para estimar la renta mensual.
// Basada en la "regla del 4%" (Trinity Study / Bengen 1994): 4% anual de un
// portafolio diversificado es una tasa de retiro históricamente sostenible.
const TASA_RETIRO_SOSTENIBLE_ANUAL = 0.04;

export function proyeccionAhorroJubilacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá edad actual, edad de jubilación, aporte mensual y tasa',
      errorEdad: 'La edad de jubilación tiene que ser mayor que tu edad actual',
      insightTitle: 'Tu fondo al jubilarte',
      aportado: 'Lo que aportás vos',
      interes: 'Lo que suma el interés',
      total: 'Fondo final',
      chartAria: 'Composición del fondo de jubilación: aportes propios más interés generado.',
    },
    en: {
      errorRequired: 'Please enter current age, retirement age, monthly contribution and rate',
      errorEdad: 'Retirement age must be greater than your current age',
      insightTitle: 'Your fund at retirement',
      aportado: 'What you contribute',
      interes: 'What interest adds',
      total: 'Final fund',
      chartAria: 'Retirement fund breakdown: your own contributions plus interest earned.',
    },
  } as const)[__lang];

  const edadActual = Number(i.edadActual);
  const edadJubilacion = Number(i.edadJubilacion);
  const aporte = Number(i.aporteMensual);
  const tasaAnual = Number(i.tasaAnual) / 100;
  const ahorroActual = Number(i.ahorroActual) || 0;
  if (!edadActual || !edadJubilacion || (!aporte && aporte !== 0) || isNaN(tasaAnual)) {
    throw new Error(T.errorRequired);
  }
  if (edadJubilacion <= edadActual) throw new Error(T.errorEdad);

  const meses = (edadJubilacion - edadActual) * 12;
  // Tasa mensual equivalente a la anual
  const m = Math.pow(1 + tasaAnual, 1 / 12) - 1;

  // Valor futuro: ahorro inicial capitalizado + anualidad de aportes mensuales
  let fvInicial: number;
  let fvAportes: number;
  if (m === 0) {
    fvInicial = ahorroActual;
    fvAportes = aporte * meses;
  } else {
    fvInicial = ahorroActual * Math.pow(1 + m, meses);
    fvAportes = aporte * ((Math.pow(1 + m, meses) - 1) / m);
  }
  const montoFinal = fvInicial + fvAportes;

  const totalAportado = ahorroActual + aporte * meses;
  const interesGanado = montoFinal - totalAportado;

  // Renta mensual sostenible estimada (regla del 4% anual / 12)
  const rentaMensualEstimada = (montoFinal * TASA_RETIRO_SOSTENIBLE_ANUAL) / 12;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const money = (n: number) => '$' + Math.round(n).toLocaleString(locale);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.aportado, value: Math.round(totalAportado) },
      { label: T.interes, value: Math.round(interesGanado) },
    ],
    prefix: '$',
    centerValue: money(montoFinal),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `In **${meses / 12}** years you reach a fund of **${money(montoFinal)}**, which could give you about **${money(rentaMensualEstimada)}/month** at a 4% sustainable withdrawal rate. You put in **${money(totalAportado)}** and interest adds **${money(interesGanado)}**.`
      : `En **${meses / 12}** años juntás un fondo de **${money(montoFinal)}**, que a una tasa de retiro sostenible del 4% rinde unos **${money(rentaMensualEstimada)}/mes**. Vos ponés **${money(totalAportado)}** y el interés suma **${money(interesGanado)}**.`,
    tone: 'good' as const,
    icon: '👵',
  };

  return {
    montoFinal: Math.round(montoFinal),
    rentaMensualEstimada: Math.round(rentaMensualEstimada),
    totalAportado: Math.round(totalAportado),
    interesGanado: Math.round(interesGanado),
    formula: `FV = ${Math.round(ahorroActual)}×(1+${(m * 100).toFixed(3)}%)^${meses} + ${Math.round(aporte)}×(((1+${(m * 100).toFixed(3)}%)^${meses}−1)/${(m).toFixed(5)}) = ${Math.round(montoFinal)}`,
    _chart: chart,
    _insight: insight,
  };
}
