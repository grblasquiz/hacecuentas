/**
 * Calculadora de intereses sobre prestaciones sociales en Venezuela (LOTTT art. 143).
 *
 * El saldo acumulado de prestaciones sociales genera intereses anuales. La tasa la
 * fija el BCV y es VOLÁTIL, por eso se toma como INPUT editable (no se hardcodea):
 * el patrono debe usar la tasa activa de los seis principales bancos (depósito en
 * la contabilidad de la empresa) o la pasiva (fideicomiso/Fondo de Prestaciones).
 *
 * tasaMensual = (tasaBCV / 100) / 12
 * interesMensual = saldo × tasaMensual
 * interesTotal = interesMensual × meses
 * saldoConIntereses = saldo + interesTotal
 *
 * Moneda: bolívar (VES). Fuente: LOTTT art. 143, BCV.
 */
import { fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  saldoPrestaciones?: number;
  tasaBCV?: number; // % anual, editable
  meses?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function interesesPrestacionesSocialesVenezuela(i: Inputs): Outputs {
  const saldoPrestaciones = Math.max(0, Number(i.saldoPrestaciones) || 0);
  if (saldoPrestaciones <= 0) throw new Error('Ingresá el saldo acumulado de tus prestaciones sociales en bolívares.');
  const tasaBCV = Math.max(0, Number(i.tasaBCV) || 0);
  if (tasaBCV <= 0) throw new Error('Ingresá la tasa de interés anual del BCV (%). Es editable porque cambia cada mes.');
  const meses = Math.max(1, Math.round(Number(i.meses) || 12));

  const tasaMensual = (tasaBCV / 100) / 12;
  const interesMensual = saldoPrestaciones * tasaMensual;
  const interesTotal = interesMensual * meses;
  const saldoConIntereses = saldoPrestaciones + interesTotal;

  const narrativa =
    `Con un saldo de ${fmtVES(saldoPrestaciones)} y una tasa BCV del ${tasaBCV.toLocaleString('de-DE', { maximumFractionDigits: 2 })}% anual, ` +
    `generás ${fmtVES(interesMensual)} de intereses por mes. En ${meses} ${meses === 1 ? 'mes' : 'meses'} acumulás ${fmtVES(interesTotal)}, ` +
    `por lo que tu saldo con intereses sube a ${fmtVES(saldoConIntereses)}.`;

  return {
    interesMensual,
    interesTotal,
    saldoConIntereses,
    _insight: {
      type: 'highlight',
      icon: '📈',
      text: narrativa,
    },
    _table: {
      title: 'Intereses sobre prestaciones sociales (LOTTT art. 143)',
      headers: ['Concepto', 'Valor'],
      rows: [
        ['Saldo de prestaciones', fmtVES(saldoPrestaciones)],
        ['Tasa BCV anual', `${tasaBCV.toLocaleString('de-DE', { maximumFractionDigits: 2 })} %`],
        ['Interés mensual', fmtVES(interesMensual)],
        [`Interés acumulado (${meses} ${meses === 1 ? 'mes' : 'meses'})`, fmtVES(interesTotal)],
        ['Saldo con intereses', fmtVES(saldoConIntereses)],
      ],
      note: 'La tasa de interés sobre prestaciones la fija el BCV mensualmente (LOTTT art. 143) y es volátil: por eso se ingresa a mano. El cálculo es lineal (interés mensual constante sobre el saldo informado), sin capitalización.',
    },
  };
}
