/** Calculadora de descuento y precio final */
export interface Inputs {
  precioOriginal: number;
  descuento1: number;
  descuento2?: number;
}
export interface Outputs {
  precioFinal: number;
  ahorro: number;
  descuentoTotal: string;
  _insight?: any;
  _chart?: any;
}

export function descuentoPorcentajePrecio(i: Inputs): Outputs {
  const precio = Number(i.precioOriginal);
  const d1 = Number(i.descuento1);
  const d2 = Number(i.descuento2) || 0;

  if (!precio || precio <= 0) throw new Error('Ingresá el precio original');
  if (d1 < 0 || d1 > 100) throw new Error('El descuento debe estar entre 0 y 100%');
  if (d2 < 0 || d2 > 100) throw new Error('El segundo descuento debe estar entre 0 y 100%');

  const factor1 = 1 - d1 / 100;
  const factor2 = 1 - d2 / 100;
  const precioFinal = precio * factor1 * factor2;
  const ahorro = precio - precioFinal;
  const descuentoTotalPct = ((ahorro / precio) * 100);

  const precioFinalR = Math.round(precioFinal);
  const ahorroR = Math.round(ahorro);
  const fmt = (n: number) => n.toLocaleString('es-AR');
  const aplicado = d2 > 0
    ? `Encadenando **${d1}%** y **${d2}%** el descuento real es **${descuentoTotalPct.toFixed(1)}%** (no ${d1 + d2}%: el segundo se aplica sobre el precio ya rebajado).`
    : `Con **${d1}%** de descuento pagás **$${fmt(precioFinalR)}** y ahorrás **$${fmt(ahorroR)}**.`;

  return {
    precioFinal: precioFinalR,
    ahorro: ahorroR,
    descuentoTotal: `${descuentoTotalPct.toFixed(1)}%`,
    _insight: {
      title: 'Tu descuento real',
      text: aplicado,
      tone: descuentoTotalPct >= 30 ? 'good' : 'neutral',
      icon: '🏷️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Pagás', value: precioFinalR },
        { label: 'Ahorrás', value: ahorroR },
      ],
      prefix: '$',
      centerValue: `$${fmt(Math.round(precio))}`,
      centerLabel: 'Precio original',
      ariaLabel: `De $${fmt(Math.round(precio))} originales, pagás $${fmt(precioFinalR)} y ahorrás $${fmt(ahorroR)}.`,
    },
  };
}
