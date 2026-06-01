/** Precio efectivo con descuentos escalonados por volumen (quantity breaks) */
export interface Inputs {
  precioUnitario: number;
  cantidad: number;
  descuentoPorcentaje: number; // % descuento aplicado a la cantidad
  consumoMensualEstimado?: number;
}
export interface Outputs {
  subtotal: number;
  descuentoMonto: number;
  total: number;
  precioEfectivoUnitario: number;
  precioUnitarioDescuento: number;
  costoTotalBase: number;
  costoTotalConDescuento: number;
  ahorroTotal: number;
  ahorroPorcentaje: number;
  ahorroPorUnidad: number;
  mesesParaConsumir: number;
  resumen: string;
  _chart?: any;
  _insight?: any;
}

export function descuentoVolumenCantidad(i: Inputs): Outputs {
  const precio = Number(i.precioUnitario);
  const cant = Number(i.cantidad);
  const desc = Number(i.descuentoPorcentaje);
  const consumoMensual = Number(i.consumoMensualEstimado) || 0;

  if (!precio || precio <= 0) throw new Error('Ingresá el precio unitario');
  if (!cant || cant <= 0) throw new Error('Ingresá la cantidad');
  if (desc < 0 || desc > 100) throw new Error('El descuento debe estar entre 0% y 100%');

  const subtotal = precio * cant;
  const descMonto = subtotal * (desc / 100);
  const total = subtotal - descMonto;
  const precioEfectivo = total / cant;
  const ahorroUnit = precio - precioEfectivo;

  const mesesParaConsumir = consumoMensual > 0
    ? Number((cant / consumoMensual).toFixed(1))
    : 0;

  const resumen = `Comprando ${cant} unidades con ${desc}% de descuento, pagás ${total.toLocaleString()} total (${precioEfectivo.toFixed(2)} por unidad, ahorrás ${ahorroUnit.toFixed(2)} en cada una).`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Pagás', value: Math.round(total) },
      { label: 'Ahorrás', value: Math.round(descMonto) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(subtotal).toLocaleString('es-AR'),
    centerLabel: 'Sin descuento',
    ariaLabel: 'Composición del precio sin descuento: lo que pagás y lo que ahorrás',
  };

  const stockMsg = mesesParaConsumir > 0
    ? ` Ese stock te cubre **~${mesesParaConsumir} ${mesesParaConsumir === 1 ? 'mes' : 'meses'}** de consumo, así que pesá el ahorro contra la plata inmovilizada.`
    : '';
  const insight = {
    title: desc > 0 ? 'Cuánto te ahorra el volumen' : 'Sin descuento aplicado',
    text: desc > 0
      ? `Comprando ${cant} unidades te llevás **${desc.toFixed(desc % 1 === 0 ? 0 : 2)}% off**: pagás **${precioEfectivo.toFixed(2)}/u** en vez de ${precio.toFixed(2)} y ahorrás **${Math.round(descMonto).toLocaleString('es-AR')}** en total (**${ahorroUnit.toFixed(2)} por unidad**).${stockMsg}`
      : `No cargaste descuento: pagás el precio de lista **${precio.toFixed(2)}/u** (${Math.round(total).toLocaleString('es-AR')} por ${cant} unidades). Probá un % de quantity break para ver el ahorro.`,
    tone: (desc > 0 ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🏷️',
  };

  return {
    subtotal: Math.round(subtotal),
    descuentoMonto: Math.round(descMonto),
    total: Math.round(total),
    precioEfectivoUnitario: Number(precioEfectivo.toFixed(2)),
    precioUnitarioDescuento: Number(precioEfectivo.toFixed(2)),
    costoTotalBase: Math.round(subtotal),
    costoTotalConDescuento: Math.round(total),
    ahorroTotal: Math.round(descMonto),
    ahorroPorcentaje: Number(desc.toFixed(2)),
    ahorroPorUnidad: Number(ahorroUnit.toFixed(2)),
    mesesParaConsumir,
    resumen,
    _chart: chart,
    _insight: insight,
  };
}
