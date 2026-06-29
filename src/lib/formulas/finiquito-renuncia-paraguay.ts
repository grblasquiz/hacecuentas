/**
 * Finiquito por RENUNCIA — PARAGUAY (Código del Trabajo, Ley 213/93).
 * Cuando el trabajador renuncia voluntariamente NO le corresponde indemnización por
 * despido (art. 91) ni preaviso a su favor: sólo cobra los rubros ya devengados.
 *
 * aguinaldoProp   = (salarioMensual × mesesAnioActual) / 12
 * diasVacAnio     = <5 años → 12 · <10 años → 18 · ≥10 años → 30  (art. 218)
 * vacProporcDias  = max(0, diasVacAnio × (mesesAnioActual/12) − vacacionesGozadasDias)
 * valorDia        = salarioMensual / 30
 * vacacionesProp  = vacProporcDias × valorDia
 * salarioPendiente = valorDia × diasTrabajadosMes
 * totalFiniquito  = aguinaldoProp + vacacionesProp + salarioPendiente
 *
 * Constantes (vacaciones, divisor aguinaldo) desde src/lib/data/paraguay-2026.ts.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface FiniquitoRenunciaParaguayInputs {
  salarioMensual: number | string;
  antiguedadAnios: number | string;
  mesesAnioActual?: number | string;
  diasTrabajadosMes?: number | string;
  vacacionesGozadasDias?: number | string;
}

export interface FiniquitoRenunciaParaguayOutputs {
  aguinaldoProp: number;
  vacacionesProp: number;
  salarioPendiente: number;
  totalFiniquito: number;
  resumen: string;
  formula: string;
  _insight?: any;
  _table?: any;
}

/** Días de vacaciones anuales según antigüedad (art. 218, Cód. del Trabajo). */
function diasVacacionesAnio(antiguedadAnios: number): number {
  for (const t of PARAGUAY_2026.laboral.vacaciones) {
    if (antiguedadAnios < t.hastaAnios) return t.dias;
  }
  return PARAGUAY_2026.laboral.vacaciones[PARAGUAY_2026.laboral.vacaciones.length - 1].dias;
}

export function finiquitoRenunciaParaguay(i: FiniquitoRenunciaParaguayInputs): FiniquitoRenunciaParaguayOutputs {
  const salario = Math.max(0, Number(i.salarioMensual) || 0);
  if (salario <= 0) throw new Error('Ingresá tu salario mensual');
  const antiguedad = Math.max(0, Number(i.antiguedadAnios) || 0);
  const mesesAnio = Math.min(12, Math.max(0, Number(i.mesesAnioActual ?? 12) || 0));
  const diasTrabMes = Math.max(0, Number(i.diasTrabajadosMes) || 0);
  const vacGozadas = Math.max(0, Number(i.vacacionesGozadasDias) || 0);

  const aguinaldoProp = (salario * mesesAnio) / PARAGUAY_2026.laboral.aguinaldoDivisor;

  const diasVacAnio = diasVacacionesAnio(antiguedad);
  const vacProporcDias = Math.max(0, diasVacAnio * (mesesAnio / 12) - vacGozadas);
  const valorDia = salario / PARAGUAY_2026.diasMes; // /30
  const vacacionesProp = vacProporcDias * valorDia;

  const salarioPendiente = valorDia * diasTrabMes;

  const totalFiniquito = aguinaldoProp + vacacionesProp + salarioPendiente;

  const resumen = `Aguinaldo ${fmtPYG(aguinaldoProp)} + vacaciones ${fmtPYG(vacacionesProp)}${salarioPendiente > 0 ? ` + salario pendiente ${fmtPYG(salarioPendiente)}` : ''} = ${fmtPYG(totalFiniquito)}`;

  const formula = `Finiquito = aguinaldo proporcional + vacaciones proporcionales${diasTrabMes > 0 ? ' + días trabajados' : ''} = ${fmtPYG(totalFiniquito)}`;

  const _insight = {
    type: 'highlight' as const,
    icon: '🇵🇾',
    text: `Por renuncia voluntaria cobrás **${fmtPYG(totalFiniquito)}**: aguinaldo proporcional (${fmtPYG(aguinaldoProp)}), vacaciones proporcionales no gozadas (${fmtPYG(vacacionesProp)})${salarioPendiente > 0 ? ` y salario por días trabajados (${fmtPYG(salarioPendiente)})` : ''}. **Atención:** cuando renunciás NO te corresponde indemnización por despido (art. 91) ni preaviso a tu favor; sólo cobrás lo ya devengado.`,
  };

  const _table = {
    title: 'Finiquito por renuncia (Paraguay)',
    headers: ['Rubro', 'Monto'],
    rows: [
      [`Aguinaldo proporcional (${mesesAnio}/12 meses)`, fmtPYG(aguinaldoProp)],
      [`Vacaciones proporcionales (${vacProporcDias.toFixed(1)} días, base ${diasVacAnio}/año)`, fmtPYG(vacacionesProp)],
      [`Salario por días trabajados (${diasTrabMes} días)`, fmtPYG(salarioPendiente)],
      ['Indemnización por despido', 'No aplica (renuncia)'],
      ['Total a cobrar', fmtPYG(totalFiniquito)],
    ],
    note: 'En la renuncia voluntaria no hay indemnización por despido injustificado (art. 91) ni preaviso a favor del trabajador. Sólo se liquidan los rubros devengados: aguinaldo proporcional, vacaciones no gozadas y salario de los días trabajados del mes.',
  };

  return {
    aguinaldoProp: Math.round(aguinaldoProp),
    vacacionesProp: Math.round(vacacionesProp),
    salarioPendiente: Math.round(salarioPendiente),
    totalFiniquito: Math.round(totalFiniquito),
    resumen,
    formula,
    _insight,
    _table,
  };
}
