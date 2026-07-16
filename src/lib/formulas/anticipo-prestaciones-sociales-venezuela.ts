/**
 * Anticipo de Prestaciones Sociales (hasta 75%) — Venezuela, LOTTT Art. 144.
 *
 * El trabajador puede solicitar un anticipo de HASTA el 75% de lo acreditado
 * en su garantía de prestaciones (para vivienda, salud, educación, etc.).
 *
 * Base = saldo acreditado de la GARANTÍA (LOTTT Art. 142, literal a-b):
 *   15 días de salario integral por trimestre completo
 *   + 2 días adicionales por año a partir del 2º año (acumulativos, tope 30 días).
 * Salario integral diario = salario normal diario + alícuota de utilidades +
 * alícuota de bono vacacional (prorrateadas sobre 360 días).
 *
 *   anticipoMaximo   = saldoGarantia × 0,75
 *   anticipoSolicitado = saldoGarantia × min(porcentaje, 75) / 100
 *
 * Constantes (días, tope, año comercial) desde venezuela-2026.ts (LOTTT).
 *
 * Fuente: LOTTT Art. 142 y 144.
 */
import { VENEZUELA_2026, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number;
  aniosAntiguedad?: number;
  mesesAntiguedad?: number;
  diasUtilidades?: number;      // días de utilidades de la empresa (mín. legal 30)
  diasBonoVacacional?: number;  // días de bono vacacional (mín. legal 15)
  porcentajeSolicitado?: number; // % solicitado (se topa en 75)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const l = VENEZUELA_2026.lottt;
  const p = l.prestaciones;
  const TOPE = 75; // % máximo de anticipo (Art. 144)

  const salarioMensual = Math.max(0, Number(i.salarioMensual) || 0);
  if (salarioMensual <= 0) throw new Error('Ingresá tu salario mensual');

  const aniosEnteros = Math.max(0, Math.floor(Number(i.aniosAntiguedad) || 0));
  const mesesExtra = Math.max(0, Math.min(11, Math.floor(Number(i.mesesAntiguedad) || 0)));
  const diasUtilidades = Math.max(0, Number(i.diasUtilidades ?? l.utilidadesDiasMin) || l.utilidadesDiasMin);
  const diasBonoVac = Math.max(0, Number(i.diasBonoVacacional ?? l.bonoVacacionalDiasBase) || l.bonoVacacionalDiasBase);
  const pctSolicitado = Math.max(0, Math.min(TOPE, Number(i.porcentajeSolicitado ?? TOPE) || TOPE));

  const DIAS_ANIO = l.diasAnioComercial; // 360

  // Salario integral diario (base de la garantía).
  const salarioDiarioNormal = salarioMensual / 30;
  const alicuotaUtilidades = (diasUtilidades * salarioDiarioNormal) / DIAS_ANIO;
  const alicuotaBonoVac = (diasBonoVac * salarioDiarioNormal) / DIAS_ANIO;
  const salarioDiarioIntegral = salarioDiarioNormal + alicuotaUtilidades + alicuotaBonoVac;

  // Saldo de la garantía acreditada: 15 días/trimestre + 2 días/año desde el 2º año (tope 30).
  const mesesTotales = aniosEnteros * 12 + mesesExtra;
  const trimestresCompletos = Math.floor(mesesTotales / 3);
  const diasGarantiaBase = p.garantiaDiasPorTrimestre * trimestresCompletos;
  let diasAdicionales = 0;
  for (let anio = 2; anio <= aniosEnteros; anio++) diasAdicionales += p.diasAdicionalesPorAnio;
  diasAdicionales = Math.min(diasAdicionales, p.diasAdicionalesMax);
  const diasGarantia = diasGarantiaBase + diasAdicionales;
  const saldoGarantia = diasGarantia * salarioDiarioIntegral;

  const anticipoMaximo = saldoGarantia * (TOPE / 100);
  const anticipoSolicitado = saldoGarantia * (pctSolicitado / 100);
  const saldoRestante = saldoGarantia - anticipoSolicitado;

  const narrativa =
    `Con ${aniosEnteros} año(s) y ${mesesExtra} mes(es) de antigüedad y un salario integral diario de ${fmtVES(salarioDiarioIntegral)}, ` +
    `tu garantía acreditada es ${fmtVES(saldoGarantia)} (${diasGarantia} días). ` +
    `El anticipo MÁXIMO legal es el 75%: ${fmtVES(anticipoMaximo)}.` +
    (pctSolicitado < TOPE ? ` Al ${pctSolicitado}% que pedís, el anticipo es ${fmtVES(anticipoSolicitado)} y te queda un saldo de ${fmtVES(saldoRestante)}.` : ` Si lo pedís completo, te queda un saldo de ${fmtVES(saldoRestante)}.`);

  return {
    anticipoMaximo: Number(anticipoMaximo.toFixed(2)),
    anticipoSolicitado: Number(anticipoSolicitado.toFixed(2)),
    saldoAcumulado: Number(saldoGarantia.toFixed(2)),
    saldoRestante: Number(saldoRestante.toFixed(2)),
    salarioDiarioIntegral: Number(salarioDiarioIntegral.toFixed(2)),
    diasGarantia,
    detalle: `Anticipo máximo (75%): ${fmtVES(anticipoMaximo)} sobre una garantía de ${fmtVES(saldoGarantia)} (${diasGarantia} días)`,
    _insight: { type: 'highlight', icon: '🏦', text: narrativa },
    _table: {
      title: 'Anticipo de prestaciones — hasta 75% de la garantía (Art. 144 LOTTT)',
      headers: ['Concepto', 'Valor'],
      rows: [
        ['Salario integral diario', fmtVES(salarioDiarioIntegral)],
        ['Días de garantía acreditados', `${diasGarantia} días`],
        ['Saldo de la garantía (100%)', fmtVES(saldoGarantia)],
        ['Anticipo máximo (75%)', fmtVES(anticipoMaximo)],
        [`Anticipo al ${pctSolicitado}% solicitado`, fmtVES(anticipoSolicitado)],
        ['Saldo que queda acreditado', fmtVES(saldoRestante)],
      ],
      note: 'La ley permite anticipar hasta el 75% de lo acreditado en la garantía de prestaciones (Art. 144). El salario integral incluye las alícuotas de utilidades y de bono vacacional. Es una estimación sobre la garantía trimestral; el saldo real puede incluir intereses acreditados por el patrono.',
    },
  };
}
