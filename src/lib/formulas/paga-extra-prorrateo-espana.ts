/** Paga extra: cálculo del importe devengado y del prorrateo mensual (España).
 *  El Estatuto de los Trabajadores (art. 31) reconoce como mínimo 2 pagas extraordinarias
 *  al año (habitualmente verano y Navidad). Cada paga suele equivaler a una mensualidad
 *  de salario base (más los complementos que fije el convenio).
 *    - Devengo: semestral (6 meses) o anual (12 meses) según convenio.
 *    - Paga devengada = importe de la paga completa × (meses trabajados / meses de devengo).
 *    - Prorrateo mensual = (importe paga × nº de pagas al año) / 12.
 *  Fuente: Real Decreto Legislativo 2/2015 (Estatuto de los Trabajadores), art. 31. */

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Math.round(n * 100) / 100) + ' €';

export interface Inputs {
  importePagaCompleta: number;  // importe de UNA paga extra completa (€), normalmente 1 mensualidad
  numeroPagas?: number;         // pagas extra al año (default 2)
  mesesTrabajados?: number;     // meses trabajados en el periodo de devengo (default = devengo completo)
  tipoDevengo?: string;         // 'semestral' (6 meses) | 'anual' (12 meses)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const importePaga = Number(i.importePagaCompleta) || 0;
  const numeroPagas = Number(i.numeroPagas) > 0 ? Number(i.numeroPagas) : 2;
  const devengoMeses = String(i.tipoDevengo || 'semestral') === 'anual' ? 12 : 6;
  const mesesRaw = Number(i.mesesTrabajados);
  const meses = mesesRaw > 0 ? Math.min(mesesRaw, devengoMeses) : devengoMeses;
  if (importePaga <= 0) throw new Error('Introduce el importe de la paga extra completa');

  const pagaDevengada = importePaga * (meses / devengoMeses);
  const totalAnualPagas = importePaga * numeroPagas;
  const prorrateoMensual = totalAnualPagas / 12;
  const salarioAnual12mensualidades = importePaga * 12; // referencia: 12 mensualidades ordinarias
  const salarioAnualTotal = salarioAnual12mensualidades + totalAnualPagas; // 12 + pagas extra

  const _insight = {
    title: meses < devengoMeses ? 'Tu paga extra proporcional' : 'Tu paga extra completa',
    text: meses < devengoMeses
      ? `Con **${meses}** de los **${devengoMeses}** meses de devengo trabajados, te corresponde una paga extra proporcional de **${fmtEur(pagaDevengada)}** (de una paga completa de ${fmtEur(importePaga)}). Si estuviera prorrateada, verías **${fmtEur(prorrateoMensual)}** más cada mes.`
      : `Con el periodo de devengo completo cobras la paga entera: **${fmtEur(importePaga)}**. Entre las **${numeroPagas}** pagas del año suman **${fmtEur(totalAnualPagas)}**; prorrateadas serían **${fmtEur(prorrateoMensual)}** más al mes.`,
    tone: 'good',
    icon: '💶',
  };
  const _chart = {
    type: 'bar',
    labels: ['Paga devengada', 'Prorrateo mensual'],
    values: [Math.round(pagaDevengada), Math.round(prorrateoMensual)],
    prefix: '€ ',
    ariaLabel: `Paga devengada ${fmtEur(pagaDevengada)} y prorrateo mensual ${fmtEur(prorrateoMensual)}.`,
  };

  return {
    pagaDevengada: fmtEur(pagaDevengada),
    prorrateoMensual: fmtEur(prorrateoMensual),
    totalAnualPagas: fmtEur(totalAnualPagas),
    salarioAnualTotal: fmtEur(salarioAnualTotal),
    detalle: `Paga completa ${fmtEur(importePaga)} · devengo ${devengoMeses} meses · trabajados ${meses} → devengada ${fmtEur(pagaDevengada)}. ${numeroPagas} pagas/año = ${fmtEur(totalAnualPagas)}; prorrateo ${fmtEur(prorrateoMensual)}/mes.`,
    _insight,
    _chart,
  };
}
