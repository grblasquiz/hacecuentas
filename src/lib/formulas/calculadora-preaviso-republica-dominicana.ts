/**
 * Calculadora de preaviso laboral — República Dominicana 2026 (Art. 76, Ley 16-92).
 *   Preaviso = días según antigüedad × salario diario (sueldo ÷ 23,83).
 * Escala (helper preavisoDias): 3–6m → 7 días; 6m–1a → 14 días; +1a → 28 días.
 * Con menos de 3 meses: sin derecho.
 */
import {
  fmtDOP,
  salarioDiario,
  preavisoDias,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  anios: number;
  meses: number;
}

export interface Outputs {
  preaviso: number | string;
  dias: number;
  salarioDiarioRd: number;
  antiguedadMeses: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraPreavisoRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const anios = Math.max(0, Math.floor(Number(i.anios) || 0));
  const mesesExtra = Math.max(0, Math.min(11, Math.floor(Number(i.meses) || 0)));

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  const totalMeses = anios * 12 + mesesExtra;
  const diario = salarioDiario(salario);
  const dias = preavisoDias(totalMeses);
  const preaviso = dias * diario;

  let tramoTxt: string;
  if (totalMeses < 3) tramoTxt = 'menos de 3 meses (sin derecho a preaviso)';
  else if (totalMeses <= 6) tramoTxt = '3 a 6 meses: 7 días';
  else if (totalMeses <= 12) tramoTxt = '6 meses a 1 año: 14 días';
  else tramoTxt = 'más de 1 año: 28 días';

  const formula = `Preaviso = ${dias} días × ${fmtDOP(diario)} (salario diario = ${fmtDOP(salario)} ÷ 23,83) = ${fmtDOP(preaviso)}`;

  const explicacion =
    `Antigüedad: ${anios} año(s) y ${mesesExtra} mes(es) = ${totalMeses} meses (${tramoTxt}). ` +
    `Salario diario = ${fmtDOP(salario)} ÷ 23,83 = ${fmtDOP(diario)}. ` +
    (dias > 0
      ? `Preaviso = ${dias} días × ${fmtDOP(diario)} = ${fmtDOP(preaviso)}. Se paga en dinero cuando el empleador no concede el aviso anticipado.`
      : `Con menos de 3 meses de antigüedad no hay derecho a preaviso.`);

  const _insight = {
    title: dias > 0 ? `Tu preaviso es de ${fmtDOP(preaviso)}` : 'Sin derecho a preaviso',
    text:
      dias > 0
        ? `Con **${anios} año(s) y ${mesesExtra} mes(es)** te corresponden **${dias} días** de preaviso. A un salario diario de **${fmtDOP(diario)}**, son **${fmtDOP(preaviso)}**.`
        : `Con menos de **3 meses** de antigüedad el Art. 76 no reconoce preaviso.`,
    tone: (dias > 0 ? 'good' : 'warn') as 'good' | 'warn' | 'neutral',
    icon: '🇩🇴',
  };

  const _table = {
    title: 'Escala de preaviso (Art. 76) y tu caso',
    headers: ['Antigüedad', 'Días de preaviso', 'Tu caso'],
    align: ['left', 'right', 'center'],
    rows: [
      ['3 a 6 meses', '7 días', totalMeses > 3 && totalMeses <= 6 ? '✓' : ''],
      ['6 meses a 1 año', '14 días', totalMeses > 6 && totalMeses <= 12 ? '✓' : ''],
      ['Más de 1 año', '28 días', totalMeses > 12 ? '✓' : ''],
    ],
    footer: ['Tu preaviso', `${dias} días`, fmtDOP(preaviso)],
    note: 'Días de salario ordinario × salario diario (sueldo ÷ 23,83). Se paga si el empleador no da el aviso anticipado.',
  };

  return {
    preaviso: fmtDOP(preaviso) + ` · ${dias} días`,
    dias,
    salarioDiarioRd: Math.round(diario),
    antiguedadMeses: totalMeses,
    formula,
    explicacion,
    _insight,
    _table,
  };
}
