/**
 * Calculadora de hipoteca Infonavit (MX) — sistema francés
 * Incluye gastos administrativos anuales que se suman a la mensualidad.
 */

export interface Inputs {
  montoCredito: number;
  tasaAnual: number;
  plazoAnios: number;
  gastoAdmin?: number; // % anual
}

export interface Outputs {
  mensualidad: number;
  totalPagado: number;
  totalIntereses: number;
  cuotasTotales: number;
  cat: string;
  explicacion: string;
}

export function hipotecaInfonavitMx(inputs: Inputs): Outputs {
  const monto = Number(inputs.montoCredito);
  const tasaAnual = Number(inputs.tasaAnual);
  const anios = Number(inputs.plazoAnios);
  const gastoAdmin = Number(inputs.gastoAdmin ?? 0);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto del crédito');
  if (!tasaAnual || tasaAnual <= 0) throw new Error('Ingresá la tasa anual');
  if (!anios || anios <= 0) throw new Error('Ingresá el plazo en años');

  const plazoMeses = anios * 12;
  const i = tasaAnual / 100 / 12;

  let cuotaBase: number;
  if (i === 0) {
    cuotaBase = monto / plazoMeses;
  } else {
    const factor = Math.pow(1 + i, plazoMeses);
    cuotaBase = (monto * (i * factor)) / (factor - 1);
  }

  // Gastos admin: % anual sobre saldo — aproximamos como % del crédito / 12 sumado a la cuota
  const gastoAdminMensual = (monto * (gastoAdmin / 100)) / 12;
  const mensualidad = cuotaBase + gastoAdminMensual;

  const totalPagado = mensualidad * plazoMeses;
  const totalIntereses = totalPagado - monto;
  const catAprox = (Math.pow(1 + i, 12) - 1) * 100 + gastoAdmin;

  return {
    mensualidad: Math.round(mensualidad),
    totalPagado: Math.round(totalPagado),
    totalIntereses: Math.round(totalIntereses),
    cuotasTotales: plazoMeses,
    cat: `${catAprox.toFixed(2)}% (aprox con gastos admin)`,
    explicacion: `Crédito Infonavit $${monto.toLocaleString('es-MX')} a ${tasaAnual}% en ${anios} años. Mensualidad estimada $${Math.round(mensualidad).toLocaleString('es-MX')} (cuota base $${Math.round(cuotaBase).toLocaleString('es-MX')} + admin $${Math.round(gastoAdminMensual).toLocaleString('es-MX')}). Intereses totales $${Math.round(totalIntereses).toLocaleString('es-MX')}.`,
  };
}
