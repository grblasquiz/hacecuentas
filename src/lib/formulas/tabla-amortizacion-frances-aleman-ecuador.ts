/**
 * Tabla de amortización de préstamo — Ecuador (sistemas francés y alemán), en dólares (USD).
 *
 * Motor genérico de crédito para el mercado ecuatoriano (dolarizado). Lo usan varias calcs:
 * amortización francés/alemán, simulador de crédito Banco Pichincha y crédito Cooperativa JEP.
 * El usuario ingresa la TASA EFECTIVA ANUAL (TEA) que le ofrece la entidad — no se hardcodea
 * ninguna tasa. La tasa efectiva mensual se deriva de la TEA: i_mensual = (1 + TEA)^(1/12) − 1,
 * la misma convención que la calculadora de crédito vehicular Ecuador ya publicada.
 *
 * Francés: cuota fija. cuota = M × i / (1 − (1+i)^−n).
 * Alemán:  amortización de capital fija (M/n); la cuota arranca más alta y decrece.
 */

function fmtUSD(n: number): string {
  return '$' + new Intl.NumberFormat('es-EC', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

export interface Inputs {
  monto: number;        // monto del préstamo (USD)
  tasaAnual: number;    // tasa efectiva anual (TEA) pactada (% anual)
  plazoMeses: number;   // plazo en meses
  sistema?: string;     // 'frances' | 'aleman' (default: 'frances')
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; _table?: any; }

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  if (monto <= 0) throw new Error('Ingresá el monto del préstamo (USD).');

  const plazo = Math.round(Number(i.plazoMeses) || 0);
  if (plazo <= 0) throw new Error('Ingresá el plazo en meses (por ejemplo 36).');
  if (plazo > 360) throw new Error('El plazo parece demasiado largo: ingresá los meses (máx. 360).');

  const tasa = Number(i.tasaAnual) || 0;
  if (tasa <= 0) throw new Error('Ingresá la tasa efectiva anual (por ejemplo 16.5).');
  if (tasa > 100) throw new Error('La tasa parece demasiado alta: ingresá el porcentaje anual (ej. 16.5, no 0.165).');

  const sistema = (i.sistema || 'frances').toLowerCase() === 'aleman' ? 'aleman' : 'frances';

  // Tasa efectiva mensual derivada de la TEA (capitalización mensual).
  const iMensual = Math.pow(1 + tasa / 100, 1 / 12) - 1;

  // Cronograma cuota a cuota.
  const amortCapital = monto / plazo;
  const factor = Math.pow(1 + iMensual, -plazo);
  const cuotaFrances = iMensual > 0 ? (monto * iMensual) / (1 - factor) : monto / plazo;

  let saldo = monto;
  let totalIntereses = 0;
  const rows: Array<Array<string | number>> = [];
  let cuotaInicial = 0;

  for (let m = 1; m <= plazo; m++) {
    const interesMes = saldo * iMensual;
    let capitalMes: number;
    let cuotaMes: number;
    if (sistema === 'frances') {
      cuotaMes = cuotaFrances;
      capitalMes = cuotaMes - interesMes;
    } else {
      capitalMes = amortCapital;
      cuotaMes = amortCapital + interesMes;
    }
    if (m === plazo) capitalMes = saldo;           // cierre exacto por redondeos
    if (m === 1) cuotaInicial = cuotaMes;
    totalIntereses += interesMes;
    saldo = Math.max(0, saldo - capitalMes);
    // Mostramos las primeras 12 cuotas + la última (para no inflar la tabla).
    if (m <= 12 || m === plazo) {
      rows.push([m, fmtUSD(cuotaMes), fmtUSD(interesMes), fmtUSD(capitalMes), fmtUSD(saldo)]);
    }
  }

  const totalPagado = monto + totalIntereses;
  const sobreprecioPct = (totalIntereses / monto) * 100;
  const nombreSistema = sistema === 'frances' ? 'francés' : 'alemán';

  for (const v of [cuotaInicial, totalIntereses, totalPagado]) {
    if (!Number.isFinite(v)) throw new Error('No se pudo calcular: revisá los valores ingresados.');
  }

  const _insight = {
    title: sistema === 'frances' ? 'Tu cuota fija y el costo del crédito' : 'Tu primera cuota y el costo del crédito',
    text: sistema === 'frances'
      ? `Un préstamo de **${fmtUSD(monto)}** a **${plazo} meses** con una tasa efectiva anual de **${tasa}%** tiene una cuota fija de **${fmtUSD(cuotaInicial)}** al mes (sistema francés). Vas a pagar **${fmtUSD(totalIntereses)}** de intereses en total: el crédito encarece lo que pedís un **${sobreprecioPct.toFixed(0)}%**. Terminás devolviendo **${fmtUSD(totalPagado)}**.`
      : `Un préstamo de **${fmtUSD(monto)}** a **${plazo} meses** con una tasa efectiva anual de **${tasa}%** en sistema alemán arranca con una cuota de **${fmtUSD(cuotaInicial)}** que va bajando mes a mes (amortizás **${fmtUSD(amortCapital)}** de capital fijo por cuota). Pagás **${fmtUSD(totalIntereses)}** de intereses en total (**${sobreprecioPct.toFixed(0)}%** sobre el capital), menos que en el sistema francés al mismo plazo. Devolvés **${fmtUSD(totalPagado)}**.`,
    tone: sobreprecioPct > 35 ? 'warn' : 'neutral',
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(totalIntereses) },
    ].filter((s) => s.value > 0),
    prefix: '$ ',
    centerValue: fmtUSD(cuotaInicial),
    centerLabel: sistema === 'frances' ? 'Cuota mensual' : '1ª cuota',
    ariaLabel: `Cuota inicial de ${fmtUSD(cuotaInicial)}; del total, ${fmtUSD(monto)} es capital y ${fmtUSD(totalIntereses)} son intereses.`,
  };

  const _table = {
    title: `Tabla de amortización — sistema ${nombreSistema} (primeras 12 cuotas + última)`,
    headers: ['Cuota', 'Pago', 'Interés', 'Capital', 'Saldo'],
    align: ['left', 'right', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    footer: ['Totales', fmtUSD(totalPagado), fmtUSD(totalIntereses), fmtUSD(monto), fmtUSD(0)],
    note: sistema === 'frances'
      ? 'Sistema francés: la cuota es fija; al principio pagás más interés y menos capital, y con el tiempo se invierte.'
      : 'Sistema alemán: la amortización de capital es fija; la cuota arranca más alta y decrece mes a mes.',
  };

  return {
    cuotaMensual: fmtUSD(cuotaInicial),
    totalIntereses: fmtUSD(totalIntereses),
    totalPagado: fmtUSD(totalPagado),
    tasaMensual: (iMensual * 100).toFixed(3) + '%',
    detalle: sistema === 'frances'
      ? `${plazo} cuotas fijas de ${fmtUSD(cuotaInicial)} · TEA ${tasa}% (mensual ${(iMensual * 100).toFixed(3)}%) · intereses ${fmtUSD(totalIntereses)} (${sobreprecioPct.toFixed(1)}% del capital) · total ${fmtUSD(totalPagado)}.`
      : `Sistema alemán: 1ª cuota ${fmtUSD(cuotaInicial)} (decreciente), capital fijo ${fmtUSD(amortCapital)}/mes · TEA ${tasa}% · intereses ${fmtUSD(totalIntereses)} (${sobreprecioPct.toFixed(1)}% del capital) · total ${fmtUSD(totalPagado)}.`,
    _insight,
    _chart,
    _table,
  };
}
