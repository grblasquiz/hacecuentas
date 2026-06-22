/**
 * Calculadora de auxilio de cesantía — República Dominicana 2026 (Art. 80, Ley 16-92).
 * Cesantía = días según antigüedad × salario diario (sueldo ÷ 23,83).
 * Escala (helper cesantiaDias): 3–6m → 6 días fijos; 6m–1a → 13 días fijos;
 * 1–5a → 21 días/año; +5a → 23 días/año.
 */
import {
  fmtDOP,
  salarioDiario,
  cesantiaDias,
} from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual: number;
  anios: number;
  meses: number;
}

export interface Outputs {
  cesantia: number | string;
  dias: number;
  salarioDiarioRd: number;
  antiguedadMeses: number;
  formula: string;
  explicacion: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraCesantiaRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual);
  const anios = Math.max(0, Math.floor(Number(i.anios) || 0));
  const mesesExtra = Math.max(0, Math.min(11, Math.floor(Number(i.meses) || 0)));

  if (!salario || salario <= 0) throw new Error('Ingresá tu salario mensual en RD$');

  const totalMeses = anios * 12 + mesesExtra;
  const diario = salarioDiario(salario);
  const dias = cesantiaDias(totalMeses);
  const cesantia = dias * diario;

  let tramoTxt: string;
  if (totalMeses < 3) tramoTxt = 'menos de 3 meses (sin derecho a cesantía)';
  else if (totalMeses <= 6) tramoTxt = '3 a 6 meses: 6 días fijos';
  else if (totalMeses <= 12) tramoTxt = '6 meses a 1 año: 13 días fijos';
  else if (totalMeses <= 60) tramoTxt = `1 a 5 años: 21 días por año (${anios} años)`;
  else tramoTxt = `más de 5 años: 23 días por año (${anios} años)`;

  const formula = `Cesantía = ${dias} días × ${fmtDOP(diario)} (salario diario = ${fmtDOP(salario)} ÷ 23,83) = ${fmtDOP(cesantia)}`;

  const explicacion =
    `Antigüedad: ${anios} año(s) y ${mesesExtra} mes(es) = ${totalMeses} meses (${tramoTxt}). ` +
    `Salario diario = ${fmtDOP(salario)} ÷ 23,83 = ${fmtDOP(diario)}. ` +
    (dias > 0
      ? `Cesantía = ${dias} días × ${fmtDOP(diario)} = ${fmtDOP(cesantia)}. La cesantía está exenta de ISR y no cotiza a la TSS.`
      : `Con menos de 3 meses de antigüedad no hay derecho a auxilio de cesantía.`);

  const _insight = {
    title: dias > 0 ? `Tu cesantía es de ${fmtDOP(cesantia)}` : 'Sin derecho a cesantía',
    text:
      dias > 0
        ? `Con **${anios} año(s) y ${mesesExtra} mes(es)** te corresponden **${dias} días** de cesantía. A un salario diario de **${fmtDOP(diario)}**, son **${fmtDOP(cesantia)}**, exentos de ISR y sin descuentos de TSS.`
        : `Con menos de **3 meses** de antigüedad el Art. 80 no reconoce auxilio de cesantía.`,
    tone: (dias > 0 ? 'good' : 'warn') as 'good' | 'warn' | 'neutral',
    icon: '🇩🇴',
  };

  const _table = {
    title: 'Escala de cesantía (Art. 80) y tu caso',
    headers: ['Antigüedad', 'Días de cesantía', 'Tu caso'],
    align: ['left', 'right', 'center'],
    rows: [
      ['3 a 6 meses', '6 días (fijo)', totalMeses > 3 && totalMeses <= 6 ? '✓' : ''],
      ['6 meses a 1 año', '13 días (fijo)', totalMeses > 6 && totalMeses <= 12 ? '✓' : ''],
      ['1 a 5 años', '21 días por año', totalMeses > 12 && totalMeses <= 60 ? '✓' : ''],
      ['Más de 5 años', '23 días por año', totalMeses > 60 ? '✓' : ''],
    ],
    footer: ['Tu cesantía', `${dias} días`, fmtDOP(cesantia)],
    note: 'Días de salario ordinario × salario diario (sueldo ÷ 23,83). Exenta de ISR y sin TSS.',
  };

  return {
    cesantia: fmtDOP(cesantia) + ` · ${dias} días`,
    dias,
    salarioDiarioRd: Math.round(diario),
    antiguedadMeses: totalMeses,
    formula,
    explicacion,
    _insight,
    _table,
  };
}
