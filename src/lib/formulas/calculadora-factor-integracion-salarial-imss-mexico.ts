/**
 * Factor de integración salarial (IMSS) México 2026 — Ley del Seguro Social Art. 27/28
 * y Ley Federal del Trabajo Arts. 76, 80, 87.
 *
 * Factor de integración = 1 + (días de aguinaldo / 365) + (días de vacaciones × prima vacacional / 365)
 *   ≡ (365 + días de aguinaldo + días de vacaciones × prima) / 365
 *
 * El factor multiplica el salario diario para obtener el Salario Base de Cotización (SBC)
 * con el que el patrón da de alta al trabajador en el IMSS. Constantes desde mexico-2026.ts.
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  aguinaldoDias?: number;            // días de aguinaldo al año (mínimo legal 15, LFT Art. 87)
  vacacionesDias?: number;           // días de vacaciones (LFT Art. 76; 1er año = 12)
  primaVacacionalPct?: number;       // prima vacacional % (mínimo legal 25, LFT Art. 80)
  salarioDiario?: number;            // salario diario base (opcional → calcula el SBC integrado)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { lft, uma, imss } = MEXICO_2026;

  // Mínimos de ley como piso (no se puede integrar por debajo de la LFT).
  const aguinaldoDias = Math.max(lft.aguinaldoDiasMinimo, num(i.aguinaldoDias, lft.aguinaldoDiasMinimo));
  const vacacionesDias = Math.max(lft.vacacionesPorAnio[0], num(i.vacacionesDias, lft.vacacionesPorAnio[0]));
  const primaPct = Math.max(lft.primaVacacional * 100, num(i.primaVacacionalPct, lft.primaVacacional * 100));
  const prima = primaPct / 100;

  // Componentes del factor (días por peso de salario diario, anualizados ÷ 365).
  const compAguinaldo = aguinaldoDias / 365;
  const compPrimaVac = (vacacionesDias * prima) / 365;

  // Factor de integración = 1 + aguinaldo/365 + (vacaciones × prima)/365.
  const factorRaw = 1 + compAguinaldo + compPrimaVac;
  const factor = Math.round(factorRaw * 10000) / 10000;

  // SBC integrado (opcional): salario diario × factor, con tope de 25 UMA (LSS Art. 28).
  const salarioDiario = Math.max(0, num(i.salarioDiario, 0));
  const tieneSalario = salarioDiario > 0;
  const topeSbcDiario = uma.diaria * imss.topeSbcUmas; // 25 UMA = $2,932.75/día en 2026
  const sbcSinTope = salarioDiario * factor;
  const topado = tieneSalario && sbcSinTope > topeSbcDiario;
  const sbc = Math.min(sbcSinTope, topeSbcDiario);
  const sbcMensual = sbc * MEXICO_2026.salarioMinimo.factorMensual; // ÷ 30.4 (IMSS/CONASAMI)

  const esMinimoLey = aguinaldoDias === lft.aguinaldoDiasMinimo
    && vacacionesDias === lft.vacacionesPorAnio[0]
    && primaPct === lft.primaVacacional * 100;

  const pctIntegracion = ((factor - 1) * 100).toFixed(2);

  const _insight = {
    title: 'Tu factor de integración',
    text: tieneSalario
      ? (topado
          ? `Tu factor de integración es **${factor.toFixed(4)}**: tu SDI sería **${fmtMXN(sbcSinTope)}**/día, pero supera el tope legal de **25 UMA** (${fmtMXN(topeSbcDiario)}/día), así que el IMSS te registra con un SBC de **${fmtMXN(sbc)}**/día (${fmtMXN(sbcMensual)}/mes).`
          : `Con ${aguinaldoDias} días de aguinaldo, ${vacacionesDias} días de vacaciones y ${primaPct}% de prima, tu factor es **${factor.toFixed(4)}**. Tu salario diario de ${fmtMXN(salarioDiario)} integra a un **SBC de ${fmtMXN(sbc)}**/día (${fmtMXN(sbcMensual)}/mes): la base de tus cuotas IMSS, INFONAVIT e indemnizaciones.`)
      : `${esMinimoLey ? 'Con las prestaciones mínimas de ley (15 días de aguinaldo, 12 de vacaciones y 25% de prima), tu' : 'Tu'} factor de integración es **${factor.toFixed(4)}**: tu salario integrado es **${pctIntegracion}%** mayor que tu salario diario. Multiplicá tu salario diario por ${factor.toFixed(4)} para obtener tu SBC.`,
    tone: topado ? 'warn' : 'good',
    icon: '📊',
  };

  const _chart = tieneSalario
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Salario diario', value: Math.round(salarioDiario * 100) / 100 },
          { label: 'Aguinaldo (proporción diaria)', value: Math.round(salarioDiario * compAguinaldo * 100) / 100 },
          { label: 'Prima vacacional (proporción diaria)', value: Math.round(salarioDiario * compPrimaVac * 100) / 100 },
        ].filter((s) => s.value > 0),
        prefix: '$',
        centerValue: fmtMXN(sbc),
        centerLabel: 'SBC por día',
        ariaLabel: `Salario base de cotización de ${fmtMXN(sbc)} por día: ${fmtMXN(salarioDiario)} de salario más la proporción diaria de aguinaldo y prima vacacional.`,
      }
    : {
        type: 'doughnut',
        slices: [
          { label: 'Salario base (1 peso)', value: 1 },
          { label: 'Aguinaldo', value: Math.round(compAguinaldo * 10000) / 10000 },
          { label: 'Prima vacacional', value: Math.round(compPrimaVac * 10000) / 10000 },
        ].filter((s) => s.value > 0),
        centerValue: factor.toFixed(4),
        centerLabel: 'Factor',
        ariaLabel: `Factor de integración ${factor.toFixed(4)}: 1 de salario más ${compAguinaldo.toFixed(4)} de aguinaldo y ${compPrimaVac.toFixed(4)} de prima vacacional.`,
      };

  return {
    factor: factor.toFixed(4),
    integracionPct: `+${pctIntegracion}%`,
    sbc: tieneSalario ? (topado ? `${fmtMXN(sbc)} por día (topado a 25 UMA)` : `${fmtMXN(sbc)} por día`) : '—',
    sbcMensual: tieneSalario ? fmtMXN(sbcMensual) : '—',
    detalle: `Factor = 1 + ${aguinaldoDias}/365 + (${vacacionesDias} × ${primaPct}%)/365 = 1 + ${compAguinaldo.toFixed(4)} + ${compPrimaVac.toFixed(4)} = **${factor.toFixed(4)}**.${tieneSalario ? ` SBC = ${fmtMXN(salarioDiario)} × ${factor.toFixed(4)} = ${fmtMXN(sbcSinTope)}/día${topado ? `, topado al máximo legal de ${fmtMXN(topeSbcDiario)}/día (25 UMA).` : '.'}` : ''}`,
    _insight,
    _chart,
  };
}
