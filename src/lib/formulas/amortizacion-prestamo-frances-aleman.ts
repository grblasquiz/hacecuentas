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
  _chart?: any;
  _table?: any;
}

function fmtMoney(x: number): string {
  return Math.round(x).toLocaleString('es-AR');
}

// Donut capital vs intereses — desglose del costo del préstamo.
function buildDonut(capital: number, intereses: number, totalPagado: number) {
  return {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(capital) },
      { label: 'Intereses', value: Math.round(intereses) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalPagado).toLocaleString('es-AR'),
    centerLabel: 'Total a pagar',
    ariaLabel: `Composición del préstamo: capital ${Math.round(capital)}, intereses ${Math.round(intereses)}.`,
  };
}

// Cronograma cuota a cuota para el sistema elegido.
function buildSchedule(
  sistema: 'frances' | 'aleman',
  monto: number,
  i: number,
  plazo: number,
  cuotaFrances: number,
): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [];
  let saldo = monto;
  const amortCapital = monto / plazo;
  for (let m = 1; m <= plazo; m++) {
    const interesMes = saldo * i;
    let capitalMes: number;
    let cuotaMes: number;
    if (sistema === 'frances') {
      cuotaMes = cuotaFrances;
      capitalMes = cuotaMes - interesMes;
    } else {
      capitalMes = amortCapital;
      cuotaMes = amortCapital + interesMes;
    }
    saldo -= capitalMes;
    if (saldo < 0.005) saldo = 0;
    rows.push([m, fmtMoney(cuotaMes), fmtMoney(interesMes), fmtMoney(capitalMes), fmtMoney(saldo)]);
  }
  return rows;
}

function buildTable(
  sistema: 'frances' | 'aleman',
  rows: Array<Array<string | number>>,
  totalPagado: number,
  totalIntereses: number,
  monto: number,
) {
  return {
    title: `Cuota a cuota (sistema ${sistema === 'frances' ? 'francés' : 'alemán'})`,
    headers: ['Cuota', 'Pago', 'Interés', 'Capital', 'Saldo'],
    align: ['left', 'right', 'right', 'right', 'right'],
    rows,
    collapseAfter: 12,
    emphasisEvery: 12,
    footer: ['Totales', fmtMoney(totalPagado), fmtMoney(totalIntereses), fmtMoney(monto), '0'],
    note: sistema === 'frances'
      ? 'Sistema francés: la cuota es fija; el interés baja y el capital sube cuota a cuota.'
      : 'Sistema alemán: la amortización de capital es fija; la cuota arranca más alta y decrece.',
  };
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

    const rows = buildSchedule('frances', monto, i, plazo, cuota);
    return {
      cuotaInicial: Math.round(cuota),
      totalIntereses: Math.round(totalIntereses),
      totalPagado: Math.round(totalPagado),
      detalle: `Sistema francés: ${plazo} cuotas fijas de $${Math.round(cuota).toLocaleString('es-AR')}. Total intereses: $${Math.round(totalIntereses).toLocaleString('es-AR')} (${((totalIntereses / monto) * 100).toFixed(1)}% del capital).`,
      _chart: buildDonut(monto, totalIntereses, totalPagado),
      _table: buildTable('frances', rows, totalPagado, totalIntereses, monto),
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

  const rows = buildSchedule('aleman', monto, i, plazo, 0);
  return {
    cuotaInicial: Math.round(cuotaInicial),
    totalIntereses: Math.round(totalIntereses),
    totalPagado: Math.round(totalPagado),
    detalle: `Sistema alemán: primera cuota $${Math.round(cuotaInicial).toLocaleString('es-AR')}, cuotas decrecientes. Amortización mensual fija de $${Math.round(amortCapital).toLocaleString('es-AR')}. Total intereses: $${Math.round(totalIntereses).toLocaleString('es-AR')} (${((totalIntereses / monto) * 100).toFixed(1)}% del capital).`,
    _chart: buildDonut(monto, totalIntereses, totalPagado),
    _table: buildTable('aleman', rows, totalPagado, totalIntereses, monto),
  };
}
