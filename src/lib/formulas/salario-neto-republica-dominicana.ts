/**
 * Calculadora de salario neto y nómina — República Dominicana 2026.
 *   neto = bruto − AFP (2,87%) − SFS (3,04%) − retención ISR mensual.
 * AFP/SFS se topean al salario cotizable máximo; el ISR se calcula anualizando la
 * base (bruto − AFP − SFS) × 12, aplicando la escala anual del Art. 296 y ÷ 12.
 * Reusa el helper salarioNetoDominicana de la data (no reimplementa la escala).
 */
import {
  REPUBLICA_DOMINICANA_2026 as RD,
  fmtDOP,
  salarioNetoDominicana,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioBruto: number;
}

export interface Outputs {
  neto: number | string;
  bruto: number;
  afp: number;
  sfs: number;
  tss: number;
  isr: number;
  totalDescuentos: number;
  tasaDescuento: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

export function salarioNetoRepublicaDominicana(i: Inputs): Outputs {
  const bruto = Number(i.salarioBruto);
  if (!bruto || bruto <= 0) throw new Error('Ingresá tu salario bruto mensual en RD$');

  const d = salarioNetoDominicana(bruto);
  const totalDescuentos = d.tss + d.isrMensual;
  const tasaDescuento = bruto > 0 ? (totalDescuentos / bruto) * 100 : 0;

  const formula =
    `Neto = ${fmtDOP(bruto)} − AFP ${fmtDOP(d.afp)} − SFS ${fmtDOP(d.sfs)} − ISR ${fmtDOP(d.isrMensual)} = ${fmtDOP(d.neto)}`;

  const explicacion =
    `Salario bruto: ${fmtDOP(bruto)}. ` +
    `AFP (2,87%): ${fmtDOP(d.afp)}. SFS (3,04%): ${fmtDOP(d.sfs)}. Total TSS del trabajador: ${fmtDOP(d.tss)}. ` +
    (d.isrMensual > 0
      ? `Base de ISR (bruto − AFP − SFS): ${fmtDOP(d.baseIsrMensual)}; retención mensual de ISR: ${fmtDOP(d.isrMensual)}. `
      : `No hay retención de ISR: la base anualizada no supera la exención de ${fmtDOP(RD.isr.exencionAnual)}. `) +
    `Salario neto en mano: ${fmtDOP(d.neto)} (descuentos totales ${tasaDescuento.toFixed(1)}% del bruto).`;

  const exentoIsr = d.isrMensual <= 0;
  const _insight = {
    title: `Tu salario neto es ${fmtDOP(d.neto)}`,
    text: exentoIsr
      ? `De **${fmtDOP(bruto)}** brutos te descuentan solo la TSS (**${fmtDOP(d.tss)}**, AFP + SFS). No pagás ISR porque tu base anual no supera la exención de **${fmtDOP(RD.isr.exencionAnual)}**. Neto: **${fmtDOP(d.neto)}**.`
      : `De **${fmtDOP(bruto)}** brutos te descuentan **${fmtDOP(d.tss)}** de TSS (AFP + SFS) y **${fmtDOP(d.isrMensual)}** de ISR. En mano quedan **${fmtDOP(d.neto)}** (descuentos del **${tasaDescuento.toFixed(1)}%**).`,
    tone: 'neutral' as 'good' | 'warn' | 'neutral',
    icon: '🇩🇴',
  };

  const _table = {
    title: 'Desglose de tu nómina',
    headers: ['Concepto', 'Tasa', 'Monto'],
    align: ['left', 'right', 'right'],
    rows: [
      ['Salario bruto', '', fmtDOP(bruto)],
      ['AFP (pensiones)', '2,87%', '− ' + fmtDOP(d.afp)],
      ['SFS (salud)', '3,04%', '− ' + fmtDOP(d.sfs)],
      ['Retención de ISR', '', '− ' + fmtDOP(d.isrMensual)],
    ],
    footer: ['Salario neto', '', fmtDOP(d.neto)],
    note: 'AFP y SFS topean en el salario cotizable máximo (SFS RD$232.230, AFP RD$464.460). El ISR se calcula anualizando la base (bruto − AFP − SFS) y aplicando la escala del Art. 296.',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto', value: Math.round(d.neto) },
      { label: 'AFP', value: Math.round(d.afp) },
      { label: 'SFS', value: Math.round(d.sfs) },
      { label: 'ISR', value: Math.round(d.isrMensual) },
    ].filter((s) => s.value > 0),
    prefix: 'RD$',
    centerValue: fmtDOP(d.neto),
    centerLabel: 'Neto',
    ariaLabel: 'Composición del salario: neto, AFP, SFS e ISR',
  };

  return {
    neto: fmtDOP(d.neto) + ' · en mano',
    bruto: Math.round(bruto),
    afp: Math.round(d.afp),
    sfs: Math.round(d.sfs),
    tss: Math.round(d.tss),
    isr: Math.round(d.isrMensual),
    totalDescuentos: Math.round(totalDescuentos),
    tasaDescuento: Number(tasaDescuento.toFixed(2)),
    formula,
    explicacion,
    _insight,
    _table,
    _chart,
  };
}
