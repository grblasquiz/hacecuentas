/**
 * Regalía pascual PROPORCIONAL — República Dominicana 2026 (Art. 219 Cód. Trabajo).
 *
 * Para quien NO trabajó el año completo (entró o salió a mitad de año). La regalía
 * pascual ("doble sueldo" / salario de Navidad) es el salario ordinario devengado
 * entre enero y diciembre dividido ÷ 12. Si sólo se trabajó parte del año, el
 * devengado es menor y la regalía es proporcional:
 *
 *   devengado del período = salarioMensual × meses + salarioMensual × (días/23,83)
 *   regalía proporcional  = devengado ÷ 12
 *
 * Equivale a (salarioMensual ÷ 12) × meses-trabajados. EXENTA de ISR y NO cotiza
 * a TSS (Ley 87-01). Tope legal: 5 salarios mínimos. El divisor (12) y el tope
 * NO se hardcodean: vienen de REPUBLICA_DOMINICANA_2026.laboral.regaliaPascual.
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP, regaliaPascual, salarioDiario } from '../data/republica-dominicana-2026';

export interface Inputs {
  salarioMensual?: number; // salario ordinario mensual (RD$)
  meses?: number;          // meses completos trabajados en el año (0–12)
  dias?: number;           // días adicionales del mes incompleto (0–30)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function regaliaPascualProporcionalRepublicaDominicana(i: Inputs): Outputs {
  const salario = Number(i.salarioMensual) || 0;
  let meses = Math.max(0, Math.min(12, Number(i.meses) || 0));
  const dias = Math.max(0, Math.min(30, Number(i.dias) || 0));
  if (salario <= 0) throw new Error('Ingresá tu salario ordinario mensual en RD$');
  if (meses <= 0 && dias <= 0) throw new Error('Ingresá cuántos meses (o días) trabajaste en el año');

  const cfg = REPUBLICA_DOMINICANA_2026.laboral.regaliaPascual; // divisor 12, tope 5 SM

  // Devengado del período: meses completos + fracción de días (al divisor diario 23,83).
  const devengadoMeses = salario * meses;
  const devengadoDias = salarioDiario(salario) * dias;
  const devengado = devengadoMeses + devengadoDias;

  // Regalía proporcional = devengado ÷ 12 (helper de la data, no hardcode).
  let regalia = regaliaPascual(devengado);

  // Tope legal: 5 salarios mínimos (referencia: empresa grande no sectorizada).
  const smReferencia = REPUBLICA_DOMINICANA_2026.salarioMinimo.noSectorizado.grande;
  const tope = cfg.topeSalariosMinimos * smReferencia;
  const aplicaTope = regalia > tope;
  if (aplicaTope) regalia = tope;

  // Para contexto: cuánto sería la regalía FULL si hubiera trabajado los 12 meses.
  const regaliaFull = regaliaPascual(salario * 12); // = un salario mensual
  const mesesEquivalentes = meses + dias / REPUBLICA_DOMINICANA_2026.divisorDiario;

  const _table = {
    title: 'Cómo se arma tu regalía proporcional',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Salario mensual', fmtDOP(salario)],
      ['Período trabajado', `${meses} mes(es)${dias > 0 ? ` y ${dias} día(s)` : ''}`],
      ['Devengado del período', fmtDOP(devengado)],
      ['÷ 12', fmtDOP(devengado / 12)],
      ...(aplicaTope ? [['Tope legal (5 salarios mínimos)', fmtDOP(tope)] as [string, string]] : []),
      ['Regalía proporcional', fmtDOP(regalia)],
      ['Regalía si fuera año completo', fmtDOP(regaliaFull)],
    ],
    note: `La regalía proporcional equivale a (salario ÷ 12) × meses trabajados. Es EXENTA de ISR y no se le descuenta TSS. Quien trabaja el año completo cobra un salario entero (${fmtDOP(regaliaFull)}); vos trabajaste ~${mesesEquivalentes.toFixed(1)} meses.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '🎄',
    text:
      `Trabajaste **${meses} mes(es)${dias > 0 ? ` y ${dias} día(s)` : ''}** este año, así que te corresponde una regalía pascual proporcional de **${fmtDOP(regalia)}** ` +
      `(salario ÷ 12 × período = ${fmtDOP(salario)} ÷ 12 × ${mesesEquivalentes.toFixed(1)}). ` +
      (aplicaTope
        ? `Se aplicó el tope legal de 5 salarios mínimos (${fmtDOP(tope)}). `
        : '') +
      `Es **exenta de ISR y sin descuentos de TSS**: la cobrás completa. A diferencia de quien trabajó todo el año (que cobra un salario entero, ${fmtDOP(regaliaFull)}), la tuya es proporcional al tiempo trabajado.`,
  };

  return {
    regalia: fmtDOP(regalia),
    regaliaMonto: Math.round(regalia),
    devengado: Math.round(devengado),
    mesesEquivalentes: Number(mesesEquivalentes.toFixed(2)),
    detalle: `${fmtDOP(salario)} ÷ 12 × ${mesesEquivalentes.toFixed(1)} mes(es) = ${fmtDOP(regalia)} (exenta de ISR y TSS)`,
    _table,
    _insight,
  };
}
