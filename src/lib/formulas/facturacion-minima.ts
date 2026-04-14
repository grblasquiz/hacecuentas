/** Facturación mínima para cubrir costos + margen objetivo */
export interface Inputs {
  costosFijosMensuales: number;
  margenContribucion: number;
  gananciaObjetivoMensual?: number;
}
export interface Outputs {
  facturacionMinima: number;
  facturacionConGanancia: number;
  facturacionDiaria: number;
  facturacionDiariaConGanancia: number;
}

export function facturacionMinima(i: Inputs): Outputs {
  const cf = Number(i.costosFijosMensuales);
  const margen = Number(i.margenContribucion) / 100;
  const ganancia = Number(i.gananciaObjetivoMensual) || 0;
  if (!cf || cf <= 0) throw new Error('Ingresá los costos fijos');
  if (margen <= 0 || margen > 1) throw new Error('El margen debe estar entre 0 y 100 %');

  const facturacionBE = cf / margen;
  const facturacionTotal = (cf + ganancia) / margen;

  return {
    facturacionMinima: Math.round(facturacionBE),
    facturacionConGanancia: Math.round(facturacionTotal),
    facturacionDiaria: Math.round(facturacionBE / 30),
    facturacionDiariaConGanancia: Math.round(facturacionTotal / 30),
  };
}
