/**
 * Salario integral Venezuela — LOTTT.
 * El salario integral es la base de cálculo de las prestaciones sociales (Art. 142)
 * y otros pasivos. Suma al salario normal las ALÍCUOTAS diarias de:
 *   - utilidades / aguinaldo  (Art. 131): díasUtilidades × salarioDiario / 360
 *   - bono vacacional         (Art. 192): díasBonoVacacional × salarioDiario / 360
 *
 *   salarioDiarioIntegral = salarioDiarioNormal
 *                         + (díasUtilidades  × salarioDiarioNormal / 360)
 *                         + (díasBonoVac      × salarioDiarioNormal / 360)
 *
 * Fuente: LOTTT (Art. 104 — concepto de salario integral, Art. 122, Art. 131, Art. 192).
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioNormalMensual: number;   // salario normal mensual en Bs.
  diasUtilidades?: number;        // días de utilidades que paga la empresa (min legal 30)
  diasBonoVacacional?: number;    // días de bono vacacional (min legal 15)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraSalarioIntegralVenezuela(i: Inputs): Outputs {
  const l = VENEZUELA_2026.lottt;
  const salarioNormalMensual = Number(i.salarioNormalMensual) || 0;
  const diasUtilidades = Math.max(0, Number(i.diasUtilidades ?? l.utilidadesDiasMin) || l.utilidadesDiasMin);
  const diasBonoVac = Math.max(0, Number(i.diasBonoVacacional ?? l.bonoVacacionalDiasBase) || l.bonoVacacionalDiasBase);

  if (salarioNormalMensual <= 0) throw new Error('Ingresá tu salario normal mensual');

  const DIAS_ANIO = l.diasAnioComercial; // 360

  const salarioDiarioNormal = salarioNormalMensual / 30;
  const alicuotaUtilidades = (diasUtilidades * salarioDiarioNormal) / DIAS_ANIO;
  const alicuotaBonoVac = (diasBonoVac * salarioDiarioNormal) / DIAS_ANIO;

  const salarioDiarioIntegral = salarioDiarioNormal + alicuotaUtilidades + alicuotaBonoVac;
  const salarioIntegralMensual = salarioDiarioIntegral * 30;

  const _insight = {
    type: 'highlight',
    icon: '💼',
    text: `Tu salario integral diario es **${fmtVES(salarioDiarioIntegral)}** (${fmtVES(salarioIntegralMensual)}/mes). ` +
      `Sale de tu salario normal diario (**${fmtVES(salarioDiarioNormal)}**) más la alícuota de utilidades (${diasUtilidades} días → **${fmtVES(alicuotaUtilidades)}**/día) ` +
      `y la del bono vacacional (${diasBonoVac} días → **${fmtVES(alicuotaBonoVac)}**/día). Este es el salario que se usa para calcular tus prestaciones sociales.`,
  };

  const _table = {
    title: 'Cómo se compone tu salario integral diario',
    headers: ['Concepto', 'Cálculo', 'Monto diario'],
    rows: [
      ['Salario normal diario', `${fmtVES(salarioNormalMensual)} ÷ 30`, fmtVES(salarioDiarioNormal)],
      ['Alícuota de utilidades', `${diasUtilidades} días × ${fmtVES(salarioDiarioNormal)} ÷ 360`, fmtVES(alicuotaUtilidades)],
      ['Alícuota de bono vacacional', `${diasBonoVac} días × ${fmtVES(salarioDiarioNormal)} ÷ 360`, fmtVES(alicuotaBonoVac)],
      ['Salario integral diario', 'Suma de los tres', fmtVES(salarioDiarioIntegral)],
    ],
    note: 'El salario integral (LOTTT Art. 104) es la base de cálculo de las prestaciones sociales. Las alícuotas se prorratean sobre el año comercial de 360 días.',
  };

  return {
    salarioDiarioIntegral: Number(salarioDiarioIntegral.toFixed(2)),
    salarioIntegralMensual: Number(salarioIntegralMensual.toFixed(2)),
    salarioDiarioNormal: Number(salarioDiarioNormal.toFixed(2)),
    alicuotaUtilidades: Number(alicuotaUtilidades.toFixed(2)),
    alicuotaBonoVacacional: Number(alicuotaBonoVac.toFixed(2)),
    desglose: `Normal ${fmtVES(salarioDiarioNormal)} + utilidades ${fmtVES(alicuotaUtilidades)} + bono vac. ${fmtVES(alicuotaBonoVac)} = ${fmtVES(salarioDiarioIntegral)}/día`,
    _insight,
    _table,
  };
}
