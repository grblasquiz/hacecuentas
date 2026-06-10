/**
 * Salario Diario Integrado (SDI) México 2026 — factor de integración (LFT Arts. 76, 80, 87)
 * y SBC topado a 25 UMA (LSS Art. 28). Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, factorIntegracion, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  salario: number;
  periodo?: string;                  // 'diario' | 'mensual'
  aniosAntiguedad?: number;          // años cumplidos (primer año = 1)
  aguinaldoDias?: number;            // mínimo legal 15 (LFT 87)
  primaVacacionalPct?: number;       // mínimo legal 25 (LFT 80)
  prestacionesExtraMensual?: number; // vales, bonos fijos mensuales que integran al SBC
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

/** Días de vacaciones por años de antigüedad — LFT Art. 76 (vacaciones dignas, reforma 2023). */
function diasVacacionesLft(anios: number): number {
  const { lft } = MEXICO_2026;
  const a = Math.max(1, Math.floor(anios));
  if (a <= lft.vacacionesPorAnio.length) return lft.vacacionesPorAnio[a - 1];
  const topeAnio5 = lft.vacacionesPorAnio[lft.vacacionesPorAnio.length - 1]; // 20 días (año 5)
  return topeAnio5 + lft.vacacionesIncrementoQuinquenal * Math.ceil((a - lft.vacacionesPorAnio.length) / 5);
}

export function compute(i: Inputs): Outputs {
  const { lft, uma, imss, salarioMinimo } = MEXICO_2026;

  const salario = num(i.salario, 0);
  if (salario <= 0) throw new Error('Ingresa tu salario diario o mensual');
  const periodo = String(i.periodo || 'diario') === 'mensual' ? 'mensual' : 'diario';
  const anios = Math.max(1, Math.floor(num(i.aniosAntiguedad, 1)));
  const aguinaldoDias = Math.max(lft.aguinaldoDiasMinimo, num(i.aguinaldoDias, lft.aguinaldoDiasMinimo));
  const primaPct = Math.max(lft.primaVacacional * 100, num(i.primaVacacionalPct, lft.primaVacacional * 100));
  const extrasMensual = Math.max(0, num(i.prestacionesExtraMensual, 0));

  const factorMensual = salarioMinimo.factorMensual; // 30.4 (IMSS/CONASAMI)
  const salarioDiario = periodo === 'mensual' ? salario / factorMensual : salario;

  const diasVacaciones = diasVacacionesLft(anios);
  const esMinimoLegal = aguinaldoDias === lft.aguinaldoDiasMinimo && primaPct === lft.primaVacacional * 100;
  // Con prestaciones mínimas de ley usamos el helper canónico; si son superiores, misma fórmula con los días/prima del usuario.
  const factor = esMinimoLegal
    ? factorIntegracion(anios)
    : Math.round(((365 + aguinaldoDias + diasVacaciones * (primaPct / 100)) / 365) * 10000) / 10000;

  // Composición del SDI (por día)
  const aguinaldoDiario = (salarioDiario * aguinaldoDias) / 365;
  const primaVacDiaria = (salarioDiario * diasVacaciones * (primaPct / 100)) / 365;
  const extrasDiario = extrasMensual / factorMensual;

  const sdi = salarioDiario * factor + extrasDiario;
  const topeSbcDiario = uma.diaria * imss.topeSbcUmas; // 25 UMA = $2,932.75 en 2026
  const topado = sdi > topeSbcDiario;
  const sbc = Math.min(sdi, topeSbcDiario);

  const sdiMensual = sdi * factorMensual;
  const sbcMensual = sbc * factorMensual;

  const _insight = {
    title: 'Tu salario diario integrado',
    text: topado
      ? `Tu SDI es **${fmtMXN(sdi)}** por día (factor ${factor.toFixed(4)}), pero supera el tope legal de **25 UMA** (${fmtMXN(topeSbcDiario)}/día), así que el IMSS te registra con un SBC de **${fmtMXN(sbc)}** (${fmtMXN(sbcMensual)} al mes). Cotizas — y te pagan incapacidades, INFONAVIT y pensión — sobre el tope, no sobre tu salario real.`
      : `Con ${anios} ${anios === 1 ? 'año' : 'años'} de antigüedad te corresponden **${diasVacaciones} días de vacaciones**, y tu factor de integración es **${factor.toFixed(4)}**. Tu SDI es **${fmtMXN(sdi)}** por día (${fmtMXN(sdiMensual)} al mes): esa es la base de tus cuotas IMSS, tu INFONAVIT y cualquier liquidación.`,
    tone: topado ? 'warn' : 'good',
    icon: '📋',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Salario diario', value: Math.round(salarioDiario * 100) / 100 },
      { label: 'Aguinaldo (proporción diaria)', value: Math.round(aguinaldoDiario * 100) / 100 },
      { label: 'Prima vacacional (proporción diaria)', value: Math.round(primaVacDiaria * 100) / 100 },
      { label: 'Prestaciones extra', value: Math.round(extrasDiario * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtMXN(sdi),
    centerLabel: 'SDI por día',
    ariaLabel: `SDI de ${fmtMXN(sdi)} por día: ${fmtMXN(salarioDiario)} de salario más ${fmtMXN(aguinaldoDiario + primaVacDiaria + extrasDiario)} de prestaciones integradas.`,
  };

  return {
    factor: factor.toFixed(4),
    sdi: `${fmtMXN(sdi)} por día`,
    sbc: topado ? `${fmtMXN(sbc)} por día (topado a 25 UMA)` : `${fmtMXN(sbc)} por día`,
    sbcMensual: fmtMXN(sbcMensual),
    diasVacaciones: `${diasVacaciones} días (año ${anios})`,
    detalle: `Factor = (365 + ${aguinaldoDias} aguinaldo + ${diasVacaciones} vac. × ${primaPct}%) ÷ 365 = ${factor.toFixed(4)}. SDI = ${fmtMXN(salarioDiario)} × ${factor.toFixed(4)}${extrasDiario > 0 ? ` + ${fmtMXN(extrasDiario)} de prestaciones` : ''} = ${fmtMXN(sdi)}/día.${topado ? ` SBC topado al máximo legal de ${fmtMXN(topeSbcDiario)}/día (25 UMA).` : ''}`,
    _insight,
    _chart,
  };
}
