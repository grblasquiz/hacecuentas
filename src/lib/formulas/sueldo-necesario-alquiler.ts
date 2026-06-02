/** Sueldo mínimo necesario para que el alquiler no supere un porcentaje del ingreso */

export interface Inputs {
  alquilerMensual: number;
  porcentajeMaximo: number;
}

export interface Outputs {
  sueldoMinimo: number;
  sobranteMensual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function sueldoNecesarioAlquiler(i: Inputs): Outputs {
  const alquiler = Number(i.alquilerMensual);
  const porcentaje = Number(i.porcentajeMaximo);

  if (isNaN(alquiler) || alquiler <= 0) throw new Error('Ingresá el monto del alquiler mensual');
  if (isNaN(porcentaje) || porcentaje <= 0 || porcentaje > 100) throw new Error('El porcentaje debe estar entre 1 y 100');

  const sueldoMinimo = alquiler / (porcentaje / 100);
  const sobranteMensual = sueldoMinimo - alquiler;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Para que un alquiler de $${fmt.format(alquiler)} no supere el ${porcentaje}% de tu ingreso, ` +
    `necesitás ganar al menos $${fmt.format(sueldoMinimo)} en mano. ` +
    `Te quedarían $${fmt.format(sobranteMensual)} (${(100 - porcentaje).toFixed(0)}%) para el resto de tus gastos y ahorro.`;

  const tone = porcentaje > 30 ? 'warn' : 'good';
  const insight = {
    title: 'Cuánto necesitás ganar',
    text: `Para que un alquiler de **$${fmt.format(alquiler)}** sea el **${porcentaje}%** de tu ingreso, necesitás ganar **$${fmt.format(sueldoMinimo)}** en mano y te quedarían **$${fmt.format(sobranteMensual)}** para todo lo demás. ` +
      (porcentaje > 30
        ? `Destinar más del 30% al alquiler aprieta el presupuesto: cualquier imprevisto te complica.`
        : `Estás dentro de la regla del 30%, un nivel sano que deja margen para gastos y ahorro.`),
    tone,
    icon: '🏠',
  };

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Alquiler', value: Math.round(alquiler) },
      { label: 'Resto (gastos + ahorro)', value: Math.round(sobranteMensual) },
    ],
    prefix: '$',
    centerValue: '$' + fmt.format(Math.round(sueldoMinimo)),
    centerLabel: 'Sueldo necesario',
    ariaLabel: 'Composición del sueldo necesario: parte que se va en alquiler y parte que queda para el resto.',
  };

  return {
    sueldoMinimo: Math.round(sueldoMinimo),
    sobranteMensual: Math.round(sobranteMensual),
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
