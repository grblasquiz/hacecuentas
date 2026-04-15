/** Sueldo mínimo necesario para que el alquiler no supere un porcentaje del ingreso */

export interface Inputs {
  alquilerMensual: number;
  porcentajeMaximo: number;
}

export interface Outputs {
  sueldoMinimo: number;
  sobranteMensual: number;
  detalle: string;
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

  return {
    sueldoMinimo: Math.round(sueldoMinimo),
    sobranteMensual: Math.round(sobranteMensual),
    detalle,
  };
}
