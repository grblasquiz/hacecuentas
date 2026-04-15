/** Tasa de abandono de carrito e ingreso perdido */

export interface Inputs {
  visitasCheckout: number;
  comprasCompletadas: number;
  ticketPromedio: number;
}

export interface Outputs {
  tasaAbandono: number;
  ingresoPerdido: number;
  tasaConversion: number;
  detalle: string;
}

export function tasaAbandonoCarrito(i: Inputs): Outputs {
  const visitas = Number(i.visitasCheckout);
  const compras = Number(i.comprasCompletadas);
  const ticket = Number(i.ticketPromedio);

  if (isNaN(visitas) || visitas < 1) throw new Error('Ingresá las visitas al checkout');
  if (isNaN(compras) || compras < 0) throw new Error('Las compras no pueden ser negativas');
  if (compras > visitas) throw new Error('Las compras no pueden ser más que las visitas al checkout');
  if (isNaN(ticket) || ticket <= 0) throw new Error('Ingresá el ticket promedio');

  const abandonados = visitas - compras;
  const tasaAbandono = (abandonados / visitas) * 100;
  const tasaConversion = (compras / visitas) * 100;
  const ingresoPerdido = abandonados * ticket;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  // Estimar recuperación potencial (10% de abandonos)
  const recuperacion10 = Math.round(abandonados * 0.10);
  const ingresoRecuperable = recuperacion10 * ticket;

  let evaluacion: string;
  if (tasaAbandono <= 55) evaluacion = 'Excelente — muy por debajo del promedio (70%).';
  else if (tasaAbandono <= 70) evaluacion = 'Normal — dentro del promedio de la industria.';
  else if (tasaAbandono <= 80) evaluacion = 'Alto — hay oportunidades de mejora importantes.';
  else evaluacion = 'Muy alto — revisá urgente tu proceso de checkout.';

  const detalle =
    `De ${visitas} personas que iniciaron el checkout, ${compras} compraron y ${abandonados} abandonaron. ` +
    `Tasa de abandono: ${tasaAbandono.toFixed(1)}%. Ingreso perdido: $${fmt.format(ingresoPerdido)}. ` +
    `Si recuperás el 10% de los abandonos (${recuperacion10} ventas), ganás $${fmt.format(ingresoRecuperable)} extra. ` +
    evaluacion;

  return {
    tasaAbandono: Number(tasaAbandono.toFixed(1)),
    ingresoPerdido: Math.round(ingresoPerdido),
    tasaConversion: Number(tasaConversion.toFixed(1)),
    detalle,
  };
}
