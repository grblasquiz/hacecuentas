/**
 * Costo total de un empleado para el empleador — República Dominicana.
 *
 * Además del salario bruto, el empleador paga aportes patronales a la TSS y otras
 * cargas legales sobre la nómina:
 *   - AFP patronal (pensiones)      7,10%   (tope: 20 salarios mín. cotizables)
 *   - SFS patronal (salud)          7,09%   (tope: 10 salarios mín. cotizables)
 *   - SRL (riesgos laborales)       ~1,20%  (tope: 4 salarios mín. cotizables)
 *   - INFOTEP                       1,00%   sobre la nómina (sin tope)
 * A eso se le suma la provisión mensual de prestaciones que se devengan en el año:
 *   - Regalía pascual (Art. 219): salario ÷ 12 (un mes de sueldo al año).
 *   - Auxilio de cesantía (Art. 80): se provisiona a razón de 21 días de salario
 *     por año (tramo 1–5 años, el más común), mensualizado ÷ 12. Es una ESTIMACIÓN;
 *     la cesantía solo se paga si el contrato termina por desahucio o despido
 *     injustificado, y la tasa sube a 23 días/año a partir de los 5 años.
 *
 * Datos y helpers desde la tabla maestra única.
 */
import {
  REPUBLICA_DOMINICANA_2026 as DO,
  salarioDiario,
  fmtDOP,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioBruto: number;
  /** Incluir la provisión mensual de cesantía + regalía en el costo. Default true.
   *  El select del front lo manda como string ("true"/"false"). */
  incluirProvisiones?: boolean | string | number;
}

export interface Outputs {
  salarioBruto: number;
  afpPatronal: number;
  sfsPatronal: number;
  srlPatronal: number;
  infotep: number;
  provisionRegalia: number;
  provisionCesantia: number;
  cargasSociales: number;
  costoTotal: number;
  sobrecostoPct: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
  _steps?: any;
}

