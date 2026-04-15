/** Calculadora de porcentaje de avance de carrera universitaria */

export interface Inputs {
  creditosAprobados: number;
  creditosTotales: number;
}

export interface Outputs {
  porcentajeAvance: number;
  creditosFaltantes: number;
  detalle: string;
}

export function creditosUniversitariosAvance(i: Inputs): Outputs {
  const aprobados = Number(i.creditosAprobados);
  const totales = Number(i.creditosTotales);

  if (isNaN(aprobados) || aprobados < 0) {
    throw new Error('Ingresá una cantidad válida de créditos aprobados');
  }
  if (isNaN(totales) || totales <= 0) {
    throw new Error('El total de créditos debe ser mayor a 0');
  }
  if (aprobados > totales) {
    throw new Error('Los créditos aprobados no pueden superar el total del plan');
  }

  const porcentajeAvance = (aprobados / totales) * 100;
  const faltantes = totales - aprobados;

  return {
    porcentajeAvance: Math.round(porcentajeAvance * 100) / 100,
    creditosFaltantes: faltantes,
    detalle: `Completaste ${aprobados} de ${totales} (${porcentajeAvance.toFixed(1)}%). Te faltan ${faltantes} para recibirte.`,
  };
}
