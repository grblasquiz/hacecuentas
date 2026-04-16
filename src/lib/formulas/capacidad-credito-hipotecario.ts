/** Capacidad de crédito hipotecario */
export interface Inputs {
  ingresoNeto: number;
  tasaAnual: number;
  plazoAnios: number;
  porcentajeIngreso?: number;
}
export interface Outputs {
  montoMaximo: number;
  cuotaMaxima: number;
  valorPropiedadEstimado: number;
}

export function capacidadCreditoHipotecario(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoNeto);
  const tasaAnual = Number(i.tasaAnual);
  const plazo = Number(i.plazoAnios);
  const pctIngreso = Number(i.porcentajeIngreso) || 25;

  if (!ingreso || ingreso <= 0) throw new Error('Ingresá tu ingreso neto mensual');
  if (tasaAnual < 0) throw new Error('La tasa no puede ser negativa');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo en años');

  const cuotaMaxima = ingreso * (pctIngreso / 100);
  const tasaMensual = tasaAnual / 100 / 12;
  const meses = plazo * 12;

  let montoMaximo: number;
  if (tasaMensual > 0) {
    montoMaximo = cuotaMaxima * (1 - Math.pow(1 + tasaMensual, -meses)) / tasaMensual;
  } else {
    montoMaximo = cuotaMaxima * meses;
  }

  // Propiedad estimada: crédito cubre el 75% (25% pie)
  const valorPropiedadEstimado = montoMaximo / 0.75;

  return {
    montoMaximo: Math.round(montoMaximo),
    cuotaMaxima: Math.round(cuotaMaxima),
    valorPropiedadEstimado: Math.round(valorPropiedadEstimado),
  };
}
