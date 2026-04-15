/**
 * Calculadora de Costo Financiero Total (CFT)
 * Calcula el CFT como TIR del flujo de fondos real del préstamo
 */

export interface CostoFinancieroTotalCftInputs {
  monto: number;
  tna: number;
  plazoMeses: number;
  seguroMensual?: number;
  gastoOtorgamiento?: number;
  ivaIntereses?: number;
}

export interface CostoFinancieroTotalCftOutputs {
  cftAnual: string;
  cuotaTotalMensual: number;
  totalPagado: number;
  costoTotal: number;
  detalle: string;
}

export function costoFinancieroTotalCft(
  inputs: CostoFinancieroTotalCftInputs
): CostoFinancieroTotalCftOutputs {
  const monto = Number(inputs.monto);
  const tna = Number(inputs.tna);
  const plazo = Math.round(Number(inputs.plazoMeses));
  const seguro = Number(inputs.seguroMensual) || 0;
  const gastoOtorg = Number(inputs.gastoOtorgamiento) || 0;
  const ivaPct = Number(inputs.ivaIntereses) || 0;

  if (!monto || monto <= 0) throw new Error('Ingresá el monto del préstamo');
  if (!tna || tna <= 0) throw new Error('Ingresá la TNA del préstamo');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo en meses');

  const i = tna / 100 / 12;
  const ivaFactor = 1 + ivaPct / 100;

  // Cuota pura sistema francés
  const factor = Math.pow(1 + i, plazo);
  const cuotaPura = monto * (i * factor) / (factor - 1);

  // Desglose por mes para calcular interés e IVA
  let saldo = monto;
  let totalPagado = gastoOtorg;
  const flujos: number[] = [];
  // Flujo inicial: lo que recibís = monto - gasto de otorgamiento
  const montoNeto = monto - gastoOtorg;

  let cuotaTotalPrimera = 0;
  for (let m = 1; m <= plazo; m++) {
    const interesMes = saldo * i;
    const capitalMes = cuotaPura - interesMes;
    const ivaInteres = interesMes * (ivaPct / 100);
    const cuotaTotal = cuotaPura + ivaInteres + seguro;

    if (m === 1) cuotaTotalPrimera = cuotaTotal;
    flujos.push(cuotaTotal);
    totalPagado += cuotaTotal;
    saldo -= capitalMes;
  }

  // Calcular TIR mensual por método de Newton-Raphson
  let tirMensual = i; // arrancar desde la tasa nominal
  for (let iter = 0; iter < 200; iter++) {
    let vpn = -montoNeto;
    let dvpn = 0;
    for (let m = 0; m < flujos.length; m++) {
      const desc = Math.pow(1 + tirMensual, m + 1);
      vpn += flujos[m] / desc;
      dvpn -= (m + 1) * flujos[m] / Math.pow(1 + tirMensual, m + 2);
    }
    if (Math.abs(dvpn) < 1e-15) break;
    const delta = vpn / dvpn;
    tirMensual -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }

  const cftAnual = (Math.pow(1 + tirMensual, 12) - 1) * 100;
  const teaNominal = (Math.pow(1 + i, 12) - 1) * 100;
  const costoTotal = totalPagado - monto;

  return {
    cftAnual: `${cftAnual.toFixed(1)}% TEA`,
    cuotaTotalMensual: Math.round(cuotaTotalPrimera),
    totalPagado: Math.round(totalPagado),
    costoTotal: Math.round(costoTotal),
    detalle: `El CFT real es ${cftAnual.toFixed(1)}% vs la TEA nominal de ${teaNominal.toFixed(1)}% (diferencia de ${(cftAnual - teaNominal).toFixed(1)} puntos). Cuota total mensual: $${Math.round(cuotaTotalPrimera).toLocaleString('es-AR')} (cuota pura $${Math.round(cuotaPura).toLocaleString('es-AR')} + IVA + seguro). Costo total del crédito: $${Math.round(costoTotal).toLocaleString('es-AR')}.`,
  };
}
