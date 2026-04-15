/** Ticket promedio y métricas de venta */

export interface Inputs {
  ventasTotales: number;
  cantidadTransacciones: number;
}

export interface Outputs {
  ticketPromedio: number;
  detalle: string;
}

export function ticketPromedio(i: Inputs): Outputs {
  const ventas = Number(i.ventasTotales);
  const transacciones = Number(i.cantidadTransacciones);

  if (isNaN(ventas) || ventas <= 0) throw new Error('Ingresá las ventas totales del período');
  if (isNaN(transacciones) || transacciones < 1) throw new Error('La cantidad de transacciones debe ser al menos 1');

  const ticket = ventas / transacciones;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Calcular impacto de subir 10%
  const ticket10 = ticket * 1.10;
  const facturacion10 = ticket10 * transacciones;

  const detalle =
    `Ticket promedio: $${fmt.format(ticket)} por transacción ` +
    `($${fmt.format(ventas)} en ${transacciones} ventas). ` +
    `Si subís el ticket un 10% a $${fmt.format(ticket10)}, tu facturación sería $${fmt.format(facturacion10)} ` +
    `(+$${fmt.format(facturacion10 - ventas)}).`;

  return {
    ticketPromedio: Math.round(ticket),
    detalle,
  };
}
