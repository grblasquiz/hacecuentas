/**
 * Utilidades (aguinaldo) Venezuela — LOTTT Art. 131 / Art. 132.
 *
 * Las utilidades son la participación del trabajador en los beneficios de la empresa.
 * Mínimo legal: 30 días de salario al año. Tope habitual: 120 días.
 * Se pagan en proporción a los meses efectivamente trabajados en el ejercicio.
 *
 *   utilidades = (salarioMensual / 30) × díasQuePagaLaEmpresa × (mesesTrabajados / 12)
 *
 * Fuente: LOTTT Art. 131 (utilidades), Art. 132 (mínimo y máximo).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual: number;     // salario mensual (Bs.)
  diasUtilidades?: number;    // días que paga la empresa (30 a 120, default 30)
  mesesTrabajados?: number;   // meses trabajados en el ejercicio (default 12)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraUtilidadesAguinaldoVenezuela(i: Inputs): Outputs {
  const l = VENEZUELA_2026.lottt;
  const salarioMensual = Number(i.salarioMensual) || 0;
  const diasUtilidades = Math.max(0, Number(i.diasUtilidades ?? l.utilidadesDiasMin) || l.utilidadesDiasMin);
  let mesesTrabajados = Number(i.mesesTrabajados ?? 12);
  if (!Number.isFinite(mesesTrabajados) || mesesTrabajados <= 0) mesesTrabajados = 12;
  mesesTrabajados = Math.min(12, mesesTrabajados);

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  const salarioDiario = salarioMensual / 30;
  const proporcion = mesesTrabajados / 12;

  const utilidadesCompletas = salarioDiario * diasUtilidades; // año completo
  const utilidades = utilidadesCompletas * proporcion;        // proporcional a meses

  const esMinimoLegal = diasUtilidades <= l.utilidadesDiasMin;

  const _insight = {
    type: 'highlight',
    icon: '🎁',
    text: `Con un salario de **${fmtVES(salarioMensual)}**/mes y **${diasUtilidades} días** de utilidades por ${mesesTrabajados} meses trabajados, ` +
      `cobrás **${fmtVES(utilidades)}**. ` +
      (esMinimoLegal
        ? 'Estás cobrando el mínimo legal (30 días); si la empresa paga más días, el monto sube proporcionalmente.'
        : `Como tu empresa paga más que el mínimo de ${l.utilidadesDiasMin} días, cobrás por encima del piso legal.`),
  };

  const _table = {
    title: 'Cómo se calculan tus utilidades',
    headers: ['Paso', 'Cálculo', 'Resultado'],
    rows: [
      ['Salario diario', `${fmtVES(salarioMensual)} ÷ 30`, fmtVES(salarioDiario)],
      ['Utilidades por año completo', `${fmtVES(salarioDiario)} × ${diasUtilidades} días`, fmtVES(utilidadesCompletas)],
      [`Proporción (${mesesTrabajados}/12 meses)`, `${fmtVES(utilidadesCompletas)} × ${(proporcion).toFixed(4)}`, fmtVES(utilidades)],
    ],
    note: `Mínimo legal: ${l.utilidadesDiasMin} días/año (LOTTT Art. 132). Máximo habitual: ${l.utilidadesDiasMax} días. Si trabajaste el año completo, mesesTrabajados = 12.`,
  };

  return {
    utilidades: Number(utilidades.toFixed(2)),
    utilidadesCompletas: Number(utilidadesCompletas.toFixed(2)),
    salarioDiario: Number(salarioDiario.toFixed(2)),
    diasUtilidades,
    mesesTrabajados,
    detalle: `${fmtVES(salarioDiario)} × ${diasUtilidades} días × ${mesesTrabajados}/12 = ${fmtVES(utilidades)}`,
    _insight,
    _table,
  };
}
