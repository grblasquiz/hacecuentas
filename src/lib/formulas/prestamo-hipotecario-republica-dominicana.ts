/**
 * Calculadora de préstamo hipotecario — República Dominicana 2026.
 * Sistema de amortización francés (cuota fija) sobre el monto financiado.
 * El inicial (pago inicial / down payment) se expresa como % del precio.
 * La tasa la ingresa el usuario; las tasas hipotecarias de referencia 9%–13%
 * son orientativas (placeholder de mercado, no fijadas por ley). Moneda: RD$.
 *
 *   montoFinanciado = precio · (1 − inicial/100)
 *   i = (tasa anual / 100) / 12
 *   n = plazoAnios · 12
 *   cuota = i == 0 ? montoFinanciado / n
 *                  : montoFinanciado · i / (1 − (1 + i)^(−n))
 *   totalIntereses = cuota · n − montoFinanciado
 */
import { fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  precio: number;
  inicial?: number;   // % de inicial, default 20
  tasa: number;       // tasa anual nominal en %
  plazoAnios: number; // plazo en años
}

export interface Outputs {
  cuota: number | string;
  montoFinanciado: number;
  totalIntereses: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

export function prestamoHipotecarioRepublicaDominicana(inp: Inputs): Outputs {
  const precio = Number(inp.precio);
  const inicialPct = Math.max(0, Math.min(100, inp.inicial == null ? 20 : Number(inp.inicial)));
  const tasa = Number(inp.tasa);
  const plazoAnios = Math.max(1, Math.floor(Number(inp.plazoAnios) || 0));

  if (!precio || precio <= 0) throw new Error('Ingresá el precio del inmueble en RD$');
  if (!(tasa >= 0)) throw new Error('Ingresá la tasa anual (%)');

  const inicialMonto = precio * (inicialPct / 100);
  const montoFinanciado = precio * (1 - inicialPct / 100);
  const i = (tasa / 100) / 12;
  const n = plazoAnios * 12;
  const cuota =
    i === 0 ? montoFinanciado / n : (montoFinanciado * i) / (1 - Math.pow(1 + i, -n));
  const totalIntereses = cuota * n - montoFinanciado;
  const totalPagar = cuota * n;

  // Tabla de amortización resumida por año (saldo a fin de cada año).
  const filas: string[][] = [];
  let saldo = montoFinanciado;
  for (let mes = 1; mes <= n; mes++) {
    const interesMes = saldo * i;
    const capitalMes = cuota - interesMes;
    saldo = Math.max(0, saldo - capitalMes);
    if (mes % 12 === 0 || mes === n) {
      const anio = Math.ceil(mes / 12);
      filas.push([
        `Año ${anio}`,
        fmtDOP(cuota),
        fmtDOP(saldo),
      ]);
    }
  }

  const formula =
    `montoFinanciado = ${fmtDOP(precio)} × (1 − ${inicialPct}%) = ${fmtDOP(montoFinanciado)} · ` +
    `i = ${tasa}% ÷ 12 = ${(i * 100).toFixed(4)}% · n = ${plazoAnios}×12 = ${n} · ` +
    `cuota = ${fmtDOP(cuota)}`;

  const explicacion =
    `Sobre un inmueble de ${fmtDOP(precio)} con ${inicialPct}% de inicial (${fmtDOP(inicialMonto)}), ` +
    `financiás ${fmtDOP(montoFinanciado)}. A ${tasa}% anual en ${plazoAnios} años (sistema francés), ` +
    `la cuota mensual es ${fmtDOP(cuota)}. Pagás ${fmtDOP(totalIntereses)} en intereses sobre el monto financiado.`;

  const _insight = {
    title: `Cuota hipotecaria: ${fmtDOP(cuota)} / mes`,
    text:
      `Financiando **${fmtDOP(montoFinanciado)}** (tras un inicial de ${inicialPct}%) a **${tasa}% anual** ` +
      `en **${plazoAnios} años**, la cuota es **${fmtDOP(cuota)}** mensuales. ` +
      `Los intereses suman **${fmtDOP(totalIntereses)}** a lo largo del préstamo.`,
    tone: 'neutral' as const,
    icon: '🏠',
  };

  const _table = {
    title: 'Saldo del préstamo año por año (sistema francés)',
    headers: ['Período', 'Cuota mensual', 'Saldo al cierre'],
    align: ['left', 'right', 'right'],
    rows: filas,
    note: 'Sistema francés: cuota fija. Al principio el grueso de la cuota va a intereses; el capital amortiza más rápido hacia el final. La tasa hipotecaria es la que ingresás (verificá con tu banco).',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Capital financiado', value: Math.round(montoFinanciado) },
      { label: 'Intereses', value: Math.round(totalIntereses) },
    ],
    prefix: 'RD$',
    centerValue: fmtDOP(totalPagar),
    centerLabel: 'Total a pagar',
    ariaLabel: 'Composición del total a pagar del crédito hipotecario: capital e intereses',
  };

  return {
    cuota: fmtDOP(cuota) + ' / mes',
    montoFinanciado: Math.round(montoFinanciado),
    totalIntereses: Math.round(totalIntereses),
    formula,
    explicacion,
    _insight,
    _table,
    _chart,
  };
}
