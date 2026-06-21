/**
 * Liquidación / finiquito Venezuela — LOTTT (terminación de la relación de trabajo).
 *
 * Total a pagar al cese =
 *     prestaciones sociales (Art. 142, el MAYOR entre garantía y retroactivo)
 *   + vacaciones fraccionadas       (Art. 196: proporción de los meses del año en curso)
 *   + bono vacacional fraccionado   (Art. 196)
 *   + utilidades fraccionadas       (Art. 131: proporción de los meses del ejercicio)
 *   + indemnización por terminación (Art. 92: SOLO si el despido es injustificado;
 *                                    es igual al monto de las prestaciones sociales)
 *
 * Salario integral diario = salario normal diario + alícuota utilidades + alícuota bono vac.
 *
 * Fuente: LOTTT Art. 142, Art. 92, Art. 131, Art. 196.
 */
import { VENEZUELA_2026, diasVacacionesLottt, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual: number;        // salario normal mensual (Bs.)
  aniosAntiguedad: number;       // años completos de antigüedad
  mesesAntiguedad?: number;      // meses adicionales del periodo en curso (0-11) → base del fraccionamiento
  motivo?: string;               // 'renuncia' | 'despido-justificado' | 'despido-injustificado'
  diasUtilidades?: number;       // días de utilidades que paga la empresa (min legal 30)
  diasBonoVacacional?: number;   // días de bono vacacional (min legal 15)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function calculadoraLiquidacionFiniquitoVenezuela(i: Inputs): Outputs {
  const l = VENEZUELA_2026.lottt;
  const p = l.prestaciones;
  const salarioMensual = Number(i.salarioMensual) || 0;
  const aniosEnteros = Math.max(0, Math.floor(Number(i.aniosAntiguedad) || 0));
  const mesesExtra = Math.max(0, Math.min(11, Math.floor(Number(i.mesesAntiguedad) || 0)));
  const motivo = String(i.motivo || 'renuncia');
  const diasUtilidades = Math.max(0, Number(i.diasUtilidades ?? l.utilidadesDiasMin) || l.utilidadesDiasMin);
  const diasBonoVac = Math.max(0, Number(i.diasBonoVacacional ?? l.bonoVacacionalDiasBase) || l.bonoVacacionalDiasBase);

  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  const DIAS_ANIO = l.diasAnioComercial; // 360
  const salarioDiarioNormal = salarioMensual / 30;

  // ── Salario integral diario ──
  const alicuotaUtilidades = (diasUtilidades * salarioDiarioNormal) / DIAS_ANIO;
  const alicuotaBonoVac = (diasBonoVac * salarioDiarioNormal) / DIAS_ANIO;
  const salarioDiarioIntegral = salarioDiarioNormal + alicuotaUtilidades + alicuotaBonoVac;

  // ── Prestaciones sociales (Art. 142, el MAYOR) ──
  const mesesTotales = aniosEnteros * 12 + mesesExtra;
  const trimestresCompletos = Math.floor(mesesTotales / 3);
  const diasGarantiaBase = p.garantiaDiasPorTrimestre * trimestresCompletos;
  let diasAdicionales = 0;
  for (let anio = 2; anio <= aniosEnteros; anio++) diasAdicionales += p.diasAdicionalesPorAnio;
  diasAdicionales = Math.min(diasAdicionales, p.diasAdicionalesMax);
  const montoGarantia = (diasGarantiaBase + diasAdicionales) * salarioDiarioIntegral;

  let aniosRetroactivo = aniosEnteros;
  if (mesesExtra > p.fraccionSuperiorMeses) aniosRetroactivo += 1;
  const montoRetroactivo = p.retroactivoDiasPorAnio * aniosRetroactivo * salarioDiarioIntegral;

  const prestaciones = Math.max(montoGarantia, montoRetroactivo);

  // ── Conceptos fraccionados del periodo en curso (proporción mesesExtra/12) ──
  // Días de vacaciones y bono vacacional según la antigüedad alcanzada.
  const diasVacAnio = diasVacacionesLottt(Math.max(1, aniosEnteros));
  const diasBonoVacAnio = Math.min(
    l.bonoVacacionalDiasBase + Math.max(0, aniosEnteros - 1) * l.bonoVacacionalDiasPorAnio,
    l.bonoVacacionalDiasMax,
  );
  const fraccion = mesesExtra / 12;

  const vacacionesFraccionadas = diasVacAnio * salarioDiarioNormal * fraccion;
  const bonoVacacionalFraccionado = diasBonoVacAnio * salarioDiarioNormal * fraccion;
  const utilidadesFraccionadas = diasUtilidades * salarioDiarioNormal * fraccion;

  // ── Indemnización Art. 92 (solo despido injustificado = igual a prestaciones) ──
  const esDespidoInjustificado = motivo === 'despido-injustificado';
  const indemnizacion = esDespidoInjustificado ? prestaciones : 0;

  const total =
    prestaciones +
    vacacionesFraccionadas +
    bonoVacacionalFraccionado +
    utilidadesFraccionadas +
    indemnizacion;

  const motivoLabel =
    motivo === 'despido-injustificado' ? 'despido injustificado'
    : motivo === 'despido-justificado' ? 'despido justificado'
    : 'renuncia';

  const _insight = {
    type: 'highlight',
    icon: '📋',
    text: `Tu liquidación por **${motivoLabel}** con ${aniosEnteros} año(s) y ${mesesExtra} mes(es) de antigüedad suma **${fmtVES(total)}**. ` +
      `Incluye prestaciones sociales (${fmtVES(prestaciones)}), vacaciones y bono fraccionados (${fmtVES(vacacionesFraccionadas + bonoVacacionalFraccionado)}) ` +
      `y utilidades fraccionadas (${fmtVES(utilidadesFraccionadas)})` +
      (esDespidoInjustificado
        ? `, más la indemnización del Art. 92 por despido injustificado (${fmtVES(indemnizacion)}, igual a tus prestaciones).`
        : '. Al ser una salida sin despido injustificado, no corresponde la indemnización adicional del Art. 92.'),
  };

  const rows: (string | number)[][] = [
    ['Prestaciones sociales (Art. 142)', 'Mayor entre garantía y retroactivo', fmtVES(prestaciones)],
    ['Vacaciones fraccionadas', `${diasVacAnio} días × ${mesesExtra}/12`, fmtVES(vacacionesFraccionadas)],
    ['Bono vacacional fraccionado', `${diasBonoVacAnio} días × ${mesesExtra}/12`, fmtVES(bonoVacacionalFraccionado)],
    ['Utilidades fraccionadas', `${diasUtilidades} días × ${mesesExtra}/12`, fmtVES(utilidadesFraccionadas)],
  ];
  if (esDespidoInjustificado) {
    rows.push(['Indemnización Art. 92', 'Igual a las prestaciones', fmtVES(indemnizacion)]);
  }
  rows.push(['Total liquidación', '—', fmtVES(total)]);

  const _table = {
    title: 'Desglose de tu liquidación',
    headers: ['Concepto', 'Cálculo', 'Monto'],
    rows,
    note: 'Los conceptos fraccionados corresponden a los meses trabajados del periodo en curso. La indemnización del Art. 92 solo aplica en despido injustificado y equivale al monto de las prestaciones sociales.',
  };

  return {
    total: Number(total.toFixed(2)),
    prestaciones: Number(prestaciones.toFixed(2)),
    vacacionesFraccionadas: Number(vacacionesFraccionadas.toFixed(2)),
    bonoVacacionalFraccionado: Number(bonoVacacionalFraccionado.toFixed(2)),
    utilidadesFraccionadas: Number(utilidadesFraccionadas.toFixed(2)),
    indemnizacion: Number(indemnizacion.toFixed(2)),
    salarioDiarioIntegral: Number(salarioDiarioIntegral.toFixed(2)),
    motivo: motivoLabel,
    detalle: `Prestaciones ${fmtVES(prestaciones)} + fraccionados ${fmtVES(vacacionesFraccionadas + bonoVacacionalFraccionado + utilidadesFraccionadas)}${esDespidoInjustificado ? ` + indemnización ${fmtVES(indemnizacion)}` : ''} = ${fmtVES(total)}`,
    _insight,
    _table,
  };
}
