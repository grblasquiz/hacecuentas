/** Cuánta plata ahorrás si dejás de fumar */
export interface Inputs {
  cigarrillosPorDia: number;
  precioPaquete: number;
  cigarrillosPorPaquete: number;
}
export interface Outputs {
  gastoDiario: number;
  gastoSemanal: number;
  gastoMensual: number;
  gastoAnual: number;
  ahorro5Anios: number;
  ahorro10Anios: number;
  diasVidaRecuperados: number;
  mensaje: string;
}

export function cigarrillosAhorro(i: Inputs): Outputs {
  const cigPorDia = Number(i.cigarrillosPorDia);
  const precioPaquete = Number(i.precioPaquete);
  const cigPorPaquete = Number(i.cigarrillosPorPaquete) || 20;

  if (!cigPorDia || cigPorDia <= 0) throw new Error('Ingresá cuántos cigarrillos fumás por día');
  if (!precioPaquete || precioPaquete <= 0) throw new Error('Ingresá el precio del paquete');

  const precioPorCig = precioPaquete / cigPorPaquete;
  const gastoDiario = cigPorDia * precioPorCig;
  const gastoSemanal = gastoDiario * 7;
  const gastoMensual = gastoDiario * 30;
  const gastoAnual = gastoDiario * 365;
  const ahorro5Anios = gastoAnual * 5;
  const ahorro10Anios = gastoAnual * 10;

  // Cada cigarrillo resta ~11 minutos de vida (estudio BMJ)
  const diasVidaRecuperados = Math.round((cigPorDia * 11 * 365) / (60 * 24));

  return {
    gastoDiario: Math.round(gastoDiario),
    gastoSemanal: Math.round(gastoSemanal),
    gastoMensual: Math.round(gastoMensual),
    gastoAnual: Math.round(gastoAnual),
    ahorro5Anios: Math.round(ahorro5Anios),
    ahorro10Anios: Math.round(ahorro10Anios),
    diasVidaRecuperados,
    mensaje: `Ahorrás $${Math.round(gastoMensual)}/mes y $${Math.round(gastoAnual)}/año. En 10 años: $${Math.round(ahorro10Anios)}. Recuperás ~${diasVidaRecuperados} días de vida por año.`,
  };
}
