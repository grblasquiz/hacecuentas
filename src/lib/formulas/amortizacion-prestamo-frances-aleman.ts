/**
 * Calculadora de amortización de préstamo — sistema francés y alemán
 * Francés: cuota = M × i × (1+i)^n / ((1+i)^n − 1)
 * Alemán: amortización fija = M/n, cuota decreciente
 */

export interface AmortizacionPrestamoFrancesAlemanInputs {
  monto: number;
  tna: number;
  plazoMeses: number;
  sistema: string; // 'frances' | 'aleman'
}

export interface AmortizacionPrestamoFrancesAlemanOutputs {
  cuotaInicial: number;
  totalIntereses: number;
  totalPagado: number;
  detalle: string;
}

export function amortizacionPrestamoFrancesAleman(
  inputs: AmortizacionPrestamoFrancesAlemanInputs
): AmortizacionPrestamoFrancesAlemanOutputs {
  const monto = Number(inputs.monto);
  const tna = Number(inputs.tna);
  const plazo = Math.round(Number(inputs.plazoMeses));
  const sistema = (inputs.sistema || 'frances').toLowerCase();

  if (!monto || monto <= 0) throw new Error('Ingresá el monto del préstamo');
  if (!tna || tna <= 0) throw new Error('Ingresá la TNA del préstamo');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo en meses');
  if (sistema !== 'frances' && sistema !== 'aleman')
    throw new Error('Seleccioná sistema francés o alemán');

  const i = tna / 100 / 12;

  if (sistema === 'frances') {
    const factor = Math.pow(1 + i, plazo);
    const cuota = monto * (i * factor) / (factor - 1);
    const totalPagado = cuota * plazo;
    const totalIntereses = totalPagado - monto;

    return {
      cuotaInicial: Math.round(cuota),
      totalIntereses: Math.round(totalIntereses),
      totalPagado: Math.round(totalPagado),
      detalle: `Sistema francés: ${plazo} cuotas fijas de $${Math.round(cuota).toLocaleString('es-AR')}. Total intereses: $${Math.round(totalIntereses).toLocaleString('es-AR')} (${((totalIntereses / monto) * 100).toFixed(1)}% del capital).`,
    };
  }

  // Sistema alemán
  const amortCapital = monto / plazo;
  let saldo = monto;
  let totalIntereses = 0;
  const primerInteres = saldo * i;
  const cuotaInicial = amortCapital + primerInteres;

  for (let m = 0; m < plazo; m++) {
    const interesMes = saldo * i;
    totalIntereses += interesMes;
    saldo -= amortCapital;
  }

  const totalPagado = monto + totalIntereses;
  const ultimaCuota = amortCapital + (amortCapital + amortCapital * 0) * i; // última cuota aprox

  return {
    cuotaInicial: Math.round(cuotaInicial),
    totalIntereses: Math.round(totalIntereses),
    totalPagado: Math.round(totalPagado),
    detalle: `Sistema alemán: primera cuota $${Math.round(cuotaInicial).toLocaleString('es-AR')}, cuotas decrecientes. Amortización mensual fija de $${Math.round(amortCapital).toLocaleString('es-AR')}. Total intereses: $${Math.round(totalIntereses).toLocaleString('es-AR')} (${((totalIntereses / monto) * 100).toFixed(1)}% del capital).`,
  };
}
