/** Depreciación de activos fijos por método de línea recta */

export interface Inputs {
  valorCompra: number;
  valorResidual: number;
  vidaUtilAnos: number;
}

export interface Outputs {
  depreciacionAnual: number;
  depreciacionMensual: number;
  tasaDepreciacion: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function depreciacionActivosLineaRecta(i: Inputs): Outputs {
  const compra = Number(i.valorCompra);
  const residual = Number(i.valorResidual);
  const vida = Number(i.vidaUtilAnos);

  if (isNaN(compra) || compra <= 0) throw new Error('Ingresá el valor de compra del activo');
  if (isNaN(residual) || residual < 0) throw new Error('El valor residual no puede ser negativo');
  if (residual >= compra) throw new Error('El valor residual debe ser menor al valor de compra');
  if (isNaN(vida) || vida < 1) throw new Error('La vida útil debe ser al menos 1 año');

  const baseDepreciable = compra - residual;
  const depreciacionAnual = baseDepreciable / vida;
  const depreciacionMensual = depreciacionAnual / 12;
  const tasaDepreciacion = (1 / vida) * 100;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Base depreciable: $${fmt.format(compra)} − $${fmt.format(residual)} = $${fmt.format(baseDepreciable)}. ` +
    `Depreciación anual: $${fmt.format(depreciacionAnual)} (${tasaDepreciacion.toFixed(1)}% por año). ` +
    `Depreciación mensual: $${fmt.format(depreciacionMensual)}. ` +
    `En ${vida} años el activo alcanza su valor residual de $${fmt.format(residual)}.`;

  const _insight = {
    title: 'Cuánto pierde de valor por año',
    text: `Cada año el activo se deprecia **$${fmt.format(depreciacionAnual)}** (${tasaDepreciacion.toFixed(1)}% del valor amortizable), o **$${fmt.format(depreciacionMensual)}** por mes. Tras **${vida} ${vida === 1 ? 'año' : 'años'}** queda en su valor residual de $${fmt.format(residual)}.`,
    tone: 'neutral',
    icon: '📉',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Total a depreciar', value: Math.round(baseDepreciable) },
      { label: 'Valor residual', value: Math.round(residual) },
    ],
    prefix: '$',
    centerValue: '$' + fmt.format(compra),
    centerLabel: 'Valor de compra',
    ariaLabel: `De $${fmt.format(compra)} de compra, $${fmt.format(baseDepreciable)} se deprecian y $${fmt.format(residual)} quedan como valor residual.`,
  };

  return {
    depreciacionAnual: Math.round(depreciacionAnual),
    depreciacionMensual: Math.round(depreciacionMensual),
    tasaDepreciacion: Number(tasaDepreciacion.toFixed(1)),
    detalle,
    _insight,
    _chart,
  };
}
