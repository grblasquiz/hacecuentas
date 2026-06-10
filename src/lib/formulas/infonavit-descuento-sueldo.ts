/**
 * Calculadora de descuento Infonavit sobre el sueldo
 * Descuento aplicado mensualmente al trabajador por crédito de vivienda.
 * Los créditos viejos en VSM se actualizan con la UMI (Unidad Mixta Infonavit),
 * NO con el salario mínimo, desde 2017. UMI 2026: $100.81/día (sin aumento vs 2025).
 * Constantes desde src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026 } from '../data/mexico-2026.ts';

export interface Inputs {
  sueldoMensual: number;
  porcentajeDescuento?: number; // en %
  tipoCredito?: 'pesos' | 'vsm';
  cuotaFijaVSM?: number;
}

export interface Outputs {
  descuentoMensual: number;
  sueldoNetoPostInfonavit: number;
  porcentajeEfectivo: number;
  descuentoAnual: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function infonavitDescuentoSueldo(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoMensual);
  // Guard de default: ''/null/undefined → 30% (Number('') = 0 pisaría el default)
  const factorRaw = i.porcentajeDescuento;
  const factorNum = Number(factorRaw);
  const factor = (factorRaw === undefined || factorRaw === null || (factorRaw as unknown) === '' || !Number.isFinite(factorNum))
    ? 30
    : factorNum;
  const tipo = i.tipoCredito ?? 'pesos';
  const cuotaVSM = Number(i.cuotaFijaVSM ?? 0) || 0;

  if (!sueldo || sueldo <= 0) throw new Error('Ingresá el sueldo mensual');
  if (factor < 0 || factor > 100) throw new Error('Factor de descuento debe estar entre 0 y 100');

  let descuentoMensual: number;
  if (tipo === 'vsm' && cuotaVSM > 0) {
    // VSM: cuota en VSM × factor mensual 30.4 × UMI diaria (Infonavit actualiza los créditos VSM con la UMI desde 2017)
    descuentoMensual = cuotaVSM * MEXICO_2026.salarioMinimo.factorMensual * MEXICO_2026.umiDiaria2026;
  } else {
    descuentoMensual = sueldo * factor / 100;
  }

  const sueldoNetoPostInfonavit = sueldo - descuentoMensual;
  const porcentajeEfectivo = (descuentoMensual / sueldo) * 100;
  const descuentoAnual = descuentoMensual * 12;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');
  const pctTxt = porcentajeEfectivo.toFixed(1);

  // INSIGHT dinámico según peso del descuento sobre el sueldo
  let insightTitle: string;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (porcentajeEfectivo > 35) {
    insightTitle = 'Descuento alto sobre tu sueldo';
    insightText = `Infonavit se lleva el **${pctTxt}%** de tu sueldo (**${fmt(descuentoMensual)}**/mes), arriba del tope habitual del ~30%. Te quedan **${fmt(sueldoNetoPostInfonavit)}** para el resto de tus gastos: revisá tu estado de cuenta.`;
    insightTone = 'warn';
    insightIcon = '⚠️';
  } else if (porcentajeEfectivo >= 20) {
    insightTitle = 'Descuento en rango típico';
    insightText = `El descuento de **${fmt(descuentoMensual)}**/mes equivale al **${pctTxt}%** de tu sueldo, dentro del rango habitual de Infonavit. Tu sueldo neto baja a **${fmt(sueldoNetoPostInfonavit)}** y en el año pagás **${fmt(descuentoAnual)}**.`;
    insightTone = 'neutral';
    insightIcon = '🏠';
  } else {
    insightTitle = 'Descuento liviano';
    insightText = `Apenas el **${pctTxt}%** de tu sueldo se va a Infonavit (**${fmt(descuentoMensual)}**/mes), así que conservás **${fmt(sueldoNetoPostInfonavit)}** de los **${fmt(sueldo)}** brutos.`;
    insightTone = 'good';
    insightIcon = '✅';
  }

  // DONUT: el sueldo bruto se reparte en neto + descuento Infonavit
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Sueldo neto', value: Number(sueldoNetoPostInfonavit.toFixed(2)) },
      { label: 'Descuento Infonavit', value: Number(descuentoMensual.toFixed(2)) }
    ],
    prefix: '$',
    centerValue: fmt(sueldo),
    centerLabel: 'Sueldo bruto',
    ariaLabel: `De ${fmt(sueldo)} de sueldo, ${fmt(descuentoMensual)} van a Infonavit y ${fmt(sueldoNetoPostInfonavit)} quedan netos`
  };

  return {
    descuentoMensual: Number(descuentoMensual.toFixed(2)),
    sueldoNetoPostInfonavit: Number(sueldoNetoPostInfonavit.toFixed(2)),
    porcentajeEfectivo: Number(porcentajeEfectivo.toFixed(2)),
    descuentoAnual: Number(descuentoAnual.toFixed(2)),
    mensaje: `Con ${tipo === 'vsm' ? `cuota ${cuotaVSM} VSM` : `factor ${factor}%`}, Infonavit te descuenta $${descuentoMensual.toFixed(2)} y recibís $${sueldoNetoPostInfonavit.toFixed(2)}.`,
    _insight: { title: insightTitle, text: insightText, tone: insightTone, icon: insightIcon },
    _chart
  };
}
