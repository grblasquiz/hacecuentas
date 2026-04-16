/** Ahorro por refinanciación de préstamo */

export interface Inputs {
  saldoPendiente: number;
  tasaActual: number;
  cuotasRestantes: number;
  tasaNueva: number;
  plazoNuevo: number;
  costoRefinanciacion: number;
}

export interface Outputs {
  cuotaActual: number;
  cuotaNueva: number;
  ahorroCuota: number;
  interesTotalActual: number;
  interesTotalNuevo: number;
  ahorroTotal: number;
  mesesRecuperacion: number;
  conviene: string;
  formula: string;
  explicacion: string;
}

export function refinanciarPrestamoAhorro(i: Inputs): Outputs {
  const saldo = Number(i.saldoPendiente);
  const tasaA = Number(i.tasaActual) / 100 / 12;
  const cuotasRest = Number(i.cuotasRestantes);
  const tasaN = Number(i.tasaNueva) / 100 / 12;
  const plazoN = Number(i.plazoNuevo);
  const costo = Number(i.costoRefinanciacion) || 0;

  if (!saldo || saldo <= 0) throw new Error('Ingresá el saldo pendiente');
  if (!tasaA) throw new Error('Ingresá la tasa actual');
  if (!cuotasRest || cuotasRest <= 0) throw new Error('Ingresá las cuotas restantes');
  if (!tasaN && tasaN !== 0) throw new Error('Ingresá la tasa nueva');
  if (!plazoN || plazoN <= 0) throw new Error('Ingresá el plazo nuevo');

  // Cuota actual (sistema francés)
  const cuotaActual = tasaA > 0
    ? saldo * (tasaA * Math.pow(1 + tasaA, cuotasRest)) / (Math.pow(1 + tasaA, cuotasRest) - 1)
    : saldo / cuotasRest;

  // Cuota nueva
  const cuotaNueva = tasaN > 0
    ? saldo * (tasaN * Math.pow(1 + tasaN, plazoN)) / (Math.pow(1 + tasaN, plazoN) - 1)
    : saldo / plazoN;

  const ahorroCuota = cuotaActual - cuotaNueva;

  const interesTotalActual = cuotaActual * cuotasRest - saldo;
  const interesTotalNuevo = cuotaNueva * plazoN - saldo;
  const ahorroTotal = interesTotalActual - interesTotalNuevo - costo;

  // Meses para recuperar el costo de refinanciación
  const mesesRecuperacion = ahorroCuota > 0 && costo > 0 ? Math.ceil(costo / ahorroCuota) : 0;

  const conviene = ahorroTotal > 0
    ? `Sí, ahorrás $${Math.round(ahorroTotal).toLocaleString()} en total`
    : `No, pagás $${Math.round(Math.abs(ahorroTotal)).toLocaleString()} más`;

  const formula = `Ahorro = ($${Math.round(cuotaActual)} × ${cuotasRest}) - ($${Math.round(cuotaNueva)} × ${plazoN}) - $${costo.toLocaleString()} = $${Math.round(ahorroTotal).toLocaleString()}`;
  const explicacion = `Préstamo actual: cuota $${Math.round(cuotaActual).toLocaleString()} × ${cuotasRest} cuotas = $${Math.round(interesTotalActual).toLocaleString()} en intereses. Refinanciado: cuota $${Math.round(cuotaNueva).toLocaleString()} × ${plazoN} cuotas = $${Math.round(interesTotalNuevo).toLocaleString()} en intereses. Ahorro en cuota: $${Math.round(ahorroCuota).toLocaleString()}/mes.${costo > 0 ? ` Costo refinanciación: $${costo.toLocaleString()} (se recupera en ${mesesRecuperacion} meses).` : ''} Ahorro neto total: $${Math.round(ahorroTotal).toLocaleString()}. ${conviene}.`;

  return {
    cuotaActual: Math.round(cuotaActual),
    cuotaNueva: Math.round(cuotaNueva),
    ahorroCuota: Math.round(ahorroCuota),
    interesTotalActual: Math.round(interesTotalActual),
    interesTotalNuevo: Math.round(interesTotalNuevo),
    ahorroTotal: Math.round(ahorroTotal),
    mesesRecuperacion,
    conviene,
    formula,
    explicacion,
  };
}
