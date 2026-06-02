/** Price-to-Earnings (P/E) ratio — valuación de acciones */

export interface Inputs {
  precioAccion: number;
  gananciaPorAccion: number;
  pePromedioSector: number;
  tasaCrecimiento: number;
  __lang?: string;
}

export interface Outputs {
  peRatio: number;
  pegRatio: number;
  precioJusto: number;
  diferenciaPrecio: number;
  valuacion: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function peRatioValuacion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errPrecio: 'Ingresá el precio de la acción',
      errEps: 'Ingresá la ganancia por acción (EPS)',
      sinValuacion: 'Sin valuación P/E (EPS negativo)',
      subvaluada: 'Potencialmente subvaluada',
      sobrevaluada: 'Potencialmente sobrevaluada',
      enRango: 'Valuación en rango del sector',
      pegAtractivo: 'atractivo',
      pegCaro: 'caro',
      pegJusto: 'justo',
      sobrePrecio: 'sobre precio justo',
      bajoPrecio: 'bajo precio justo',
      precioJustoLabel: 'Precio justo según P/E del sector',
      insightTitle: 'Qué dice este P/E',
      gaugeLabel: 'P/E',
      gaugeAria: 'Escala del P/E respecto al promedio del sector: subvaluada, en rango y sobrevaluada.',
      segSub: 'Subvaluada',
      segRango: 'En rango',
      segSobre: 'Sobrevaluada',
    },
    en: {
      errPrecio: 'Enter the stock price',
      errEps: 'Enter the earnings per share (EPS)',
      sinValuacion: 'No P/E valuation (negative EPS)',
      subvaluada: 'Potentially undervalued',
      sobrevaluada: 'Potentially overvalued',
      enRango: 'Valuation within sector range',
      pegAtractivo: 'attractive',
      pegCaro: 'expensive',
      pegJusto: 'fair',
      sobrePrecio: 'above fair value',
      bajoPrecio: 'below fair value',
      precioJustoLabel: 'Fair price based on sector P/E',
      insightTitle: 'What this P/E tells you',
      gaugeLabel: 'P/E',
      gaugeAria: 'P/E scale relative to the sector average: undervalued, in range and overvalued.',
      segSub: 'Undervalued',
      segRango: 'In range',
      segSobre: 'Overvalued',
    },
  } as const)[__lang];

  const precio = Number(i.precioAccion);
  const eps = Number(i.gananciaPorAccion);
  const pePromedio = Number(i.pePromedioSector) || 15;
  const crecimiento = Number(i.tasaCrecimiento) || 0;

  if (!precio || precio <= 0) throw new Error(T.errPrecio);
  if (!eps) throw new Error(T.errEps);

  const peRatio = precio / eps;

  // PEG ratio = P/E / tasa de crecimiento esperada
  const pegRatio = crecimiento > 0 ? peRatio / crecimiento : 0;

  // Precio justo según P/E promedio del sector
  const precioJusto = eps * pePromedio;
  const diferenciaPrecio = ((precio - precioJusto) / precioJusto) * 100;

  let valuacion: string;
  if (eps < 0) {
    valuacion = T.sinValuacion;
  } else if (peRatio < pePromedio * 0.7) {
    valuacion = T.subvaluada;
  } else if (peRatio > pePromedio * 1.3) {
    valuacion = T.sobrevaluada;
  } else {
    valuacion = T.enRango;
  }

  const formula = `P/E = $${precio} / $${eps} = ${peRatio.toFixed(2)}`;
  const explicacion = `P/E ratio: ${peRatio.toFixed(2)} (sector: ${pePromedio}).${pegRatio > 0 ? ` PEG ratio: ${pegRatio.toFixed(2)} (${pegRatio < 1 ? T.pegAtractivo : pegRatio > 2 ? T.pegCaro : T.pegJusto}).` : ''} ${T.precioJustoLabel}: $${precioJusto.toFixed(2)} (${diferenciaPrecio > 0 ? `+${diferenciaPrecio.toFixed(1)}% ${T.sobrePrecio}` : `${diferenciaPrecio.toFixed(1)}% ${T.bajoPrecio}`}). ${valuacion}.`;

  // ── Insight: interpret the P/E vs sector (dynamic tone by valuation bucket)
  const insightTone = eps < 0 || peRatio > pePromedio * 1.3
    ? 'warn'
    : peRatio < pePromedio * 0.7
    ? 'good'
    : 'neutral';
  const pegFrag = pegRatio > 0
    ? (__lang === 'en'
        ? ` Adjusted for **${crecimiento}%** growth, its PEG is **${pegRatio.toFixed(2)}** (${pegRatio < 1 ? T.pegAtractivo : pegRatio > 2 ? T.pegCaro : T.pegJusto}).`
        : ` Ajustado por un crecimiento de **${crecimiento}%**, su PEG da **${pegRatio.toFixed(2)}** (${pegRatio < 1 ? T.pegAtractivo : pegRatio > 2 ? T.pegCaro : T.pegJusto}).`)
    : '';
  const insightText = eps < 0
    ? (__lang === 'en'
        ? `With negative EPS there is no meaningful P/E: the company isn't profitable, so this multiple can't be used to value it.`
        : `Con EPS negativo no hay P/E útil: la empresa no da ganancias, así que este múltiplo no sirve para valuarla.`)
    : (__lang === 'en'
        ? `Its P/E of **${peRatio.toFixed(2)}** vs a sector average of **${pePromedio}** puts it **${valuacion.toLowerCase()}**. Fair price would be around **$${precioJusto.toFixed(2)}** (${diferenciaPrecio > 0 ? '+' : ''}${diferenciaPrecio.toFixed(1)}% vs current).${pegFrag}`
        : `Su P/E de **${peRatio.toFixed(2)}** frente a un promedio del sector de **${pePromedio}** la deja **${valuacion.toLowerCase()}**. El precio justo rondaría los **$${precioJusto.toFixed(2)}** (${diferenciaPrecio > 0 ? '+' : ''}${diferenciaPrecio.toFixed(1)}% vs actual).${pegFrag}`);
  const insight = {
    title: T.insightTitle,
    text: insightText,
    tone: insightTone,
    icon: '📈',
  };

  // ── Gauge: P/E position vs sector zones (only when EPS positive → meaningful P/E)
  let chart: any = undefined;
  if (eps > 0 && peRatio > 0) {
    const lowMax = Number((pePromedio * 0.7).toFixed(2));
    const midMax = Number((pePromedio * 1.3).toFixed(2));
    const lastMax = Number((Math.max(midMax, peRatio) * 1.15).toFixed(2));
    chart = {
      type: 'scale' as const,
      marker: Number(peRatio.toFixed(2)),
      markerLabel: `${T.gaugeLabel} ${peRatio.toFixed(1)}`,
      min: 0,
      segments: [
        { nombre: T.segSub, max: lowMax, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: T.segRango, max: midMax, color: '#2563eb', colorDark: '#3b82f6' },
        { nombre: T.segSobre, max: lastMax, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: T.gaugeAria,
    };
  }

  return {
    peRatio: Number(peRatio.toFixed(2)),
    pegRatio: Number(pegRatio.toFixed(2)),
    precioJusto: Number(precioJusto.toFixed(2)),
    diferenciaPrecio: Number(diferenciaPrecio.toFixed(2)),
    valuacion,
    formula,
    explicacion,
    _insight: insight,
    ...(chart ? { _chart: chart } : {}),
  };
}
