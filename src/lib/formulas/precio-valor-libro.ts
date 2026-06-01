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
    },
    en: {
      errPrecio: 'Enter the share price',
      errPatrimonio: 'Enter the net equity',
      errAcciones: 'Enter the shares outstanding',
      valBelowBook: 'Trading below book value (possible opportunity or problems)',
      valUnder: 'Undervalued relative to the sector',
      valOver: 'Overvalued relative to the sector',
      valFair: 'Valuation within sector range',
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

  return {
    valorLibro: Number(valorLibro.toFixed(2)),
    pbRatio: Number(pbRatio.toFixed(2)),
    precioJusto: Number(precioJusto.toFixed(2)),
    diferencia: Number(diferencia.toFixed(2)),
    valuacion,
    formula,
    explicacion,
  };
}