export function costoEmpleadorRepublicaDominicana(i: Inputs): Outputs {
  const bruto = Number(i.salarioBruto);
  // El select llega como string ("true"/"false"). Boolean("false") === true, así
  // que hay que comparar el string explícitamente, no castear con Boolean().
  const rawProv = i.incluirProvisiones;
  const incluirProvisiones = rawProv === undefined || rawProv === null || rawProv === ''
    ? true
    : !(rawProv === false || rawProv === 'false' || rawProv === 0 || rawProv === '0' || rawProv === 'no');

  if (!bruto || bruto <= 0) throw new Error('Ingresá el salario bruto mensual en RD$');

  const tss = DO.tss;
  const baseAfp = Math.min(bruto, tss.topeAfp);
  const baseSfs = Math.min(bruto, tss.topeSfs);
  const baseSrl = Math.min(bruto, tss.topeSrl);

  const afp = baseAfp * tss.afpPatronal;
  const sfs = baseSfs * tss.sfsPatronal;
  const srl = baseSrl * tss.srlPatronal;
  const infotep = bruto * 0.01; // 1% de la nómina, sin tope

  const diario = salarioDiario(bruto);
  // Regalía: un mes de sueldo al año → mensual = bruto / 12.
  const provisionRegalia = incluirProvisiones ? bruto / 12 : 0;
  // Cesantía: 21 días/año (tramo 1–5 años) mensualizado.
  const provisionCesantia = incluirProvisiones ? (21 * diario) / 12 : 0;

  const cargasSociales = afp + sfs + srl + infotep + provisionRegalia + provisionCesantia;
  const costoTotal = bruto + cargasSociales;
  const sobrecostoPct = (costoTotal / bruto - 1) * 100;

  const formula = `Costo = bruto + AFP 7,10% + SFS 7,09% + SRL 1,20% + INFOTEP 1%${incluirProvisiones ? ' + regalía (÷12) + cesantía' : ''} = ${fmtDOP(costoTotal)}`;

  const explicacion = `Sobre un salario bruto de ${fmtDOP(bruto)}, el empleador paga aportes patronales a la TSS: AFP ${fmtDOP(afp)} (7,10%), SFS ${fmtDOP(sfs)} (7,09%) y SRL ${fmtDOP(srl)} (~1,20%), más INFOTEP ${fmtDOP(infotep)} (1% de la nómina).${incluirProvisiones ? ` A eso se suma la provisión mensual de regalía pascual ${fmtDOP(provisionRegalia)} (un mes de sueldo al año ÷ 12) y de cesantía ${fmtDOP(provisionCesantia)} (21 días/año mensualizados).` : ''} El costo total mensual del empleado es ${fmtDOP(costoTotal)}, un ${sobrecostoPct.toFixed(1)}% por encima del bruto.`;

  const _steps = [
    { label: 'Salario bruto', value: fmtDOP(bruto) },
    { label: 'AFP patronal (7,10%)', value: fmtDOP(afp) },
    { label: 'SFS patronal (7,09%)', value: fmtDOP(sfs) },
    { label: 'SRL riesgos laborales (~1,20%)', value: fmtDOP(srl) },
    { label: 'INFOTEP (1%)', value: fmtDOP(infotep) },
    ...(incluirProvisiones ? [
      { label: 'Provisión regalía (÷12)', value: fmtDOP(provisionRegalia) },
      { label: 'Provisión cesantía (21 d/año)', value: fmtDOP(provisionCesantia) },
    ] : []),
    { label: 'Costo total mensual', value: fmtDOP(costoTotal) },
  ];

  const _insight = {
    title: `Te cuesta ${fmtDOP(costoTotal)} al mes`,
    text: `Un empleado con salario bruto de **${fmtDOP(bruto)}** te cuesta **${fmtDOP(costoTotal)}** al mes: un **+${sobrecostoPct.toFixed(1)}%** en cargas sociales y provisiones.${incluirProvisiones ? '' : ' (Sin provisionar regalía ni cesantía.)'}`,
    tone: 'neutral' as const,
    icon: '🏢',
  };

  const _table = {
    title: 'Desglose del costo del empleado',
    headers: ['Concepto', 'Tasa', 'Monto mensual'],
    rows: [
      ['Salario bruto', '—', fmtDOP(bruto)],
      ['AFP patronal', '7,10%', fmtDOP(afp)],
      ['SFS patronal', '7,09%', fmtDOP(sfs)],
      ['SRL (riesgos laborales)', '~1,20%', fmtDOP(srl)],
      ['INFOTEP', '1,00%', fmtDOP(infotep)],
      ...(incluirProvisiones ? [
        ['Provisión regalía pascual', 'salario ÷ 12', fmtDOP(provisionRegalia)],
        ['Provisión cesantía', '21 días/año', fmtDOP(provisionCesantia)],
      ] : []),
      ['Costo total', `+${sobrecostoPct.toFixed(1)}%`, fmtDOP(costoTotal)],
    ],
    note: 'Aportes patronales topeados al salario cotizable máximo. La regalía y la cesantía son provisiones (gasto que se devenga en el año); la cesantía solo se desembolsa si el contrato termina por desahucio o despido injustificado.',
  };

  return {
    salarioBruto: Math.round(bruto * 100) / 100,
    afpPatronal: Math.round(afp * 100) / 100,
    sfsPatronal: Math.round(sfs * 100) / 100,
    srlPatronal: Math.round(srl * 100) / 100,
    infotep: Math.round(infotep * 100) / 100,
    provisionRegalia: Math.round(provisionRegalia * 100) / 100,
    provisionCesantia: Math.round(provisionCesantia * 100) / 100,
    cargasSociales: Math.round(cargasSociales * 100) / 100,
    costoTotal: Math.round(costoTotal * 100) / 100,
    sobrecostoPct: Math.round(sobrecostoPct * 100) / 100,
    formula,
    explicacion,
    _insight,
    _table,
    _steps,
  };
}
