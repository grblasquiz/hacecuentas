/** Calcula la depreciación y valor residual de un vehículo (modelo exponencial) */
export interface Inputs {
  precioCompra: number;
  anosProyeccion: number;
  tasaDepreciacion: number;
}
export interface Outputs {
  valorResidual: number;
  perdidaTotal: number;
  porcentajeRetenido: number;
  depreciacionAnualProm: number;
  detalle: string;
}

export function amortizacionAutoValorResidual(i: Inputs): Outputs {
  const precio = Number(i.precioCompra);
  const anos = Number(i.anosProyeccion);
  const tasa = Number(i.tasaDepreciacion);

  if (!precio || precio <= 0) throw new Error('Ingresá el precio de compra del vehículo');
  if (!anos || anos < 1 || anos > 20) throw new Error('Los años a proyectar deben estar entre 1 y 20');
  if (!tasa || tasa < 5 || tasa > 40) throw new Error('La tasa de depreciación debe estar entre 5% y 40%');

  const factor = 1 - tasa / 100;
  const valorResidual = precio * Math.pow(factor, anos);
  const perdidaTotal = precio - valorResidual;
  const porcentajeRetenido = (valorResidual / precio) * 100;
  const depreciacionAnualProm = perdidaTotal / anos;

  return {
    valorResidual: Math.round(valorResidual),
    perdidaTotal: Math.round(perdidaTotal),
    porcentajeRetenido: Number(porcentajeRetenido.toFixed(1)),
    depreciacionAnualProm: Math.round(depreciacionAnualProm),
    detalle: `Después de ${anos} año(s), el auto valdría ~$${Math.round(valorResidual).toLocaleString('es-AR')} (retiene ${porcentajeRetenido.toFixed(1)}% del valor). Pérdida total: $${Math.round(perdidaTotal).toLocaleString('es-AR')}. Depreciación promedio: $${Math.round(depreciacionAnualProm).toLocaleString('es-AR')}/año.`,
  };
}
