/** Costo mensual de mantener una pileta: agua de reposición + luz de la bomba + químicos */
export interface Inputs {
  litrosPileta: number;          // litros
  reposicionPct: number;         // % de agua que se repone al mes
  precioAguaM3: number;          // $ por m3
  potenciaBomba: number;         // W
  horasBombaDia: number;         // horas/día
  precioKwh: number;             // $ por kWh
  gastoQuimicosMensual: number;  // $ por mes
  __lang?: string;
}
export interface Outputs {
  costoMensual: number;
  costoLuzBomba: number;
  costoAgua: number;
  costoQuimicos: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function costoMensualPileta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá litros de la pileta, precio del agua, precio del kWh y químicos',
      insightTitle: 'En qué se te va la plata de la pileta',
      total: 'Total mensual',
      agua: 'Agua',
      luz: 'Luz (bomba)',
      quimicos: 'Químicos',
      chartAria: 'Distribución del costo mensual de la pileta entre agua, luz de la bomba y químicos.',
    },
    en: {
      errorRequired: 'Please enter pool litres, water price, price per kWh and chemicals',
      insightTitle: 'Where your pool money goes',
      total: 'Monthly total',
      agua: 'Water',
      luz: 'Power (pump)',
      quimicos: 'Chemicals',
      chartAria: 'Monthly pool cost split between water, pump power and chemicals.',
    },
  } as const)[__lang];

  const litros = Number(i.litrosPileta);
  const reposicionPct = Number(i.reposicionPct);
  const precioAguaM3 = Number(i.precioAguaM3);
  const potenciaBomba = Number(i.potenciaBomba) || 750;
  const horasBombaDia = Number(i.horasBombaDia) || 6;
  const precioKwh = Number(i.precioKwh);
  const gastoQuimicos = Number(i.gastoQuimicosMensual) || 0;
  if (!litros || !precioAguaM3 || !precioKwh) throw new Error(T.errorRequired);

  // Agua de reposición (evaporación) al mes
  const aguaM3Mes = (litros / 1000) * (reposicionPct / 100);
  const costoAgua = aguaM3Mes * precioAguaM3;

  // Luz de la bomba al mes
  const kwhMes = (potenciaBomba / 1000) * horasBombaDia * 30;
  const costoLuz = kwhMes * precioKwh;

  const costoMensual = costoAgua + costoLuz + gastoQuimicos;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.luz, value: Math.round(costoLuz) },
      { label: T.agua, value: Math.round(costoAgua) },
      { label: T.quimicos, value: Math.round(gastoQuimicos) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(costoMensual).toLocaleString(locale),
    centerLabel: T.total,
    ariaLabel: T.chartAria,
  };
  const insight = {
    title: T.insightTitle,
    text: __lang === 'en'
      ? `Keeping the pool costs about **$${Math.round(costoMensual).toLocaleString(locale)}/month**: **$${Math.round(costoLuz).toLocaleString(locale)}** in pump power, **$${Math.round(costoAgua).toLocaleString(locale)}** in water and **$${Math.round(gastoQuimicos).toLocaleString(locale)}** in chemicals. The pump usually drives most of the bill — cutting its hours is the biggest lever.`
      : `Mantener la pileta cuesta unos **$${Math.round(costoMensual).toLocaleString(locale)}/mes**: **$${Math.round(costoLuz).toLocaleString(locale)}** de luz de la bomba, **$${Math.round(costoAgua).toLocaleString(locale)}** de agua y **$${Math.round(gastoQuimicos).toLocaleString(locale)}** de químicos. La **bomba** suele ser el rubro más pesado: reducir sus horas de filtrado es la palanca que más ahorra.`,
    tone: 'neutral' as const,
    icon: '🏊',
  };

  return {
    costoMensual: Math.round(costoMensual),
    costoLuzBomba: Math.round(costoLuz),
    costoAgua: Math.round(costoAgua),
    costoQuimicos: Math.round(gastoQuimicos),
    formula: `Agua: ${aguaM3Mes.toFixed(2)} m³ × $${precioAguaM3} = $${Math.round(costoAgua)} | Luz: ${kwhMes.toFixed(1)} kWh × $${precioKwh} = $${Math.round(costoLuz)} | Químicos: $${Math.round(gastoQuimicos)} → Total $${Math.round(costoMensual)}`,
    _chart: chart,
    _insight: insight,
  };
}
