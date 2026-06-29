/**
 * Préstamo personal en México 2026: mensualidad (sistema francés), interés total,
 * CAT aproximado y tabla de amortización cuota a cuota.
 *
 * Mensualidad = M × i / (1 − (1+i)^−n), con i = (tasaAnual/100)/12 (anualidad francesa).
 * CAT aproximado ≈ ((1+i)^12 − 1) × 100 + comisión de apertura (en % del monto).
 * El CAT es una estimación: el CAT oficial (Banxico/CONDUSEC) incluye además seguros,
 * comisiones por disposición y la periodicidad exacta de los pagos.
 *
 * Matemática pura, sin datos fiscales. Moneda MXN.
 */

export interface Inputs {
  monto: number;
  tasaAnual: number;
  plazoMeses: number;
  comisionApertura: number;
}

export interface Outputs {
  mensualidad: number;
  interesTotal: number;
  totalPagar: number;
  catAprox: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
  _table?: any;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');

export function prestamoPersonalMensualidadCatMexico(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const tasaAnual = Number(i.tasaAnual);
  const plazo = Math.round(Number(i.plazoMeses));
  const comisionApertura = Math.max(0, Number(i.comisionApertura) || 0);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto del préstamo');
  if (tasaAnual < 0) throw new Error('La tasa anual no puede ser negativa');
  if (!plazo || plazo <= 0) throw new Error('Ingresá el plazo en meses');

  const tasaMensual = (tasaAnual / 100) / 12;

  const mensualidad =
    tasaMensual === 0
      ? monto / plazo
      : monto * tasaMensual / (1 - Math.pow(1 + tasaMensual, -plazo));

  const totalPagar = mensualidad * plazo;
  const interesTotal = totalPagar - monto;

  // CAT aproximado: tasa efectiva anual del interés + efecto de la comisión de apertura.
  const catAprox = (Math.pow(1 + tasaMensual, 12) - 1) * 100 + comisionApertura;

  // ── Tabla de amortización (sistema francés) ──
  const rows: Array<Array<string | number>> = [];
  let saldo = monto;
  let totalInteresAcum = 0;
  for (let m = 1; m <= plazo; m++) {
    const interesMes = saldo * tasaMensual;
    let capitalMes = mensualidad - interesMes;
    totalInteresAcum += interesMes;
    saldo -= capitalMes;
    if (saldo < 0.005) saldo = 0;
    rows.push([m, fmt(mensualidad), fmt(interesMes), fmt(capitalMes), fmt(saldo)]);
  }

  const detalle =
    `Préstamo de ${fmt(monto)} a ${tasaAnual}% anual en ${plazo} meses: ` +
    `${plazo} mensualidades fijas de ${fmt(mensualidad)}. ` +
    `Pagás ${fmt(interesTotal)} de intereses (CAT aprox. ${catAprox.toFixed(1)}%).`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(interesTotal) },
    ],
    prefix: '$',
    centerValue: fmt(totalPagar),
    centerLabel: 'Total a pagar',
    ariaLabel: `Composición del préstamo: capital ${Math.round(monto)}, intereses ${Math.round(interesTotal)}.`,
  };

  const pctInteres = monto > 0 ? (interesTotal / monto) * 100 : 0;
  const insight = {
    title: 'Cuánto te cuesta el préstamo',
    text:
      `Pedís **${fmt(monto)}** y terminás pagando **${fmt(totalPagar)}**: ` +
      `**${fmt(interesTotal)}** son intereses (**${pctInteres.toFixed(0)}% del monto**). ` +
      `El **CAT aproximado es ${catAprox.toFixed(1)}%** — pedí siempre el CAT oficial por escrito antes de firmar, ` +
      `porque incluye seguros y comisiones que acá no se ven.`,
    tone: pctInteres >= 50 ? ('warn' as const) : ('neutral' as const),
    icon: '🏦',
  };

  const table = {
    title: `Tabla de amortización (${plazo} meses)`,
    headers: ['Mes', 'Mensualidad', 'Interés', 'Capital', 'Saldo'],
    align: ['left', 'right', 'right', 'right', 'right'],
    rows,
    collapseAfter: 12,
    emphasisEvery: 12,
    footer: ['Totales', fmt(totalPagar), fmt(totalInteresAcum), fmt(monto), '$0'],
    note: 'Sistema francés: la mensualidad es fija; al principio pagás más interés y menos capital, y se invierte con el tiempo. El CAT mostrado es aproximado.',
  };

  return {
    mensualidad: Math.round(mensualidad * 100) / 100,
    interesTotal: Math.round(interesTotal * 100) / 100,
    totalPagar: Math.round(totalPagar * 100) / 100,
    catAprox: Math.round(catAprox * 100) / 100,
    detalle,
    _chart: chart,
    _insight: insight,
    _table: table,
  };
}
