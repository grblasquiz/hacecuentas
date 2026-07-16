/**
 * Rol de pagos mensual (Ecuador) — ingresos y egresos del trabajador en relación de dependencia.
 * - Aporte personal IESS 9,45% sobre la materia gravada (sueldo + horas extra + comisiones/bonos).
 *   Fuente: IESS (iess.gob.ec). Los décimos NO aportan al IESS.
 * - Décimos mensualizados (si el trabajador optó por cobrarlos mes a mes):
 *     13º mensualizado = materia gravada / 12 · 14º mensualizado = SBU / 12 (SBU 2026 = 482).
 *   Fuente: Código del Trabajo (Ministerio del Trabajo).
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  sueldo: number;
  horasExtra?: number;            // valor $ de horas extra/suplementarias del mes
  comisionesBonos?: number;       // comisiones y bonos remunerativos
  decimosMensualizados?: string;  // 'si' | 'no'
  otrosDescuentos?: number;       // préstamos, anticipos, etc.
  retencionIR?: number;           // retención mensual de impuesto a la renta
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

const SBU = ECUADOR_2026.sbu;                 // 482
const IESS_PERSONAL = ECUADOR_2026.iessPersonal; // 0,0945

export function compute(i: Inputs): Outputs {
  const sueldo = Number(i.sueldo) || 0;
  const extra = Math.max(0, Number(i.horasExtra) || 0);
  const comis = Math.max(0, Number(i.comisionesBonos) || 0);
  const mensualiza = String(i.decimosMensualizados || 'no') === 'si';
  const otros = Math.max(0, Number(i.otrosDescuentos) || 0);
  const ir = Math.max(0, Number(i.retencionIR) || 0);
  if (sueldo <= 0) throw new Error('Ingresá tu sueldo base mensual');

  // Materia gravada del IESS = remuneración de carácter normal (sin décimos).
  const materiaGravada = sueldo + extra + comis;
  const aporteIESS = materiaGravada * IESS_PERSONAL;

  const decimo13 = mensualiza ? materiaGravada / 12 : 0;
  const decimo14 = mensualiza ? SBU / 12 : 0;

  const totalIngresos = materiaGravada + decimo13 + decimo14;
  const totalEgresos = aporteIESS + otros + ir;
  const neto = totalIngresos - totalEgresos;

  const _insight = {
    title: 'Tu rol de pagos del mes',
    text: `Ingresos por **${fmtUSDec(totalIngresos)}** menos egresos por **${fmtUSDec(totalEgresos)}** (IESS ${fmtUSDec(aporteIESS)}${otros > 0 ? ` + otros ${fmtUSDec(otros)}` : ''}${ir > 0 ? ` + IR ${fmtUSDec(ir)}` : ''}) → **recibís ${fmtUSDec(neto)}** en mano.`,
    tone: 'good',
    icon: '📄',
  };

  const rows: (string | number)[][] = [
    ['Ingresos', '', ''],
    ['Sueldo base', '', fmtUSDec(sueldo)],
  ];
  if (extra > 0) rows.push(['Horas extra / suplementarias', '', fmtUSDec(extra)]);
  if (comis > 0) rows.push(['Comisiones y bonos', '', fmtUSDec(comis)]);
  if (mensualiza) {
    rows.push(['Décimo tercero mensualizado', '', fmtUSDec(decimo13)]);
    rows.push(['Décimo cuarto mensualizado', '', fmtUSDec(decimo14)]);
  }
  rows.push(['Total ingresos', '', fmtUSDec(totalIngresos)]);
  rows.push(['Egresos', '', '']);
  rows.push(['Aporte personal IESS (9,45%)', '', `- ${fmtUSDec(aporteIESS)}`]);
  if (otros > 0) rows.push(['Otros descuentos (préstamos, anticipos)', '', `- ${fmtUSDec(otros)}`]);
  if (ir > 0) rows.push(['Retención impuesto a la renta', '', `- ${fmtUSDec(ir)}`]);
  rows.push(['Total egresos', '', `- ${fmtUSDec(totalEgresos)}`]);
  rows.push(['Neto a recibir', '', fmtUSDec(neto)]);

  const _table = {
    title: 'Rol de pagos mensual',
    headers: ['Concepto', '', 'Valor'],
    align: ['left', 'left', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'El aporte personal al IESS (9,45%) se calcula sobre la materia gravada (sueldo + horas extra + comisiones), no sobre los décimos. Los décimos mensualizados solo aparecen si optaste por cobrarlos mes a mes.',
  };

  return {
    netoRecibir: fmtUSDec(neto),
    totalIngresos: fmtUSDec(totalIngresos),
    aporteIESS: fmtUSDec(aporteIESS),
    totalEgresos: fmtUSDec(totalEgresos),
    detalle: `Ingresos ${fmtUSDec(totalIngresos)} − IESS ${fmtUSDec(aporteIESS)}${otros > 0 ? ` − otros ${fmtUSDec(otros)}` : ''}${ir > 0 ? ` − IR ${fmtUSDec(ir)}` : ''} = ${fmtUSDec(neto)}.`,
    _insight,
    _table,
  };
}
