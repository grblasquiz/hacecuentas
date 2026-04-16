/** Price-to-Earnings (P/E) ratio — valuación de acciones */

export interface Inputs {
  precioAccion: number;
  gananciaPorAccion: number;
  pePromedioSector: number;
  tasaCrecimiento: number;
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
  const precio = Number(i.precioAccion);
  const eps = Number(i.gananciaPorAccion);
  const pePromedio = Number(i.pePromedioSector) || 15;
  const crecimiento = Number(i.tasaCrecimiento) || 0;

  if (!precio || precio <= 0) throw new Error('Ingresá el precio de la acción');
  if (!eps) throw new Error('Ingresá la ganancia por acción (EPS)');

  const peRatio = precio / eps;

  // PEG ratio = P/E / tasa de crecimiento esperada
  const pegRatio = crecimiento > 0 ? peRatio / crecimiento : 0;

  // Precio justo según P/E promedio del sector
  const precioJusto = eps * pePromedio;
  const diferenciaPrecio = ((precio - precioJusto) / precioJusto) * 100;

  let valuacion: string;
  if (eps < 0) {
    valuacion = 'Sin valuación P/E (EPS negativo)';
  } else if (peRatio < pePromedio * 0.7) {
    valuacion = 'Potencialmente subvaluada';
  } else if (peRatio > pePromedio * 1.3) {
    valuacion = 'Potencialmente sobrevaluada';
  } else {
    valuacion = 'Valuación en rango del sector';
  }

  const formula = `P/E = $${precio} / $${eps} = ${peRatio.toFixed(2)}`;
  const explicacion = `P/E ratio: ${peRatio.toFixed(2)} (sector: ${pePromedio}).${pegRatio > 0 ? ` PEG ratio: ${pegRatio.toFixed(2)} (${pegRatio < 1 ? 'atractivo' : pegRatio > 2 ? 'caro' : 'justo'}).` : ''} Precio justo según P/E del sector: $${precioJusto.toFixed(2)} (${diferenciaPrecio > 0 ? `+${diferenciaPrecio.toFixed(1)}% sobre precio justo` : `${diferenciaPrecio.toFixed(1)}% bajo precio justo`}). ${valuacion}.`;

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
