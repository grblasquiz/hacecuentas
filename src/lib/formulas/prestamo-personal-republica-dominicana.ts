/**
 * Calculadora de préstamo personal — República Dominicana 2026.
 * Sistema de amortización francés (cuota fija). La tasa la ingresa el usuario
 * (tasa anual %); las tasas de referencia 14,5%–18,95% son orientativas
 * (placeholder de mercado, no fijadas por ley). Moneda: peso dominicano (RD$).
 *
 *   i = (tasa anual / 100) / 12                       (tasa mensual)
 *   cuota = i == 0 ? monto / plazo
 *                  : monto · i / (1 − (1 + i)^(−plazo))   (francés)
 *   cuotaTotal = cuota + seguro                        (cuota con seguro mensual)
 *   totalPagar = cuotaTotal · plazo
 *   totalIntereses = cuota · plazo − monto
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  monto: number;
  tasa: number;   // tasa anual nominal en %
  plazo: number;  // plazo en meses
  seguro?: number; // seguro/cargo mensual fijo (RD$), default 0
}

export interface Outputs {
  cuota: number | string;
  totalPagar: number;
  totalIntereses: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

export function prestamoPersonalRepublicaDominicana(inp: Inputs): Outputs {
  const monto = Number(inp.monto);
  const tasa = Number(inp.tasa);
  const plazo = Math.max(1, Math.floor(Number(inp.plazo) || 0));
  const seguro = Math.max(0, Number(inp.seguro) || 0);

  if (!monto || monto <= 0) throw new Error('Ingresá el monto del préstamo en RD$');
  if (!(tasa >= 0)) throw new Error('Ingresá la tasa anual (%)');

  const i = (tasa / 100) / 12; // tasa mensual
  const cuotaCapitalInteres =
    i === 0 ? monto / plazo : (monto * i) / (1 - Math.pow(1 + i, -plazo));
  const cuotaTotal = cuotaCapitalInteres + seguro;
  const totalPagar = cuotaTotal * plazo;
  const totalIntereses = cuotaCapitalInteres * plazo - monto;

  // Tabla de amortización (capital, interés y saldo por cuota).
  const filas: string[][] = [];
  let saldo = monto;
  const maxFilas = Math.min(plazo, 360);
  for (let n = 1; n <= maxFilas; n++) {
    const interesMes = saldo * i;
    const capitalMes = cuotaCapitalInteres - interesMes;
    saldo = Math.max(0, saldo - capitalMes);
    // Mostrar primeras 12 + última fila para no inflar la tabla en plazos largos.
    if (plazo <= 18 || n <= 12 || n === plazo) {
      filas.push([
        String(n),
        fmtDOP(cuotaTotal),
        fmtDOP(capitalMes),
        fmtDOP(interesMes),
        fmtDOP(saldo),
      ]);
    } else if (n === 13) {
      filas.push(['…', '…', '…', '…', '…']);
    }
  }

  const formula =
    `i = (${tasa}% ÷ 12) = ${(i * 100).toFixed(4)}% mensual · ` +
    `cuota = ${fmtDOP(monto)} × i ÷ (1 − (1+i)^−${plazo}) = ${fmtDOP(cuotaCapitalInteres)}` +
    (seguro > 0 ? ` + seguro ${fmtDOP(seguro)} = ${fmtDOP(cuotaTotal)}` : '');

  const explicacion =
    `Con un préstamo de ${fmtDOP(monto)} a ${tasa}% anual en ${plazo} meses (sistema francés), ` +
    `la cuota mensual es ${fmtDOP(cuotaTotal)}. ` +
    `A lo largo del préstamo pagás ${fmtDOP(totalPagar)} en total, de los cuales ${fmtDOP(totalIntereses)} son intereses.` +
    (seguro > 0 ? ` Incluye un seguro/cargo mensual de ${fmtDOP(seguro)}.` : '');

  const _insight = {
    title: `Tu cuota mensual sería ${fmtDOP(cuotaTotal)}`,
    text:
      `Por ${fmtDOP(monto)} a **${tasa}% anual** en **${plazo} meses**, pagás **${fmtDOP(cuotaTotal)}** por mes. ` +
      `En total devolvés **${fmtDOP(totalPagar)}**, o sea **${fmtDOP(totalIntereses)}** de intereses sobre el capital prestado.`,
    tone: 'neutral' as const,
    icon: '🇩🇴',
  };

  const _table = {
    title: 'Tabla de amortización (sistema francés)',
    headers: ['Cuota', 'Pago mensual', 'Capital', 'Interés', 'Saldo'],
    align: ['left', 'right', 'right', 'right', 'right'],
    rows: filas,
    note: 'Sistema francés: la cuota es fija; al principio pagás más interés y menos capital, y se invierte con el tiempo. La tasa es la que ingresás; verificá la tasa real con tu banco.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital', value: Math.round(monto) },
      { label: 'Intereses', value: Math.round(totalIntereses) },
      ...(seguro > 0 ? [{ label: 'Seguro', value: Math.round(seguro * plazo) }] : []),
    ],
    prefix: 'RD$',
    centerValue: fmtDOP(totalPagar),
    centerLabel: 'Total a pagar',
    ariaLabel: 'Composición del total a pagar del préstamo: capital, intereses y seguro',
  };

  return {
    cuota: fmtDOP(cuotaTotal) + ' / mes',
    totalPagar: Math.round(totalPagar),
    totalIntereses: Math.round(totalIntereses),
    formula,
    explicacion,
    _insight,
    _table,
    _chart,
  };
}
