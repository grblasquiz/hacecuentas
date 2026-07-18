/**
 * Préstamo de vehículo (auto) — República Dominicana. Amortización francesa
 * (cuota fija). Financiás el precio del vehículo menos el inicial/pronto:
 *   montoFinanciado = precio − inicial
 *   i = (tasa anual / 100) / 12
 *   cuota = i == 0 ? monto/plazo : monto·i/(1 − (1+i)^−plazo)
 *   totalPagar = cuota·plazo + inicial ; totalIntereses = cuota·plazo − monto
 * La tasa la ingresa el usuario (los préstamos vehiculares en RD suelen ir de
 * ~12% a ~18% anual, orientativo, no fijado por ley). Moneda: peso dominicano.
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  precio: number;    // precio del vehículo (RD$)
  inicial?: number;  // pronto / pago inicial (RD$), opcional
  tasa: number;      // tasa anual nominal (%)
  plazo: number;     // plazo en meses
  seguro?: number;   // seguro/cargo mensual fijo (RD$), opcional
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _table?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const precio = num(i.precio, 0);
  const inicial = Math.max(0, num(i.inicial, 0));
  const tasa = num(i.tasa, 0);
  const plazo = Math.max(1, Math.floor(num(i.plazo, 0)));
  const seguro = Math.max(0, num(i.seguro, 0));

  if (!(precio > 0)) throw new Error('Ingresá el precio del vehículo en RD$');
  if (!(tasa >= 0)) throw new Error('Ingresá la tasa anual (%)');
  const monto = Math.max(0, precio - inicial);
  if (!(monto > 0)) throw new Error('El inicial no puede ser mayor o igual al precio');

  const tm = (tasa / 100) / 12;
  const cuotaCap = tm === 0 ? monto / plazo : (monto * tm) / (1 - Math.pow(1 + tm, -plazo));
  const cuotaTotal = cuotaCap + seguro;
  const totalCuotas = cuotaTotal * plazo;
  const totalIntereses = cuotaCap * plazo - monto;
  const totalPagar = totalCuotas + inicial;

  const filas: string[][] = [];
  let saldo = monto;
  const maxFilas = Math.min(plazo, 360);
  for (let n = 1; n <= maxFilas; n++) {
    const interesMes = saldo * tm;
    const capitalMes = cuotaCap - interesMes;
    saldo = Math.max(0, saldo - capitalMes);
    if (plazo <= 18 || n <= 12 || n === plazo) {
      filas.push([String(n), fmtDOP(cuotaTotal), fmtDOP(capitalMes), fmtDOP(interesMes), fmtDOP(saldo)]);
    } else if (n === 13) {
      filas.push(['…', '…', '…', '…', '…']);
    }
  }

  const detalle =
    `Precio ${fmtDOP(precio)} − inicial ${fmtDOP(inicial)} = ${fmtDOP(monto)} financiado a ${tasa}% anual en ${plazo} meses. ` +
    `Cuota ${fmtDOP(cuotaTotal)}/mes; total a pagar ${fmtDOP(totalPagar)} (${fmtDOP(totalIntereses)} de intereses).`;

  const _insight = {
    title: `Tu cuota sería ${fmtDOP(cuotaTotal)}/mes`,
    text:
      `Financiando **${fmtDOP(monto)}** (precio ${fmtDOP(precio)} menos inicial ${fmtDOP(inicial)}) a **${tasa}% anual** en **${plazo} meses**, ` +
      `pagás **${fmtDOP(cuotaTotal)}** por mes. Contando el inicial, el vehículo te cuesta **${fmtDOP(totalPagar)}** en total, ` +
      `de los cuales **${fmtDOP(totalIntereses)}** son intereses.`,
    tone: 'neutral' as const,
    icon: '🚗',
  };

  const _table = {
    title: 'Tabla de amortización (sistema francés)',
    headers: ['Cuota', 'Pago mensual', 'Capital', 'Interés', 'Saldo'],
    align: ['left', 'right', 'right', 'right', 'right'],
    rows: filas,
    note: 'La cuota es fija; al principio pagás más interés y menos capital. La tasa es la que ingresás: verificá la tasa real y el seguro del vehículo con tu banco.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Inicial', value: Math.round(inicial) },
      { label: 'Capital financiado', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(totalIntereses) },
      ...(seguro > 0 ? [{ label: 'Seguro', value: Math.round(seguro * plazo) }] : []),
    ].filter((s) => s.value > 0),
    prefix: 'RD$',
    centerValue: fmtDOP(totalPagar),
    centerLabel: 'Costo total',
    ariaLabel: 'Composición del costo total del vehículo: inicial, capital, intereses y seguro',
  };

  return {
    cuota: fmtDOP(cuotaTotal) + ' / mes',
    montoFinanciado: fmtDOP(monto),
    totalPagar: fmtDOP(totalPagar),
    totalIntereses: fmtDOP(totalIntereses),
    detalle,
    _insight,
    _table,
    _chart,
  };
}
