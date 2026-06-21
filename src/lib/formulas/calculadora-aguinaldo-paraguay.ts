/**
 * Aguinaldo (décimo tercer salario) — PARAGUAY.
 * Código del Trabajo (Ley 213/93), art. 243: el aguinaldo equivale a la
 * doceava parte (1/12) de todo lo percibido en el año calendario.
 *
 * Modo "sueldo fijo todo el año": aguinaldo = sueldoMensual × meses / 12.
 * Modo "ingresar total anual": aguinaldo = totalPercibidoAnual / 12.
 *
 * Datos desde src/lib/data/paraguay-2026.ts (NO se hardcodea nada).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface AguinaldoParaguayInputs {
  modo: string;                 // 'sueldo-fijo' | 'total-anual'
  sueldoMensual?: number | string;
  mesesTrabajados?: number | string;
  totalAnual?: number | string;
}

export interface AguinaldoParaguayOutputs {
  aguinaldo: number;
  baseAnual: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraAguinaldoParaguay(i: AguinaldoParaguayInputs): AguinaldoParaguayOutputs {
  const modo = (i.modo || 'sueldo-fijo').toString();
  const divisor = PARAGUAY_2026.laboral.aguinaldoDivisor; // 12

  let baseAnual = 0;
  let mesesUsados = 12;

  if (modo === 'total-anual') {
    baseAnual = Math.max(0, Number(i.totalAnual) || 0);
    if (baseAnual <= 0) throw new Error('Ingresá el total percibido en el año');
  } else {
    const sueldo = Math.max(0, Number(i.sueldoMensual) || 0);
    if (sueldo <= 0) throw new Error('Ingresá tu sueldo mensual');
    let meses = Number(i.mesesTrabajados);
    if (!Number.isFinite(meses) || meses <= 0) meses = 12;
    meses = Math.min(12, Math.max(0, meses));
    mesesUsados = meses;
    baseAnual = sueldo * meses;
  }

  const aguinaldo = baseAnual / divisor;

  const resumen =
    modo === 'total-anual'
      ? `${fmtPYG(baseAnual)} percibidos en el año ÷ 12 = ${fmtPYG(aguinaldo)}`
      : `${fmtPYG(baseAnual / Math.max(1, mesesUsados))}/mes × ${mesesUsados} meses ÷ 12 = ${fmtPYG(aguinaldo)}`;

  const formula =
    modo === 'total-anual'
      ? `Aguinaldo = total percibido ÷ 12 = ${fmtPYG(baseAnual)} ÷ 12 = ${fmtPYG(aguinaldo)}`
      : `Aguinaldo = (sueldo × meses) ÷ 12 = (${fmtPYG(baseAnual / Math.max(1, mesesUsados))} × ${mesesUsados}) ÷ 12 = ${fmtPYG(aguinaldo)}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '🎁',
    text:
      modo === 'total-anual'
        ? `Sobre **${fmtPYG(baseAnual)}** percibidos en el año, tu aguinaldo es **${fmtPYG(aguinaldo)}** (la doceava parte). Si tuviste horas extras, comisiones o bonos, ya están dentro de ese total y suben el aguinaldo.`
        : `Con un sueldo de **${fmtPYG(baseAnual / Math.max(1, mesesUsados))}** durante **${mesesUsados} meses**, tu aguinaldo es **${fmtPYG(aguinaldo)}**. Cobrar el año completo equivale a un sueldo mensual extra.`,
  };

  const _table = {
    title: 'Cómo se forma tu aguinaldo paraguayo',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Base percibida en el año', fmtPYG(baseAnual)],
      ['Divisor legal (art. 243)', '÷ 12'],
      ['Aguinaldo a cobrar', fmtPYG(aguinaldo)],
    ],
    note: 'El aguinaldo se paga antes del 31 de diciembre de cada año. Incluye todo lo percibido: sueldo, horas extras, comisiones, bonificaciones y aguinaldo de descanso. No se le descuenta IPS.',
  };

  return {
    aguinaldo: Math.round(aguinaldo),
    baseAnual: Math.round(baseAnual),
    resumen,
    formula,
    _insight,
    _table,
  };
}
