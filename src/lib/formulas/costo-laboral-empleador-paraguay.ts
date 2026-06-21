/**
 * Costo laboral del empleador — PARAGUAY.
 * Cuánto le cuesta realmente un empleado al empleador, además del salario bruto:
 *   - Aporte patronal IPS (16,5%)
 *   - Provisión mensual del aguinaldo (1/12 del salario, art. 243)
 *
 * costoMensual = bruto + aportePatronal + provisiónAguinaldo
 *
 * Datos desde src/lib/data/paraguay-2026.ts (NO se hardcodea nada).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface CostoLaboralEmpleadorParaguayInputs {
  salarioBruto: number | string;
}

export interface CostoLaboralEmpleadorParaguayOutputs {
  costoMensual: number;
  aportePatronal: number;
  provisionAguinaldo: number;
  costoAnual: number;
  sobrecostoPct: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function costoLaboralEmpleadorParaguay(i: CostoLaboralEmpleadorParaguayInputs): CostoLaboralEmpleadorParaguayOutputs {
  const bruto = Math.max(0, Number(i.salarioBruto) || 0);
  if (bruto <= 0) throw new Error('Ingresá el salario bruto del empleado');

  const tasaPatronal = PARAGUAY_2026.ips.patronal; // 0.165
  const divisorAguinaldo = PARAGUAY_2026.laboral.aguinaldoDivisor; // 12

  const aportePatronal = bruto * tasaPatronal;
  const provisionAguinaldo = bruto / divisorAguinaldo;
  const costoMensual = bruto + aportePatronal + provisionAguinaldo;
  const costoAnual = costoMensual * 12;
  const sobrecostoPct = bruto > 0 ? ((costoMensual - bruto) / bruto) * 100 : 0;

  const resumen = `${fmtPYG(bruto)} bruto + ${fmtPYG(aportePatronal)} IPS patronal + ${fmtPYG(provisionAguinaldo)} aguinaldo = ${fmtPYG(costoMensual)}/mes`;

  const formula = `Costo mensual = bruto + 16,5% IPS + (bruto ÷ 12 aguinaldo) = ${fmtPYG(costoMensual)}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '💼',
    text: `Pagar un sueldo bruto de **${fmtPYG(bruto)}** te cuesta en realidad **${fmtPYG(costoMensual)}** por mes (un **${sobrecostoPct.toFixed(1)}%** más): ${fmtPYG(aportePatronal)} de IPS patronal y ${fmtPYG(provisionAguinaldo)} que conviene provisionar cada mes para el aguinaldo. En el año son **${fmtPYG(costoAnual)}**.`,
  };

  const _table = {
    title: 'Costo laboral mensual real para el empleador',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Salario bruto', fmtPYG(bruto)],
      ['Aporte patronal IPS (16,5%)', '+ ' + fmtPYG(aportePatronal)],
      ['Provisión aguinaldo (1/12)', '+ ' + fmtPYG(provisionAguinaldo)],
      ['Costo mensual total', fmtPYG(costoMensual)],
      ['Costo anual (× 12)', fmtPYG(costoAnual)],
    ],
    note: 'No incluye costos variables ni eventuales: vacaciones gozadas (ya están dentro del sueldo), indemnizaciones, preaviso, horas extras, ni provisión por antigüedad. El 16,5% patronal se reparte 14% IPS + 2,5% Salud Pública.',
  };

  return {
    costoMensual: Math.round(costoMensual),
    aportePatronal: Math.round(aportePatronal),
    provisionAguinaldo: Math.round(provisionAguinaldo),
    costoAnual: Math.round(costoAnual),
    sobrecostoPct: Number(sobrecostoPct.toFixed(2)),
    resumen,
    formula,
    _insight,
    _table,
  };
}
