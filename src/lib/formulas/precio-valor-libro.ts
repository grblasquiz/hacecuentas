/** Price-to-Book ratio (P/B) — precio vs valor en libros */

export interface Inputs {
  precioAccion: number;
  patrimonioNeto: number;
  accionesCirculacion: number;
  pbPromedioSector: number;
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
  const precio = Number(i.precioAccion);
  const patrimonio = Number(i.patrimonioNeto);
  const acciones = Number(i.accionesCirculacion);
  const pbSector = Number(i.pbPromedioSector) || 1.5;

  if (!precio || precio <= 0) throw new Error('Ingresá el precio de la acción');
  if (!patrimonio) throw new Error('Ingresá el patrimonio neto');
  if (!acciones || acciones <= 0) throw new Error('Ingresá las acciones en circulación');

  const valorLibro = patrimonio / acciones;
  const pbRatio = valorLibro !== 0 ? precio / valorLibro : 0;
  const precioJusto = valorLibro * pbSector;
  const diferencia = ((precio - precioJusto) / precioJusto) * 100;

  let valuacion: string;
  if (pbRatio < 1) valuacion = 'Cotiza por debajo de su valor en libros (posible oportunidad o problemas)';
  else if (pbRatio < pbSector * 0.8) valuacion = 'Subvaluada respecto al sector';
  else if (pbRatio > pbSector * 1.3) valuacion = 'Sobrevaluada respecto al sector';
  else valuacion = 'Valuación en rango del sector';

  const formula = `P/B = $${precio} / $${valorLibro.toFixed(2)} = ${pbRatio.toFixed(2)}`;
  const explicacion = `Valor en libros por acción: $${valorLibro.toFixed(2)} (patrimonio $${patrimonio.toLocaleString()} / ${acciones.toLocaleString()} acciones). P/B ratio: ${pbRatio.toFixed(2)} (sector: ${pbSector}). ${valuacion}. Precio justo según P/B del sector: $${precioJusto.toFixed(2)}.`;

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
