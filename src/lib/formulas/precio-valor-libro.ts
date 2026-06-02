/** Price-to-Book ratio (P/B) — precio vs valor en libros */

export interface Inputs {
  precioAccion: number;
  patrimonioNeto: number;
  accionesCirculacion: number;
  pbPromedioSector: number;
  __lang?: string;
}

export interface Outputs {
  valorLibro: number;
  pbRatio: number;
  precioJusto: number;
  diferencia: number;
  valuacion: string;
  formula: string;
  explicacion: string;
  _insight?: any;
  _chart?: any;
}

export function precioValorLibro(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const T = ({
    es: {
      errPrecio: 'Ingresá el precio de la acción',
      errPatrimonio: 'Ingresá el patrimonio neto',
      errAcciones: 'Ingresá las acciones en circulación',
      valBelowBook: 'Cotiza por debajo de su valor en libros (posible oportunidad o problemas)',
      valUnder: 'Subvaluada respecto al sector',
      valOver: 'Sobrevaluada respecto al sector',
      valFair: 'Valuación en rango del sector',
      insTitle: 'Cómo cotiza vs su valor en libros',
      segCheap: 'Bajo libro',
      segUnder: 'Subvaluada',
      segFair: 'En rango',
      segOver: 'Sobrevaluada',
      gaugeAria: 'P/B ubicado en zonas de valuación respecto al sector',
    },
    en: {
      errPrecio: 'Enter the share price',
      errPatrimonio: 'Enter the net equity',
      errAcciones: 'Enter the shares outstanding',
      valBelowBook: 'Trading below book value (possible opportunity or problems)',
      valUnder: 'Undervalued relative to the sector',
      valOver: 'Overvalued relative to the sector',
      valFair: 'Valuation within sector range',
      insTitle: 'How it trades vs its book value',
      segCheap: 'Below book',
      segUnder: 'Undervalued',
      segFair: 'In range',
      segOver: 'Overvalued',
      gaugeAria: 'P/B placed across valuation zones relative to the sector',
    },
  } as const)[__lang];

  const precio = Number(i.precioAccion);
  const patrimonio = Number(i.patrimonioNeto);
  const acciones = Number(i.accionesCirculacion);
  const pbSector = Number(i.pbPromedioSector) || 1.5;

  if (!precio || precio <= 0) throw new Error(T.errPrecio);
  if (!patrimonio) throw new Error(T.errPatrimonio);
  if (!acciones || acciones <= 0) throw new Error(T.errAcciones);

  const valorLibro = patrimonio / acciones;
  const pbRatio = valorLibro !== 0 ? precio / valorLibro : 0;
  const precioJusto = valorLibro * pbSector;
  const diferencia = ((precio - precioJusto) / precioJusto) * 100;

  let valuacion: string;
  if (pbRatio < 1) valuacion = T.valBelowBook;
  else if (pbRatio < pbSector * 0.8) valuacion = T.valUnder;
  else if (pbRatio > pbSector * 1.3) valuacion = T.valOver;
  else valuacion = T.valFair;

  const formula = `P/B = $${precio} / $${valorLibro.toFixed(2)} = ${pbRatio.toFixed(2)}`;
  const explicacion = __lang === 'en'
    ? `Book value per share: $${valorLibro.toFixed(2)} (equity $${patrimonio.toLocaleString()} / ${acciones.toLocaleString()} shares). P/B ratio: ${pbRatio.toFixed(2)} (sector: ${pbSector}). ${valuacion}. Fair price based on sector P/B: $${precioJusto.toFixed(2)}.`
    : `Valor en libros por acción: $${valorLibro.toFixed(2)} (patrimonio $${patrimonio.toLocaleString()} / ${acciones.toLocaleString()} acciones). P/B ratio: ${pbRatio.toFixed(2)} (sector: ${pbSector}). ${valuacion}. Precio justo según P/B del sector: $${precioJusto.toFixed(2)}.`;

  const tone = pbRatio < 1 ? 'warn' : (pbRatio > pbSector * 1.3 ? 'warn' : (pbRatio < pbSector * 0.8 ? 'good' : 'neutral'));
  const absDif = Math.abs(diferencia).toFixed(1);
  const insText = __lang === 'en'
    ? `P/B ratio of **${pbRatio.toFixed(2)}** vs the sector's **${pbSector}**: ${valuacion.toLowerCase()}. The share trades **${diferencia >= 0 ? absDif + '% above' : absDif + '% below'}** its fair price of **$${precioJusto.toFixed(2)}**.`
    : `P/B de **${pbRatio.toFixed(2)}** contra **${pbSector}** del sector: ${valuacion.toLowerCase()}. La acción cotiza **${diferencia >= 0 ? absDif + '% por encima' : absDif + '% por debajo'}** de su precio justo de **$${precioJusto.toFixed(2)}**.`;
  const _insight = {
    title: T.insTitle,
    text: insText,
    tone,
    icon: '📊',
  };

  // Gauge: zonas de valuación construidas sobre los umbrales dinámicos del sector.
  // Se fuerza orden ascendente estricto por si pbSector es muy bajo (segUnder podría caer bajo 1).
  const b1 = 1;
  const b2 = Math.max(pbSector * 0.8, b1 + 0.05);
  const b3 = Math.max(pbSector * 1.3, b2 + 0.05);
  const b4 = Math.max(b3 * 1.25, pbRatio * 1.1, b3 + 0.05);
  const _chart = {
    type: 'scale' as const,
    marker: Number(pbRatio.toFixed(2)),
    markerLabel: `P/B ${pbRatio.toFixed(2)}`,
    min: 0,
    segments: [
      { nombre: T.segCheap, max: Number(b1.toFixed(2)), color: '#fca5a5', colorDark: '#b91c1c' },
      { nombre: T.segUnder, max: Number(b2.toFixed(2)), color: '#86efac', colorDark: '#15803d' },
      { nombre: T.segFair, max: Number(b3.toFixed(2)), color: '#93c5fd', colorDark: '#1d4ed8' },
      { nombre: T.segOver, max: Number(b4.toFixed(2)), color: '#fdba74', colorDark: '#c2410c' },
    ],
    ariaLabel: T.gaugeAria,
  };

  return {
    valorLibro: Number(valorLibro.toFixed(2)),
    pbRatio: Number(pbRatio.toFixed(2)),
    precioJusto: Number(precioJusto.toFixed(2)),
    diferencia: Number(diferencia.toFixed(2)),
    valuacion,
    formula,
    explicacion,
    _insight,
    _chart,
  };
}
