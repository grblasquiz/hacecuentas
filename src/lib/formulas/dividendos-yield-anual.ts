/** Dividend Yield anual y proyección de ingreso pasivo */
export interface Inputs {
  precioAccion: number;
  dividendoAnualPorAccion: number;
  cantidadAcciones?: number;
  frecuenciaPagos?: 'mensual' | 'trimestral' | 'semestral' | 'anual';
}
export interface Outputs {
  yieldAnual: number;
  ingresoAnual: number;
  ingresoMensual: number;
  ingresoPorPago: number;
  inversionTotal: number;
  categoria: string;
  resumen: string;
}

export function dividendosYieldAnual(i: Inputs): Outputs {
  const precio = Number(i.precioAccion);
  const div = Number(i.dividendoAnualPorAccion);
  const acciones = Number(i.cantidadAcciones) || 100;
  const freq = i.frecuenciaPagos || 'trimestral';

  if (!precio || precio <= 0) throw new Error('Ingresá el precio por acción');
  if (!div || div <= 0) throw new Error('Ingresá el dividendo anual por acción');
  if (acciones <= 0) throw new Error('La cantidad de acciones debe ser positiva');

  const yieldAnual = (div / precio) * 100;
  const ingresoAnual = div * acciones;
  const ingresoMensual = ingresoAnual / 12;
  const pagosPorAnio: Record<string, number> = { mensual: 12, trimestral: 4, semestral: 2, anual: 1 };
  const pagos = pagosPorAnio[freq] || 4;
  const ingresoPorPago = ingresoAnual / pagos;
  const inversionTotal = precio * acciones;

  let categoria = '';
  if (yieldAnual >= 8) categoria = 'Yield alto — posible trampa de dividendo, revisá sostenibilidad.';
  else if (yieldAnual >= 4) categoria = 'Yield atractivo — típico de acciones de valor y REITs.';
  else if (yieldAnual >= 2) categoria = 'Yield moderado — blue chips maduros.';
  else if (yieldAnual > 0) categoria = 'Yield bajo — típico de growth stocks.';
  else categoria = 'Sin dividendos.';

  const resumen = `Con ${acciones} acciones generarías ${ingresoAnual.toFixed(2)} al año (${yieldAnual.toFixed(2)}% de yield).`;

  return {
    yieldAnual: Number(yieldAnual.toFixed(2)),
    ingresoAnual: Number(ingresoAnual.toFixed(2)),
    ingresoMensual: Number(ingresoMensual.toFixed(2)),
    ingresoPorPago: Number(ingresoPorPago.toFixed(2)),
    inversionTotal: Number(inversionTotal.toFixed(2)),
    categoria,
    resumen,
  };
}
