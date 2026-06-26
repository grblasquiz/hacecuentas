/** Costo de dejar un aire/calefactor toda la noche: kWh × precio kWh */
export interface Inputs {
  potencia: number;       // W
  horas: number;          // horas por noche
  precioKwh: number;      // $ por kWh
  nochesPorMes: number;   // noches al mes
  tipoAparato?: string;   // solo informativo
  __lang?: string;
}
export interface Outputs {
  costoPorNoche: number;
  costoMensual: number;
  kwhMensual: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function costoAireCalefactorTochaLaNoche(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá potencia, horas y precio del kWh',
      insightTitle: 'Cuánto te cuesta dejarlo prendido',
      perNight: 'Por noche',
      perMonth: 'Al mes',
      total: 'Al mes',
      chartAria: 'Costo por noche frente al resto del mes.',
      restMonth: 'Resto del mes',
      oneNight: 'Una noche',
    },
    en: {
      errorRequired: 'Please enter power, hours and price per kWh',
      insightTitle: 'What leaving it on costs you',
      perNight: 'Per night',
      perMonth: 'Per month',
      total: 'Per month',
      chartAria: 'Cost of one night versus the rest of the month.',
      restMonth: 'Rest of the month',
      oneNight: 'One night',
    },
  } as const)[__lang];

  const potencia = Number(i.potencia);
  const horas = Number(i.horas);
  const precioKwh = Number(i.precioKwh);
  const nochesPorMes = Number(i.nochesPorMes) || 30;
  if (!potencia || !horas || !precioKwh) throw new Error(T.errorRequired);

  const kwhPorNoche = (potencia / 1000) * horas;
  const costoPorNoche = kwhPorNoche * precioKwh;
  const costoMensual = costoPorNoche * nochesPorMes;
  const kwhMensual = kwhPorNoche * nochesPorMes;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const restoMes = Math.max(0, costoMensual - costoPorNoche);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.oneNight, value: Math.round(costoPorNoche) },
      { label: T.restMonth, value: Math.round(restoMes) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoMensual).toLocaleString(locale),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `Running **${potencia} W** for **${horas} h** costs **$${Math.round(costoPorNoche).toLocaleString(locale)}** a night and **$${Math.round(costoMensual).toLocaleString(locale)}** over **${nochesPorMes}** nights. Inverter ACs draw less than their nominal power once the room is at temperature, so your real bill is usually lower.`
      : `Dejarlo prendido (**${potencia} W** durante **${horas} h**) cuesta **$${Math.round(costoPorNoche).toLocaleString(locale)}** por noche y **$${Math.round(costoMensual).toLocaleString(locale)}** en **${nochesPorMes}** noches. Ojo: un **aire split inverter** no consume su potencia nominal todo el tiempo —baja al llegar a la temperatura—, así que tu factura real suele ser menor que esta estimación.`,
    tone: 'neutral' as const,
    icon: '🌡️',
  };

  return {
    costoPorNoche: Math.round(costoPorNoche),
    costoMensual: Math.round(costoMensual),
    kwhMensual: Math.round(kwhMensual * 10) / 10,
    formula: `(${potencia} W ÷ 1000 × ${horas} h) × $${precioKwh}/kWh = $${Math.round(costoPorNoche)} por noche × ${nochesPorMes} = $${Math.round(costoMensual)}`,
    _chart: chart,
    _insight: insight,
  };
}
