/**
 * Calculadora del Art. 86 — salario por día de retraso en el pago de prestaciones,
 * República Dominicana 2026 (Art. 86, Código de Trabajo, Ley 16-92).
 *
 * El empleador tiene 10 días para pagar las prestaciones laborales tras la
 * terminación del contrato. A partir del día 11, debe UN día de salario ordinario
 * por cada día de retraso, SIN TOPE, hasta que pague.
 *
 *   salario diario = salario mensual ÷ 23,83 (divisor universal de nómina)
 *   días de retraso = max(0, días transcurridos − 10)
 *   penalidad = días de retraso × salario diario
 */
import { fmtDOP, salarioDiario } from '../data/republica-dominicana-2026';

const PLAZO_LEGAL_DIAS = 10;

export interface Inputs {
  salarioMensual: number;
  diasTranscurridos: number;
}

export interface Outputs {
  penalidad: number | string;
  salarioDiario: number;
  diasRetraso: number;
  diasTranscurridos: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
}

export function articulo86RetrasoPrestacionesRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const diasTranscurridos = Math.max(0, Math.floor(Number(i.diasTranscurridos) || 0));

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  const diario = salarioDiario(salario);
  const diasRetraso = Math.max(0, diasTranscurridos - PLAZO_LEGAL_DIAS);
  const penalidad = diasRetraso * diario;

  const formula =
    `Penalidad = ${diasRetraso} días de retraso × ${fmtDOP(diario)} ` +
    `(salario diario = ${fmtDOP(salario)} ÷ 23,83) = ${fmtDOP(penalidad)}`;

  const explicacion =
    `El empleador tiene ${PLAZO_LEGAL_DIAS} días para pagar las prestaciones tras la salida. ` +
    `Pasaron ${diasTranscurridos} días, por lo que el retraso es de ${diasRetraso} ` +
    `día(s) (${diasTranscurridos} − ${PLAZO_LEGAL_DIAS}). ` +
    `Salario diario = ${fmtDOP(salario)} ÷ 23,83 = ${fmtDOP(diario)}. ` +
    (diasRetraso > 0
      ? `El Art. 86 obliga a pagar 1 día de salario por cada día de retraso, sin tope: ` +
        `${diasRetraso} × ${fmtDOP(diario)} = ${fmtDOP(penalidad)}. Esta suma se acumula hasta que el empleador pague.`
      : `Todavía estás dentro del plazo legal de ${PLAZO_LEGAL_DIAS} días: aún no se genera penalidad.`);

  const _insight = {
    title:
      diasRetraso > 0
        ? `El retraso ya acumula ${fmtDOP(penalidad)}`
        : `Aún dentro del plazo de ${PLAZO_LEGAL_DIAS} días`,
    text:
      diasRetraso > 0
        ? `Con **${diasRetraso} día(s)** de retraso y un salario diario de **${fmtDOP(diario)}**, ` +
          `el empleador te debe **${fmtDOP(penalidad)}** extra por la mora del Art. 86. ` +
          `Este monto **crece un día de salario cada día** que pase sin pago.`
        : `Pasaron **${diasTranscurridos}** de los **${PLAZO_LEGAL_DIAS}** días que tiene el empleador para pagar. ` +
          `La penalidad del Art. 86 recién corre desde el día 11.`,
    tone: (diasRetraso > 0 ? 'warn' : 'neutral') as 'good' | 'warn' | 'neutral',
    icon: '⏱️',
  };

  const _table = {
    title: 'Cómo se calcula la penalidad por mora (Art. 86)',
    headers: ['Concepto', 'Valor'],
    align: ['left', 'right'],
    rows: [
      ['Salario mensual', fmtDOP(salario)],
      ['Salario diario (÷ 23,83)', fmtDOP(diario)],
      ['Días transcurridos desde la salida', String(diasTranscurridos)],
      ['Plazo legal de pago', `${PLAZO_LEGAL_DIAS} días`],
      ['Días de retraso (a partir del día 11)', String(diasRetraso)],
    ],
    footer: ['Penalidad acumulada', fmtDOP(penalidad)],
    note: 'Art. 86 del Código de Trabajo: 1 día de salario ordinario por cada día de retraso, sin tope, hasta el pago efectivo.',
  };

  return {
    penalidad: fmtDOP(penalidad) + ` · ${diasRetraso} día(s) de retraso`,
    salarioDiario: Math.round(diario),
    diasRetraso,
    diasTranscurridos,
    formula,
    explicacion,
    _insight,
    _table,
  };
}
