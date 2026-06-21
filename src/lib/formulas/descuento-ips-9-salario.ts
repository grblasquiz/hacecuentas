/**
 * Descuento IPS — PARAGUAY.
 * Muestra el aporte obrero (9%, se descuenta del recibo), el aporte patronal
 * (16,5%, lo paga el empleador) y el costo total para el empleador (bruto × 1,165).
 *
 * Instituto de Previsión Social (IPS). Datos desde src/lib/data/paraguay-2026.ts.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface DescuentoIps9SalarioInputs {
  salarioBruto: number | string;
}

export interface DescuentoIps9SalarioOutputs {
  descuentoObrero: number;
  aportePatronal: number;
  costoTotalEmpleador: number;
  netoTrabajador: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function descuentoIps9Salario(i: DescuentoIps9SalarioInputs): DescuentoIps9SalarioOutputs {
  const bruto = Math.max(0, Number(i.salarioBruto) || 0);
  if (bruto <= 0) throw new Error('Ingresá tu salario bruto');

  const tasaObrero = PARAGUAY_2026.ips.obrero;     // 0.09
  const tasaPatronal = PARAGUAY_2026.ips.patronal; // 0.165

  const descuentoObrero = bruto * tasaObrero;
  const aportePatronal = bruto * tasaPatronal;
  const costoTotalEmpleador = bruto + aportePatronal;
  const netoTrabajador = bruto - descuentoObrero;

  const resumen = `IPS obrero ${fmtPYG(descuentoObrero)} (9%) · patronal ${fmtPYG(aportePatronal)} (16,5%) · total IPS ${fmtPYG(descuentoObrero + aportePatronal)}`;

  const formula = `Descuento obrero = bruto × 9% = ${fmtPYG(bruto)} × 0,09 = ${fmtPYG(descuentoObrero)}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '🏥',
    text: `Sobre un sueldo de **${fmtPYG(bruto)}**, a vos te descuentan **${fmtPYG(descuentoObrero)}** (9% obrero) y tu empleador aporta otros **${fmtPYG(aportePatronal)}** (16,5% patronal). Entre los dos se ingresan **${fmtPYG(descuentoObrero + aportePatronal)}** mensuales al IPS, que financian tu salud y tu jubilación.`,
  };

  const _table = {
    title: 'Aportes IPS sobre el salario',
    headers: ['Aporte', 'Tasa', 'Monto', 'Lo paga'],
    rows: [
      ['Obrero (se descuenta del recibo)', '9%', fmtPYG(descuentoObrero), 'El trabajador'],
      ['Patronal', '16,5%', fmtPYG(aportePatronal), 'El empleador'],
      ['Total ingresado al IPS', '25,5%', fmtPYG(descuentoObrero + aportePatronal), 'Ambos'],
      ['Costo total para el empleador', '116,5%', fmtPYG(costoTotalEmpleador), 'El empleador'],
    ],
    note: 'El aporte patronal del 16,5% se reparte 14% al IPS y 2,5% al Ministerio de Salud Pública. Sólo el 9% obrero sale del bolsillo del trabajador; el resto lo asume el empleador además del sueldo.',
  };

  return {
    descuentoObrero: Math.round(descuentoObrero),
    aportePatronal: Math.round(aportePatronal),
    costoTotalEmpleador: Math.round(costoTotalEmpleador),
    netoTrabajador: Math.round(netoTrabajador),
    resumen,
    formula,
    _insight,
    _table,
  };
}
