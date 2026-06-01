/** Cálculo de descuentos — simple, sucesivos y descuento final sobre venta */
export interface Inputs {
  precio: number;
  descuento1: number;
  descuento2?: number;
  descuento3?: number;
}
export interface Outputs {
  precioFinal: number;
  ahorro: number;
  descuentoEfectivo: number;
  precioTrasDescuento1: number;
  precioTrasDescuento2: number;
  _chart?: any;
  _insight?: any;
}

export function descuento(i: Inputs): Outputs {
  const precio = Number(i.precio);
  const d1 = Number(i.descuento1) || 0;
  const d2 = Number(i.descuento2) || 0;
  const d3 = Number(i.descuento3) || 0;
  if (!precio || precio <= 0) throw new Error('Ingresá el precio');

  const tras1 = precio * (1 - d1 / 100);
  const tras2 = tras1 * (1 - d2 / 100);
  const tras3 = tras2 * (1 - d3 / 100);
  const final = tras3;
  const ahorro = precio - final;
  const efectivo = ((precio - final) / precio) * 100;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Pagás', value: Math.round(final) },
      { label: 'Ahorrás', value: Math.round(ahorro) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(precio).toLocaleString('es-AR'),
    centerLabel: 'Precio original',
    ariaLabel: 'Composición del precio original: lo que pagás más lo que ahorrás con el descuento',
  };

  const efectivoR = Number(efectivo.toFixed(1));
  const sumaNominal = d1 + d2 + d3;
  const hayEncadenado = (d2 > 0 || d3 > 0);
  const insight = {
    title: hayEncadenado ? 'Descuentos encadenados' : 'Tu descuento real',
    text: hayEncadenado
      ? `Encadenar los descuentos no suma **${sumaNominal.toFixed(0)}%**: el efectivo real es **${efectivoR}%** porque cada uno se aplica sobre el saldo anterior. Ahorrás **$${Math.round(ahorro).toLocaleString('es-AR')}** y pagás **$${Math.round(final).toLocaleString('es-AR')}**.`
      : `Con un **${efectivoR}%** de descuento te ahorrás **$${Math.round(ahorro).toLocaleString('es-AR')}** y pagás **$${Math.round(final).toLocaleString('es-AR')}** en vez de $${Math.round(precio).toLocaleString('es-AR')}.`,
    tone: 'good' as const,
    icon: '🏷️',
  };

  return {
    precioFinal: Math.round(final),
    ahorro: Math.round(ahorro),
    descuentoEfectivo: Number(efectivo.toFixed(2)),
    precioTrasDescuento1: Math.round(tras1),
    precioTrasDescuento2: Math.round(tras2),
    _chart: chart,
    _insight: insight,
  };
}
