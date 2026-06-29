/**
 * Cestaticket socialista (bono de alimentación) Venezuela.
 *
 * El cestaticket es un beneficio de alimentación fijado en USD 40/mes, indexado a la
 * tasa BCV: se paga en bolívares al equivalente del monto en USD según la tasa BCV
 * del día. NO es salario (no incide en prestaciones, vacaciones ni utilidades).
 *
 *   montoProporcional = montoUSD × (diasTrabajados / 30)
 *   cestaticketBs     = montoProporcional × tasaBCV
 *   valorDiario       = cestaticketBs / diasTrabajados
 *
 * El monto base se expresa en USD (input), pero el resultado se paga en bolívares.
 *
 * Fuente: MinTrabajo, Gaceta Oficial (cestaticket socialista USD 40).
 */
import { fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  montoUSD: number;        // monto base del cestaticket en USD (default 40)
  tasaBCV: number;         // tasa BCV Bs./USD (input editable, volátil)
  diasTrabajados: number;  // días efectivamente trabajados en el mes (default 30)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function cestaticketBonoAlimentacionVenezuela(i: Inputs): Outputs {
  const montoUSD = Math.max(0, Number(i.montoUSD) || 0);
  const tasaBCV = Math.max(0, Number(i.tasaBCV) || 0);
  const diasTrabajados = Math.max(0, Number(i.diasTrabajados) || 0);

  if (montoUSD <= 0) throw new Error('Ingresá el monto del cestaticket en USD');
  if (tasaBCV <= 0) throw new Error('Ingresá la tasa BCV (Bs./USD)');
  if (diasTrabajados <= 0) throw new Error('Ingresá los días trabajados');

  const montoProporcional = montoUSD * (diasTrabajados / 30);
  const cestaticketBs = montoProporcional * tasaBCV;
  const valorDiario = cestaticketBs / diasTrabajados;

  const _insight = {
    type: 'highlight',
    icon: '🍽️',
    text: `Con **USD ${montoUSD}** de cestaticket y **${diasTrabajados}** día(s) trabajados, el monto proporcional es **USD ${montoProporcional.toFixed(2)}**. ` +
      `A una tasa BCV de **${fmtVES(tasaBCV)}/USD**, cobrás **${fmtVES(cestaticketBs)}** (${fmtVES(valorDiario)} por día).`,
  };

  const _table = {
    title: 'Desglose del cestaticket',
    headers: ['Concepto', 'Valor'],
    rows: [
      ['Monto base', `USD ${montoUSD.toFixed(2)}`],
      ['Días trabajados', `${diasTrabajados} de 30`],
      ['Monto proporcional (USD)', `USD ${montoProporcional.toFixed(2)}`],
      ['Tasa BCV', `${fmtVES(tasaBCV)}/USD`],
      ['Cestaticket en bolívares', fmtVES(cestaticketBs)],
      ['Valor por día', fmtVES(valorDiario)],
    ],
    note: 'El cestaticket se indexa a la tasa BCV del día de pago. Es un beneficio de alimentación: NO es salario y no incide en prestaciones, vacaciones ni utilidades.',
  };

  return {
    cestaticketBs: Number(cestaticketBs.toFixed(2)),
    valorDiario: Number(valorDiario.toFixed(2)),
    montoProporcionalUsd: Number(montoProporcional.toFixed(2)),
    detalle: `USD ${montoProporcional.toFixed(2)} × ${fmtVES(tasaBCV)} = ${fmtVES(cestaticketBs)}`,
    _insight,
    _table,
  };
}
