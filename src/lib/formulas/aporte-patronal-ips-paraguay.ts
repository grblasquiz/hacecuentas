/**
 * Aporte patronal al IPS — PARAGUAY.
 * Calcula el costo del IPS sobre un salario: aporte obrero (9%, se descuenta del
 * trabajador) + aporte patronal (16,5%, lo paga el empleador aparte). El total de
 * planilla multiplica el costo IPS por la cantidad de empleados.
 *
 * aporteObrero      = salarioBruto × 9%
 * aportePatronal    = salarioBruto × 16,5%
 * totalIPSporEmpleado = aporteObrero + aportePatronal  (25,5%)
 * totalPlanilla     = totalIPSporEmpleado × cantEmpleados
 *
 * Tasas desde src/lib/data/paraguay-2026.ts (IPS obrero/patronal — NO hardcodeadas).
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface AportePatronalIpsParaguayInputs {
  salarioBruto: number | string;
  cantEmpleados?: number | string;
}

export interface AportePatronalIpsParaguayOutputs {
  aporteObrero: number;
  aportePatronal: number;
  totalIPSporEmpleado: number;
  totalPlanilla: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

export function aportePatronalIpsParaguay(i: AportePatronalIpsParaguayInputs): AportePatronalIpsParaguayOutputs {
  const bruto = Math.max(0, Number(i.salarioBruto) || 0);
  if (bruto <= 0) throw new Error('Ingresá el salario bruto del empleado');
  const cant = Math.max(1, Math.floor(Number(i.cantEmpleados) || 1));

  const tasaObrero = PARAGUAY_2026.ips.obrero;     // 0.09
  const tasaPatronal = PARAGUAY_2026.ips.patronal; // 0.165

  const aporteObrero = bruto * tasaObrero;
  const aportePatronal = bruto * tasaPatronal;
  const totalIPSporEmpleado = aporteObrero + aportePatronal;
  const totalPlanilla = totalIPSporEmpleado * cant;

  const resumen = `Obrero ${fmtPYG(aporteObrero)} (9%) + patronal ${fmtPYG(aportePatronal)} (16,5%) = ${fmtPYG(totalIPSporEmpleado)} por empleado${cant > 1 ? ` × ${cant} = ${fmtPYG(totalPlanilla)}` : ''}`;

  const formula = `IPS por empleado = Bruto × 25,5% = ${fmtPYG(totalIPSporEmpleado)}${cant > 1 ? ` · Planilla = × ${cant} empleados = ${fmtPYG(totalPlanilla)}` : ''}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '🇵🇾',
    text: `Por un salario bruto de **${fmtPYG(bruto)}**, el empleador ingresa al IPS **${fmtPYG(totalIPSporEmpleado)}** por empleado: **${fmtPYG(aporteObrero)}** que se descuentan del trabajador (9%) y **${fmtPYG(aportePatronal)}** que paga la empresa de su bolsillo (16,5%). El patronal NO se le descuenta al empleado.`,
  };

  const _table = {
    title: 'Desglose del aporte al IPS (Paraguay)',
    headers: ['Concepto', 'Tasa', 'Monto'],
    rows: [
      ['Aporte obrero (lo descuenta el trabajador)', '9%', fmtPYG(aporteObrero)],
      ['Aporte patronal (lo paga el empleador)', '16,5%', fmtPYG(aportePatronal)],
      ['Total IPS por empleado', '25,5%', fmtPYG(totalIPSporEmpleado)],
      [`Total planilla (${cant} ${cant === 1 ? 'empleado' : 'empleados'})`, '—', fmtPYG(totalPlanilla)],
    ],
    note: 'El aporte patronal del 16,5% se desglosa en 14% al IPS + 2,5% al Ministerio de Salud Pública. Es un costo de la empresa que se suma al salario bruto, no se descuenta del trabajador.',
  };

  return {
    aporteObrero: Math.round(aporteObrero),
    aportePatronal: Math.round(aportePatronal),
    totalIPSporEmpleado: Math.round(totalIPSporEmpleado),
    totalPlanilla: Math.round(totalPlanilla),
    resumen,
    formula,
    _insight,
    _table,
  };
}
