/**
 * Calculadora del CAT (Costo Anual Total) en tarjeta de crédito México
 * Regulado por Banxico. Incluye intereses + comisiones + IVA sobre intereses.
 */

export interface Inputs {
  saldoTc: number;
  pagoMensual: number;
  tasaAnualInteres: number; // en %
  anualidad?: number;
  comisionesAnio?: number;
  iva?: number; // % default 16
  // retro-compat
  saldo?: number;
  pagoMinimo?: number;
  tasaAnual?: number;
  comisionAnual?: number;
}

export interface Outputs {
  cat: number;
  mesesPagoTotal: number;
  interesesPagados: number;
  totalPagado: number;
  costoTotalAnual: number;
  mensaje: string;
}

export function catTarjetaCreditoMexico(i: Inputs): Outputs {
  const saldo = Number(i.saldoTc ?? i.saldo);
  const pagoMes = Number(i.pagoMensual ?? i.pagoMinimo);
  const tasa = Number(i.tasaAnualInteres ?? i.tasaAnual);
  const anualidad = Number(i.anualidad ?? 0);
  const otrasComisiones = Number(i.comisionesAnio ?? 0);
  const comisionTotal = anualidad + otrasComisiones + (i.comisionAnual !== undefined ? Number(i.comisionAnual) : 0);
  const iva = Number(i.iva ?? 16);

  if (!saldo || saldo <= 0) throw new Error('Ingresá el saldo de la tarjeta');
  if (!pagoMes || pagoMes <= 0) throw new Error('Ingresá el pago mensual');
  if (!tasa || tasa <= 0) throw new Error('Ingresá la tasa anual (%)');

  // Amortización mes a mes
  const iMensual = (tasa / 100) / 12;
  let saldoActual = saldo;
  let meses = 0;
  let interesesPagados = 0;
  const maxMeses = 600; // 50 años de tope
  while (saldoActual > 0.01 && meses < maxMeses) {
    const interesMes = saldoActual * iMensual;
    const ivaMes = interesMes * (iva / 100);
    const pagoEfectivo = pagoMes;
    // El pago cubre primero intereses+IVA, luego capital
    const cargos = interesMes + ivaMes;
    if (pagoEfectivo <= cargos) {
      // Pago no cubre ni los intereses: deuda se vuelve infinita
      meses = maxMeses;
      interesesPagados += cargos;
      break;
    }
    const capitalPagado = pagoEfectivo - cargos;
    saldoActual -= capitalPagado;
    interesesPagados += interesMes + ivaMes;
    meses++;
  }

  const totalPagado = pagoMes * meses + comisionTotal;
  // CAT = ((totalPagado / saldo)^(12/meses)) - 1, aproximado
  const cat = meses > 0
    ? (Math.pow(totalPagado / saldo, 12 / meses) - 1) * 100
    : 0;
  const costoTotalAnual = interesesPagados + comisionTotal;

  return {
    cat: Number(cat.toFixed(2)),
    mesesPagoTotal: meses,
    interesesPagados: Number(interesesPagados.toFixed(2)),
    totalPagado: Number(totalPagado.toFixed(2)),
    costoTotalAnual: Number(costoTotalAnual.toFixed(2)),
    mensaje: `CAT aproximado: ${cat.toFixed(2)}%. Liquidás en ${meses} meses pagando $${totalPagado.toFixed(2)} ($${interesesPagados.toFixed(2)} intereses).`,
  };
}
