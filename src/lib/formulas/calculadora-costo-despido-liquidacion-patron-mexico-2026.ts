/**
 * Costo total de un despido para el PATRÓN — México 2026 (desembolso del empleador).
 *
 * Ángulo "cuánto me cuesta despedir": suma TODO lo que el patrón debe desembolsar,
 * sin descontar ISR/IMSS del trabajador (esas retenciones no reducen el costo patronal).
 *
 *   Injustificado (LFT Art. 48/50): 3 meses de salario integrado + 20 días/año
 *      + prima de antigüedad (12 días/año, salario topado a 2 SM) + finiquito proporcional.
 *   Justificado (rescisión con causa): sólo finiquito proporcional + prima de antigüedad
 *      (la prima de antigüedad se paga también en separación justificada con ≥15 años, Art. 162).
 *
 * Constantes (salario mínimo, factor de integración, indemnización LFT, prima antigüedad,
 * aguinaldo/vacaciones): fuente única src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, factorIntegracion, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  salarioMensual?: number;        // sueldo bruto mensual ordinario
  antiguedadAnios?: number;       // años de antigüedad
  tipoDespido?: string;           // 'injustificado' | 'justificado'
  diasAguinaldoPendientes?: number; // días de aguinaldo proporcional devengados (default: prop. del año)
  diasVacacionesPendientes?: number; // días de vacaciones no gozadas
  __lang?: string;
}

export interface Outputs {
  costoTotalPatron: number;
  indemnizacion3Meses: number;
  indemnizacion20Dias: number;
  primaAntiguedad: number;
  finiquitoAguinaldo: number;
  finiquitoVacaciones: number;
  finiquitoPrimaVacacional: number;
  salarioDiarioIntegrado: number;
  mesesDeSalario: number;
  tipoDespido: string;
  detalle: string;
  formula: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

function diasVacacionesPorAntiguedad(anios: number): number {
  const { lft } = MEXICO_2026;
  const a = Math.max(1, Math.floor(anios));
  if (a <= lft.vacacionesPorAnio.length) return lft.vacacionesPorAnio[a - 1];
  return 20 + lft.vacacionesIncrementoQuinquenal * Math.ceil((a - 5) / 5);
}

export function compute(i: Inputs): Outputs {
  const sueldoMensual = Number(i.salarioMensual);
  if (!Number.isFinite(sueldoMensual) || sueldoMensual <= 0) {
    throw new Error('Ingresá el salario bruto mensual del empleado.');
  }
  const anios = Math.max(0, Number(i.antiguedadAnios) || 0);
  const injustificado = String(i.tipoDespido || 'injustificado').toLowerCase() !== 'justificado';

  const { salarioMinimo, lft } = MEXICO_2026;

  // Salario diario y salario diario INTEGRADO (SDI) para la indemnización (LFT Art. 89: base integrada).
  const salarioDiario = r2(sueldoMensual / salarioMinimo.factorMensual);
  const factor = factorIntegracion(Math.max(1, Math.ceil(anios)));
  const sdi = r2(salarioDiario * factor);

  // ── Indemnización constitucional (sólo despido injustificado) ──
  // 3 meses (= 90 días) de salario integrado + 20 días por año de antigüedad.
  const indemnizacion3Meses = injustificado ? r2(sdi * 30 * lft.indemnizacion.mesesConstitucionales) : 0;
  const indemnizacion20Dias = injustificado ? r2(sdi * lft.indemnizacion.diasPorAnio20 * Math.ceil(anios)) : 0;

  // ── Prima de antigüedad (Art. 162): 12 días/año, salario topado a 2× SM diario ──
  // En despido injustificado se paga siempre; en separación justificada/renuncia, sólo con ≥15 años.
  const topeSalarioPrima = salarioMinimo.generalDiario * lft.primaAntiguedad.topeSalarioVecesSm;
  const salarioBasePrima = Math.min(salarioDiario, topeSalarioPrima);
  const pagaPrimaAntiguedad = injustificado || anios >= 15;
  const primaAntiguedad = pagaPrimaAntiguedad
    ? r2(salarioBasePrima * lft.primaAntiguedad.diasPorAnio * Math.floor(anios))
    : 0;

  // ── Finiquito proporcional (se paga SIEMPRE, justificado o no) ──
  // Aguinaldo proporcional devengado: por default, proporción del año transcurrido sobre 15 días.
  const aguinaldoDevDefault = r2((lft.aguinaldoDiasMinimo * 0.5)); // ~medio año por default (6 meses)
  const diasAguinaldo = i.diasAguinaldoPendientes !== undefined && i.diasAguinaldoPendientes !== null && String(i.diasAguinaldoPendientes) !== ''
    ? Math.max(0, Number(i.diasAguinaldoPendientes) || 0)
    : aguinaldoDevDefault;
  const finiquitoAguinaldo = r2(salarioDiario * diasAguinaldo);

  // Vacaciones pendientes (no gozadas): por default las del año en curso según antigüedad.
  const diasVacDefault = diasVacacionesPorAntiguedad(anios);
  const diasVacaciones = i.diasVacacionesPendientes !== undefined && i.diasVacacionesPendientes !== null && String(i.diasVacacionesPendientes) !== ''
    ? Math.max(0, Number(i.diasVacacionesPendientes) || 0)
    : diasVacDefault;
  const finiquitoVacaciones = r2(salarioDiario * diasVacaciones);
  const finiquitoPrimaVacacional = r2(finiquitoVacaciones * lft.primaVacacional); // 25% sobre vacaciones

  // ── Costo total del patrón (desembolso bruto, sin restar ISR/IMSS del trabajador) ──
  const costoTotalPatron = r2(
    indemnizacion3Meses +
      indemnizacion20Dias +
      primaAntiguedad +
      finiquitoAguinaldo +
      finiquitoVacaciones +
      finiquitoPrimaVacacional,
  );
  const mesesDeSalario = sueldoMensual > 0 ? r2(costoTotalPatron / sueldoMensual) : 0;

  const detalle =
    `SDI ${fmtMXN(sdi)} (factor ${factor}) | ` +
    (injustificado
      ? `3 meses ${fmtMXN(indemnizacion3Meses)} + 20 días/año ${fmtMXN(indemnizacion20Dias)} + `
      : 'Despido justificado (sin indemnización constitucional) | ') +
    `prima antigüedad ${fmtMXN(primaAntiguedad)} + finiquito [aguinaldo ${fmtMXN(finiquitoAguinaldo)} + vacaciones ${fmtMXN(finiquitoVacaciones)} + prima vac. ${fmtMXN(finiquitoPrimaVacacional)}] = ` +
    `COSTO TOTAL ${fmtMXN(costoTotalPatron)} (≈${mesesDeSalario} meses de sueldo)`;

  const formula = injustificado
    ? `Costo = 3·SDI·30 + 20·SDI·años + prima antig. + finiquito prop. = ${fmtMXN(costoTotalPatron)}`
    : `Costo = prima antig. (si ≥15 años) + finiquito proporcional = ${fmtMXN(costoTotalPatron)}`;

  const _insight = {
    title: injustificado ? 'Costo de un despido injustificado' : 'Costo de una baja justificada',
    text: injustificado
      ? `Despedir sin causa a este empleado (**${fmtMXN(sueldoMensual)}**/mes, **${Math.ceil(anios)} año/s**) le cuesta al patrón **${fmtMXN(costoTotalPatron)}** — unos **${mesesDeSalario} meses** de sueldo. El grueso es la indemnización constitucional (**${fmtMXN(indemnizacion3Meses + indemnizacion20Dias)}**).`
      : `Una baja **justificada** (con causa probada) evita la indemnización constitucional: el patrón sólo desembolsa el **finiquito proporcional**${anios >= 15 ? ' más la prima de antigüedad' : ''}, **${fmtMXN(costoTotalPatron)}**. Negociar una renuncia o probar la causa ahorra los 3 meses + 20 días/año.`,
    tone: (injustificado ? 'warn' : 'good') as 'good' | 'warn',
    icon: '🏢',
  };

  const _table = {
    title: 'Desembolso del patrón al despedir',
    headers: ['Concepto', 'Base legal', 'Importe'],
    rows: [
      ...(injustificado
        ? [
            ['Indemnización: 3 meses (salario integrado)', 'LFT Art. 48/50', fmtMXN(indemnizacion3Meses)],
            ['Indemnización: 20 días por año', 'LFT Art. 50-II', fmtMXN(indemnizacion20Dias)],
          ]
        : [['Indemnización constitucional', 'No aplica (justificado)', fmtMXN(0)]]),
      ['Prima de antigüedad (12 días/año, tope 2 SM)', 'LFT Art. 162', fmtMXN(primaAntiguedad)],
      ['Aguinaldo proporcional', 'LFT Art. 87', fmtMXN(finiquitoAguinaldo)],
      ['Vacaciones no gozadas', 'LFT Art. 76', fmtMXN(finiquitoVacaciones)],
      ['Prima vacacional (25%)', 'LFT Art. 80', fmtMXN(finiquitoPrimaVacacional)],
      ['Costo total del patrón', 'Desembolso bruto', fmtMXN(costoTotalPatron)],
    ],
    note: 'Es el desembolso BRUTO del empleador: el ISR y el IMSS obrero se retienen del pago al trabajador pero NO reducen el costo del patrón. La indemnización de 3 meses usa el salario diario integrado (SDI = salario + proporcional de aguinaldo y prima vacacional). La prima de antigüedad topa el salario base a 2 salarios mínimos.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      ...(indemnizacion3Meses + indemnizacion20Dias > 0
        ? [{ label: 'Indemnización', value: Math.round(indemnizacion3Meses + indemnizacion20Dias) }]
        : []),
      ...(primaAntiguedad > 0 ? [{ label: 'Prima antigüedad', value: Math.round(primaAntiguedad) }] : []),
      { label: 'Finiquito', value: Math.round(finiquitoAguinaldo + finiquitoVacaciones + finiquitoPrimaVacacional) },
    ],
    prefix: '$',
    centerValue: fmtMXN(costoTotalPatron),
    centerLabel: 'Costo total',
    ariaLabel: `Composición del costo del despido para el patrón: ${fmtMXN(costoTotalPatron)} en total.`,
  };

  return {
    costoTotalPatron,
    indemnizacion3Meses,
    indemnizacion20Dias,
    primaAntiguedad,
    finiquitoAguinaldo,
    finiquitoVacaciones,
    finiquitoPrimaVacacional,
    salarioDiarioIntegrado: sdi,
    mesesDeSalario,
    tipoDespido: injustificado ? 'injustificado' : 'justificado',
    detalle,
    formula,
    _insight,
    _table,
    _chart,
  };
}
