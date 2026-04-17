/**
 * Calculadora de descuento Infonavit sobre el sueldo
 * Descuento aplicado mensualmente al trabajador por crédito de vivienda
 */

export interface Inputs {
  sueldoBrutoMensual: number;
  factorDescuento?: number; // en %
}

export interface Outputs {
  descuentoMensual: number;
  sueldoConDescuento: number;
  porcentajeAplicado: number;
  mensaje: string;
}

export function infonavitDescuentoSueldo(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoBrutoMensual);
  const factor = Number(i.factorDescuento ?? 30);

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo bruto mensual');
  if (factor < 0 || factor > 100) throw new Error('Factor de descuento debe estar entre 0 y 100');

  const descuentoMensual = sueldo * factor / 100;
  const sueldoConDescuento = sueldo - descuentoMensual;

  return {
    descuentoMensual: Number(descuentoMensual.toFixed(2)),
    sueldoConDescuento: Number(sueldoConDescuento.toFixed(2)),
    porcentajeAplicado: factor,
    mensaje: `Con factor ${factor}%, Infonavit te descuenta $${descuentoMensual.toFixed(2)} y recibís $${sueldoConDescuento.toFixed(2)}.`,
  };
}
