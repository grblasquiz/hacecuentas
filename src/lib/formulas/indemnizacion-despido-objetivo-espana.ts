/**
 * Calculadora de Indemnización por Despido Objetivo — España
 *
 * Regulación: Estatuto de los Trabajadores (ET) Art. 52 y 53.
 *
 * Indemnización: 20 días de salario por año de servicio.
 * Tope: 12 mensualidades.
 * Preaviso: 15 días (Art. 53.1.c ET).
 * La fracción de año se prorratea por meses completos.
 *
 * El despido objetivo procede por:
 *   - Ineptitud sobrevenida.
 *   - Falta de adaptación a modificaciones técnicas.
 *   - Amortización del puesto por causas económicas, técnicas, organizativas o productivas (ETOP).
 *   - Faltas de asistencia justificadas intermitentes (derogado en 2020, RDL 4/2020).
 */

export interface DespidoObjetivoInputs {
  salarioMensualBruto: number; // bruto mensual con prorrata
  aniosServicio: number;
  mesesExtra: number; // 0-11
  preavisoIncumplido: boolean; // ¿no dio 15 días de preaviso?
}

export interface DespidoObjetivoOutputs {
  indemnizacionTotal: string;
  diasIndemnizacion: string;
  salarioDiario: string;
  topeAplicado: string;
  importePreaviso: string;
  totalAPercibir: string;
}

const fmtEUR = (n: number) =>
  n.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function indemnizacionDespidoObjetivoEspana(
  i: DespidoObjetivoInputs
): DespidoObjetivoOutputs {
  const salario = Number(i.salarioMensualBruto);
  const anios = Math.max(0, Number(i.aniosServicio) || 0);
  const meses = Math.max(0, Math.min(11, Number(i.mesesExtra) || 0));
  const sinPreaviso = Boolean(i.preavisoIncumplido);

  if (!salario || salario <= 0) {
    throw new Error('Ingresá tu salario mensual bruto (con prorrata de pagas extra)');
  }
  if (anios === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad (años y/o meses)');
  }

  const salarioDiario = (salario * 12) / 365;
  const tiempo = anios + meses / 12;

  // 20 días por año, tope 12 mensualidades (360 días)
  const diasRaw = 20 * tiempo;
  const topeAbsoluto = 360; // 12 mensualidades × 30 días
  const diasIndemnizacion = Math.min(diasRaw, topeAbsoluto);
  const topeAplicado = diasRaw > topeAbsoluto;

  const indemnizacion = salarioDiario * diasIndemnizacion;

  // Preaviso: 15 días de salario si no se respetó (Art. 53.1.c ET)
  const importePreaviso = sinPreaviso ? salarioDiario * 15 : 0;

  const total = indemnizacion + importePreaviso;

  return {
    indemnizacionTotal: fmtEUR(indemnizacion),
    diasIndemnizacion: `${diasIndemnizacion.toFixed(2)} días de salario`,
    salarioDiario: fmtEUR(salarioDiario) + '/día',
    topeAplicado: topeAplicado
      ? `Sí — tope de 12 mensualidades (360 días) aplicado. Sin tope te correspondían ${diasRaw.toFixed(0)} días.`
      : 'No — indemnización dentro del tope legal',
    importePreaviso: sinPreaviso
      ? fmtEUR(importePreaviso) + ' (15 días por falta de preaviso)'
      : 'No aplica (preaviso respetado)',
    totalAPercibir: fmtEUR(total),
  };
}
