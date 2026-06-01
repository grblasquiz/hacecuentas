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

  return {
    peRatio: Number(peRatio.toFixed(2)),
    pegRatio: Number(pegRatio.toFixed(2)),
    precioJusto: Number(precioJusto.toFixed(2)),
    diferenciaPrecio: Number(diferenciaPrecio.toFixed(2)),
    valuacion,
    formula,
    explicacion,
  };
}
