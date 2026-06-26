/** Consumo fantasma / standby de aparatos: kWh anual × precio kWh */
export interface Inputs {
  cantidadAparatos: number;     // cantidad de aparatos
  potenciaStandby: number;      // W promedio por aparato
  precioKwh: number;            // $ por kWh
  horasApagadoPorDia: number;   // horas en standby al día
  __lang?: string;
}
export interface Outputs {
  costoAnual: number;
  costoMensual: number;
  kwhAnual: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function consumoStandbyAparatos(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá cantidad de aparatos, potencia standby y precio del kWh',
      insightTitle: 'El consumo vampiro de tus aparatos',
      perYear: 'Al año',
      perMonth: 'Por mes',
      year: 'Al año',
      chartAria: 'Costo del consumo fantasma por mes a lo largo del año.',
      months: 'Resto del año',
      oneMonth: 'Un mes',
    },
    en: {
      errorRequired: 'Please enter number of devices, standby power and price per kWh',
      insightTitle: 'Your devices vampire power draw',
      perYear: 'Per year',
      perMonth: 'Per month',
      year: 'Per year',
      chartAria: 'Phantom load cost per month over the year.',
      months: 'Rest of the year',
      oneMonth: 'One month',
    },
  } as const)[__lang];

  const cantidad = Number(i.cantidadAparatos);
  const potenciaStandby = Number(i.potenciaStandby) || 5;
  const precioKwh = Number(i.precioKwh);
  const horasApagado = Number(i.horasApagadoPorDia) || 20;
  if (!cantidad || !potenciaStandby || !precioKwh) throw new Error(T.errorRequired);

  const kwhAnual = (cantidad * potenciaStandby / 1000) * horasApagado * 365;
  const costoAnual = kwhAnual * precioKwh;
  const costoMensual = costoAnual / 12;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const restoAno = Math.max(0, costoAnual - costoMensual);
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.oneMonth, value: Math.round(costoMensual) },
      { label: T.months, value: Math.round(restoAno) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoAnual).toLocaleString(locale),
    centerLabel: T.year,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `**${cantidad}** devices drawing **${potenciaStandby} W** each in standby for **${horasApagado} h/day** waste **${Math.round(kwhAnual)} kWh** a year — **$${Math.round(costoAnual).toLocaleString(locale)}** you pay for nothing. Most appliances draw 2-10 W just by being plugged in; unplug them or use a power strip with a switch.`
      : `**${cantidad}** aparatos consumiendo **${potenciaStandby} W** cada uno en standby durante **${horasApagado} h/día** desperdician **${Math.round(kwhAnual)} kWh** al año: **$${Math.round(costoAnual).toLocaleString(locale)}** que pagás por nada. La mayoría de los aparatos consumen entre **2 y 10 W** solo por estar enchufados —es el llamado consumo fantasma o vampiro—. Desenchufalos o usá una zapatilla con interruptor.`,
    tone: 'warn' as const,
    icon: '🔌',
  };

  return {
    costoAnual: Math.round(costoAnual),
    costoMensual: Math.round(costoMensual),
    kwhAnual: Math.round(kwhAnual * 10) / 10,
    formula: `(${cantidad} × ${potenciaStandby} W ÷ 1000) × ${horasApagado} h × 365 = ${Math.round(kwhAnual)} kWh × $${precioKwh} = $${Math.round(costoAnual)}/año`,
    _chart: chart,
    _insight: insight,
  };
}
