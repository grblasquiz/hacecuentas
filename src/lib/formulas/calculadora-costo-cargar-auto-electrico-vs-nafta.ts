/**
 * Costo de cargar un auto eléctrico vs. cargar nafta.
 * costoEV   = (consumoEV/100) * km * precioKwh
 * costoNafta= (consumoNafta/100) * km * precioNafta
 * ahorroMensual = costoNafta - costoEV ; ahorroAnual = ahorroMensual * 12
 * Matemática pura sobre datos que ingresa el usuario (no hay constantes externas).
 */
export interface Inputs {
  consumoEV: number;     // kWh / 100 km
  precioKwh: number;     // $ por kWh
  consumoNafta: number;  // L / 100 km
  precioNafta: number;   // $ por litro
  kmPorMes: number;      // km recorridos por mes
  __lang?: string;
}
export interface Outputs {
  costoEVMensual: number;
  costoNaftaMensual: number;
  ahorroMensual: number;
  ahorroAnual: number;
  formula: string;
  _chart?: any;
  _insight?: any;
}

export function costoCargarAutoElectricoVsNafta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      errorRequired: 'Completá consumos, precios y los km por mes',
      ev: 'Eléctrico',
      nafta: 'Nafta',
      chartCenterEV: 'Eléctrico',
      chartAria: 'Comparación del costo mensual de energía: auto eléctrico vs. nafta.',
      insightTitleEV: 'Conviene el eléctrico',
      insightTitleNafta: 'Conviene la nafta',
      insightTitleTie: 'Prácticamente empatan',
    },
    en: {
      errorRequired: 'Please enter consumptions, prices and km per month',
      ev: 'Electric',
      nafta: 'Gasoline',
      chartCenterEV: 'Electric',
      chartAria: 'Monthly energy cost comparison: electric car vs. gasoline.',
      insightTitleEV: 'The EV wins',
      insightTitleNafta: 'Gasoline wins',
      insightTitleTie: 'Practically a tie',
    },
  } as const)[__lang];

  const consumoEV = Number(i.consumoEV);
  const precioKwh = Number(i.precioKwh);
  const consumoNafta = Number(i.consumoNafta);
  const precioNafta = Number(i.precioNafta);
  const km = Number(i.kmPorMes);

  if (!consumoEV || !precioKwh || !consumoNafta || !precioNafta || !km)
    throw new Error(T.errorRequired);

  const costoEV = (consumoEV / 100) * km * precioKwh;
  const costoNafta = (consumoNafta / 100) * km * precioNafta;
  const ahorroMensual = costoNafta - costoEV;
  const ahorroAnual = ahorroMensual * 12;

  const locale = __lang === 'en' ? 'en-US' : 'es-AR';
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString(locale);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: T.ev, value: Math.round(costoEV) },
      { label: T.nafta, value: Math.round(costoNafta) },
    ],
    prefix: '$',
    centerValue: fmt(Math.abs(ahorroMensual)),
    centerLabel: ahorroMensual >= 0 ? (__lang === 'en' ? 'Saved / month' : 'Ahorro / mes') : (__lang === 'en' ? 'Extra / month' : 'De más / mes'),
    ariaLabel: T.chartAria,
  };

  let tone: 'good' | 'warn' | 'neutral' = 'neutral';
  let title = T.insightTitleTie;
  if (ahorroMensual > 0.01 * costoNafta) { tone = 'good'; title = T.insightTitleEV; }
  else if (ahorroMensual < -0.01 * costoEV) { tone = 'warn'; title = T.insightTitleNafta; }

  const pct = costoNafta > 0 ? (ahorroMensual / costoNafta) * 100 : 0;
  const insightText = __lang === 'en'
    ? (ahorroMensual >= 0
        ? `Charging the EV costs **${fmt(costoEV)}/month** vs. **${fmt(costoNafta)}/month** in gasoline. You save **${fmt(ahorroMensual)}/month** (**${pct.toFixed(0)}%**), or **${fmt(ahorroAnual)} a year**.`
        : `Charging the EV costs **${fmt(costoEV)}/month** vs. **${fmt(costoNafta)}/month** in gasoline, so it costs you **${fmt(-ahorroMensual)}/month more** with these prices.`)
    : (ahorroMensual >= 0
        ? `Cargar el eléctrico te cuesta **${fmt(costoEV)}/mes** contra **${fmt(costoNafta)}/mes** de nafta. Ahorrás **${fmt(ahorroMensual)}/mes** (**${pct.toFixed(0)}%**), o **${fmt(ahorroAnual)} al año**.`
        : `Cargar el eléctrico te cuesta **${fmt(costoEV)}/mes** contra **${fmt(costoNafta)}/mes** de nafta, así que con estos precios te sale **${fmt(-ahorroMensual)}/mes más caro**.`);

  const insight = { title, text: insightText, tone, icon: '🔌' };

  return {
    costoEVMensual: Math.round(costoEV),
    costoNaftaMensual: Math.round(costoNafta),
    ahorroMensual: Math.round(ahorroMensual),
    ahorroAnual: Math.round(ahorroAnual),
    formula: `EV: (${consumoEV}/100)×${km}×${precioKwh} = ${Math.round(costoEV)} | Nafta: (${consumoNafta}/100)×${km}×${precioNafta} = ${Math.round(costoNafta)} | Ahorro/mes = ${Math.round(ahorroMensual)}`,
    _chart: chart,
    _insight: insight,
  };
}
