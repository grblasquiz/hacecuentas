/** Finiquito vs Liquidación — comparador México 2026 (LFT).
 *
 *  Finiquito (renuncia / fin de relación sin despido injustificado): partes
 *  proporcionales devengadas → aguinaldo proporcional (Art. 87), vacaciones
 *  pendientes + prima vacacional 25% (Art. 80).
 *
 *  Liquidación (despido injustificado): finiquito + indemnización constitucional
 *  de 3 meses (Art. 48), 20 días por año (Art. 50-II) y prima de antigüedad de
 *  12 días por año topada a 2× salario mínimo (Arts. 162 y 486).
 *
 *  Salario mínimo y prestaciones LFT: fuente única src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026 } from '../data/mexico-2026';

export interface Inputs {
  salarioDiario: number;
  anios: number;
  diasVacacionesPendientes: number;
  diasTrabajadosAnio: number;
}

export interface Outputs {
  finiquito: number;
  liquidacion: number;
  diferencia: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function finiquitoVsLiquidacionComparadorMexico(i: Inputs): Outputs {
  const sd = Number(i.salarioDiario);
  const anios = Math.max(0, Number(i.anios) || 0);
  const diasVac = Math.max(0, Number(i.diasVacacionesPendientes) || 0);
  const diasTrab = Math.max(0, Math.min(366, Number(i.diasTrabajadosAnio) || 365));

  if (!sd || sd <= 0) throw new Error('Ingresá tu salario diario');

  const { lft, salarioMinimo } = MEXICO_2026;

  // ── Partes proporcionales devengadas (van en ambos casos) ──
  const aguinaldoProp = sd * lft.aguinaldoDiasMinimo * (diasTrab / 365); // 15 días (Art. 87)
  const vacacionesProp = sd * diasVac;                                    // días no gozados
  const primaVacProp = sd * diasVac * lft.primaVacacional;                // 25% (Art. 80)
  const finiquito = aguinaldoProp + vacacionesProp + primaVacProp;

  // ── Conceptos extra del despido injustificado ──
  const indem3 = sd * 90 * (lft.indemnizacion.mesesConstitucionales / 3); // 3 meses ≈ 90 días (Art. 48)
  const veinte = sd * lft.indemnizacion.diasPorAnio20 * anios;            // 20 días/año (Art. 50-II)
  // Prima de antigüedad: 12 días/año, salario base topado a 2× salario mínimo (Arts. 162 y 486).
  const salarioPrimaAntig = Math.min(sd, salarioMinimo.generalDiario * lft.primaAntiguedad.topeSalarioVecesSm);
  const primaAntig = salarioPrimaAntig * lft.primaAntiguedad.diasPorAnio * anios;

  const liquidacion = finiquito + indem3 + veinte + primaAntig;
  const diferencia = liquidacion - finiquito;

  const formula = `Finiquito = $${Math.round(finiquito).toLocaleString('es-MX')} (aguinaldo prop. + vacaciones + prima vac.). Liquidación = finiquito + 3 meses ($${Math.round(indem3).toLocaleString('es-MX')}) + 20 días/año ($${Math.round(veinte).toLocaleString('es-MX')}) + prima antigüedad ($${Math.round(primaAntig).toLocaleString('es-MX')}) = $${Math.round(liquidacion).toLocaleString('es-MX')}.`;
  const explicacion = `Con salario diario de $${sd.toLocaleString('es-MX')} y ${anios} año(s) de antigüedad: si renunciás cobrás el finiquito ($${Math.round(finiquito).toLocaleString('es-MX')} MXN), que son sólo las partes proporcionales que ya devengaste. Si te despiden de forma injustificada, cobrás la liquidación ($${Math.round(liquidacion).toLocaleString('es-MX')} MXN): suma 3 meses de indemnización, 20 días por año y la prima de antigüedad (12 días/año, salario topado a 2 salarios mínimos). La diferencia entre ambos escenarios es de $${Math.round(diferencia).toLocaleString('es-MX')} MXN.`;

  const chart = {
    type: 'bar' as const,
    bars: [
      { label: 'Finiquito (renuncia)', value: Math.round(finiquito) },
      { label: 'Liquidación (despido)', value: Math.round(liquidacion) },
    ],
    prefix: '$',
    ariaLabel: `Comparativo: finiquito ${Math.round(finiquito)} vs liquidación ${Math.round(liquidacion)} pesos.`,
  };

  const insight = {
    title: 'La diferencia la marca el motivo de la salida',
    text: `Si **renunciás** cobrás **$${Math.round(finiquito).toLocaleString('es-MX')}** (sólo lo devengado). Si te **despiden injustificadamente** cobrás **$${Math.round(liquidacion).toLocaleString('es-MX')}**: **$${Math.round(diferencia).toLocaleString('es-MX')} más**, por la indemnización de 3 meses + 20 días/año + prima de antigüedad.`,
    tone: 'good' as const,
    icon: '⚖️',
  };

  return {
    finiquito: Math.round(finiquito * 100) / 100,
    liquidacion: Math.round(liquidacion * 100) / 100,
    diferencia: Math.round(diferencia * 100) / 100,
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
