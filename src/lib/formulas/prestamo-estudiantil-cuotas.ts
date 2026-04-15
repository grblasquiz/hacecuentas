/** Calculadora de cuotas de préstamo estudiantil (sistema francés) */

export interface Inputs {
  montoPrestamo: number;
  tasaAnual: number;
  plazoMeses: number;
}

export interface Outputs {
  cuotaMensual: number;
  totalAPagar: number;
  totalIntereses: number;
  detalle: string;
}

export function prestamoEstudiantilCuotas(i: Inputs): Outputs {
  const monto = Number(i.montoPrestamo);
  const tasaAnual = Number(i.tasaAnual);
  const plazo = Number(i.plazoMeses);

  if (isNaN(monto) || monto <= 0) {
    throw new Error('Ingresá el monto del préstamo');
  }
  if (isNaN(tasaAnual) || tasaAnual < 0) {
    throw new Error('La tasa de interés no puede ser negativa');
  }
  if (isNaN(plazo) || plazo < 1) {
    throw new Error('El plazo debe ser al menos 1 mes');
  }

  let cuotaMensual: number;

  if (tasaAnual === 0) {
    cuotaMensual = monto / plazo;
  } else {
    const tasaMensual = tasaAnual / 100 / 12;
    const factor = Math.pow(1 + tasaMensual, plazo);
    cuotaMensual = monto * (tasaMensual * factor) / (factor - 1);
  }

  const totalAPagar = cuotaMensual * plazo;
  const totalIntereses = totalAPagar - monto;

  return {
    cuotaMensual: Math.round(cuotaMensual),
    totalAPagar: Math.round(totalAPagar),
    totalIntereses: Math.round(totalIntereses),
    detalle: `Préstamo de $${monto.toLocaleString('es-AR')} a ${tasaAnual}% anual en ${plazo} meses. Cuota: $${Math.round(cuotaMensual).toLocaleString('es-AR')}/mes. Total a pagar: $${Math.round(totalAPagar).toLocaleString('es-AR')} (intereses: $${Math.round(totalIntereses).toLocaleString('es-AR')})`,
  };
}
