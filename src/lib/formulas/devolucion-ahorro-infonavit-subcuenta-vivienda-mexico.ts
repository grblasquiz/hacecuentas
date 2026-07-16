/**
 * Devolución del ahorro INFONAVIT — estima el saldo recuperable de la Subcuenta de
 * Vivienda (aportaciones patronales del 5% del SBC, post-1997) más el Fondo de Ahorro
 * 1972-1992. Usa la aportación patronal (5%), el tope de SBC (25 UMA) y la UMA diaria
 * desde la fuente única src/lib/data/mexico-2026.ts. Estimación orientativa.
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  salarioDiarioIntegrado: number;   // SBC diario ($)
  aniosCotizados: number;           // años cotizados post-1997 sin usar crédito
  usoCredito: 'no' | 'si';          // si ya usaste un crédito INFONAVIT, la subcuenta se aplicó
  saldoFondo7292: number;           // saldo del Fondo de Ahorro 1972-1992, si aplica ($)
  rendimientoAnual: number;         // rendimiento estimado de la subcuenta (%)
}

export interface Outputs {
  aportacionMensual: number;
  aportacionAnual: number;
  saldoEstimadoSubcuenta: number;
  saldoFondo7292: number;
  totalRecuperable: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const { imss, uma, salarioMinimo } = MEXICO_2026;

  const sbcDiario = Math.max(0, Number(i.salarioDiarioIntegrado) || 0);
  const anios = Math.max(0, Number(i.aniosCotizados) || 0);
  const usoCredito = i.usoCredito === 'si';
  const saldo7292 = Math.max(0, Number(i.saldoFondo7292) || 0);
  const rend = Math.max(0, Number(i.rendimientoAnual) || 0);

  // El SBC se topa en 25 UMA diarias (LSS Art. 28).
  const topeDiario = uma.diaria * imss.topeSbcUmas;
  const sbcAplicable = Math.min(sbcDiario, topeDiario);
  const sbcMensual = sbcAplicable * salarioMinimo.factorMensual; // ×30.4
  const aportacionMensual = sbcMensual * imss.infonavitPatron;   // 5% patronal
  const aportacionAnual = aportacionMensual * 12;

  const meses = Math.round(anios * 12);
  const r = rend / 100 / 12;

  // Valor futuro de una anualidad mensual (aportación constante + rendimiento).
  let saldoSubcuenta: number;
  if (usoCredito) {
    saldoSubcuenta = 0; // si usaste crédito, la subcuenta se aplicó al mismo
  } else if (r > 0) {
    saldoSubcuenta = aportacionMensual * ((Math.pow(1 + r, meses) - 1) / r);
  } else {
    saldoSubcuenta = aportacionMensual * meses;
  }

  const totalRecuperable = saldoSubcuenta + saldo7292;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const detalle = usoCredito
    ? `Como usaste un crédito INFONAVIT, tu Subcuenta de Vivienda 97 se aplicó a ese crédito. Solo el Fondo de Ahorro 1972-1992 (${fmtMXN(saldo7292)}) sería recuperable por separado.`
    : `Con un SBC de ${fmtMXN(sbcDiario)} diarios, el patrón aportó ${fmtMXN(aportacionMensual)} al mes durante ${anios} años. Estimado de la Subcuenta de Vivienda: ${fmtMXN(saldoSubcuenta)}, más ${fmtMXN(saldo7292)} del Fondo 72-92.`;

  const _insight = {
    title: 'Tu ahorro INFONAVIT recuperable',
    text: usoCredito
      ? `Usaste un crédito, así que tu Subcuenta 97 ya se aplicó. Lo que podés reclamar aparte es el **Fondo de Ahorro 1972-1992**: **${fmtMXN(saldo7292)}**. Verificá tu saldo real en Mi Cuenta Infonavit.`
      : `Se estima **${fmtMXN(totalRecuperable)}** recuperables entre tu **Subcuenta de Vivienda 97** (${fmtMXN(saldoSubcuenta)}) y el **Fondo 72-92** (${fmtMXN(saldo7292)}). La subcuenta 97 se devuelve vía tu Afore al pensionarte; el Fondo 72-92 se solicita directo en INFONAVIT.`,
    tone: 'good',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Subcuenta de Vivienda 97', value: Math.round(saldoSubcuenta) },
      { label: 'Fondo de Ahorro 72-92', value: Math.round(saldo7292) },
    ],
    prefix: '$',
    centerValue: fmtMXN(totalRecuperable),
    centerLabel: 'Total recuperable',
    ariaLabel: `Total recuperable estimado ${fmtMXN(totalRecuperable)}: subcuenta 97 más fondo 72-92.`,
  };

  return {
    aportacionMensual: round2(aportacionMensual),
    aportacionAnual: round2(aportacionAnual),
    saldoEstimadoSubcuenta: round2(saldoSubcuenta),
    saldoFondo7292: round2(saldo7292),
    totalRecuperable: round2(totalRecuperable),
    detalle,
    _insight,
    _chart,
  };
}
