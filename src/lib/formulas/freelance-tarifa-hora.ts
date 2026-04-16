/**
 * Calculadora de Tarifa Freelance por Hora
 * Incluye impuestos, vacaciones, costos fijos y horas facturables reales
 */

export interface FreelanceTarifaInputs {
  ingresoDeseado: number;
  costosFijos: number;
  impuestosMensual: number;
  horasSemanales: number;
  semanasVacaciones: number;
}

export interface FreelanceTarifaOutputs {
  tarifaHora: number;
  tarifaHoraUSD: string;
  ingresoMensualNecesario: number;
  horasFacturablesMes: number;
}

export function freelanceTarifaHora(inputs: FreelanceTarifaInputs): FreelanceTarifaOutputs {
  const ingresoDeseado = Number(inputs.ingresoDeseado);
  const costosFijos = Math.max(0, Number(inputs.costosFijos) || 0);
  const impuestos = Math.max(0, Number(inputs.impuestosMensual) || 0);
  const horasSemanales = Number(inputs.horasSemanales) || 30;
  const semanasVacaciones = Number(inputs.semanasVacaciones) || 3;

  if (!ingresoDeseado || ingresoDeseado <= 0) {
    throw new Error('Ingresá el ingreso neto mensual deseado');
  }

  const ingresoMensualNecesario = ingresoDeseado + costosFijos + impuestos;

  // Semanas facturables al año = 52 - vacaciones
  const semanasFacturables = 52 - semanasVacaciones;
  const semanasPorMes = semanasFacturables / 12;
  const horasFacturablesMes = Math.round(horasSemanales * semanasPorMes * 10) / 10;

  const tarifaHora = ingresoMensualNecesario / horasFacturablesMes;

  // Estimación USD (tipo de cambio aproximado, solo referencial)
  const tipoCambioAprox = 1200; // referencial
  const tarifaUSD = tarifaHora / tipoCambioAprox;

  return {
    tarifaHora: Math.round(tarifaHora),
    tarifaHoraUSD: `~USD ${tarifaUSD.toFixed(1)}/hora (tipo cambio ref.)`,
    ingresoMensualNecesario: Math.round(ingresoMensualNecesario),
    horasFacturablesMes: Math.round(horasFacturablesMes),
  };
}
