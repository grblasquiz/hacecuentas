/** Costo mensual EOR (Deel/Remote/Oyster) según país del empleado y salario */
export interface Inputs { pais: string; salarioBrutoUsd: number; provider: string; incluyeBeneficios: boolean; }
export interface Outputs { feeEorUsd: number; cargasSocialesUsd: number; costoTotalEmpleadorUsd: number; costoEfectivoVsSalarioPct: number; explicacion: string; }
export function employerOfRecordEorCostoMesPais(i: Inputs): Outputs {
  const pais = String(i.pais || '').toUpperCase();
  const salario = Number(i.salarioBrutoUsd);
  const provider = String(i.provider || '').toLowerCase();
  const beneficios = !!i.incluyeBeneficios;
  if (!salario || salario <= 0) throw new Error('Ingresá el salario bruto en USD');
  // Cargas sociales empleador 2026 (% sobre salario bruto)
  const cargasPais: Record<string, number> = {
    'AR': 0.27, 'BR': 0.36, 'MX': 0.30, 'CL': 0.05, 'UY': 0.20, 'CO': 0.21, 'PE': 0.10,
    'ES': 0.32, 'DE': 0.21, 'FR': 0.45, 'UK': 0.15, 'US': 0.12, 'IN': 0.13, 'PH': 0.10,
  };
  // Fee EOR provider (USD/mes flat o %)
  const feeProvider: Record<string, number> = {
    'deel': 599, 'remote': 599, 'oyster': 599, 'rippling': 500, 'globalization-partners': 800, 'velocity-global': 750,
  };
  const cargasPct = cargasPais[pais] ?? 0.20;
  const fee = feeProvider[provider] ?? 599;
  const cargas = salario * cargasPct;
  const beneficiosUsd = beneficios ? salario * 0.08 : 0;
  const total = salario + cargas + fee + beneficiosUsd;
  const sobreSalario = ((total - salario) / salario) * 100;
  return {
    feeEorUsd: Number(fee.toFixed(0)),
    cargasSocialesUsd: Number(cargas.toFixed(0)),
    costoTotalEmpleadorUsd: Number(total.toFixed(0)),
    costoEfectivoVsSalarioPct: Number(sobreSalario.toFixed(1)),
    explicacion: `Empleado ${pais} a USD ${salario}/mes vía ${provider}: cargas USD ${cargas.toFixed(0)} + fee EOR USD ${fee}. Costo total empleador USD ${total.toFixed(0)}/mes (+${sobreSalario.toFixed(1)}% sobre salario).`,
  };
}
