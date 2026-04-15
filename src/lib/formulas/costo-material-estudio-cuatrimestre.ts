/** Calculadora de costo de materiales de estudio por cuatrimestre */

export interface Inputs {
  gastoFotocopias: number;
  gastoLibros: number;
  gastoSuscripciones: number;
  gastoOtros: number;
}

export interface Outputs {
  costoTotal: number;
  costoMensual: number;
  detalle: string;
}

export function costoMaterialEstudioCuatrimestre(i: Inputs): Outputs {
  const fotocopias = Number(i.gastoFotocopias) || 0;
  const libros = Number(i.gastoLibros) || 0;
  const suscripciones = Number(i.gastoSuscripciones) || 0;
  const otros = Number(i.gastoOtros) || 0;

  if (fotocopias < 0 || libros < 0 || suscripciones < 0 || otros < 0) {
    throw new Error('Los montos no pueden ser negativos');
  }

  const total = fotocopias + libros + suscripciones + otros;

  if (total === 0) {
    throw new Error('Ingresá al menos un gasto para calcular');
  }

  const mensual = total / 5; // 5 meses por cuatrimestre

  return {
    costoTotal: Math.round(total),
    costoMensual: Math.round(mensual),
    detalle: `Total cuatrimestre: $${total.toLocaleString('es-AR')} (Fotocopias: $${fotocopias.toLocaleString('es-AR')} + Libros: $${libros.toLocaleString('es-AR')} + Suscripciones: $${suscripciones.toLocaleString('es-AR')} + Otros: $${otros.toLocaleString('es-AR')}). Promedio mensual: $${mensual.toLocaleString('es-AR')}`,
  };
}
