/**
 * Calculadora de Finiquito por Despido Injustificado (México)
 *
 * Según la Ley Federal del Trabajo (LFT), Art. 48, 50 y 162:
 *   - Indemnización constitucional: 3 meses de salario integrado
 *   - Prima de antigüedad: 12 días por año trabajado (tope: 2 × SMG del área geográfica)
 *   - Indemnización 20 días por año de servicio (Art. 50 fracción II)
 *   - Salarios caídos/vencidos: hasta 12 meses (Art. 48 reforma 2012)
 *   - Partes proporcionales: aguinaldo, vacaciones, prima vacacional
 *
 * Salario mínimo general 2026: $315.04 MXN/día (zona general, CONASAMI/DOF)
 * UMA 2026: $117.31 MXN/día (INEGI)
 * Constantes: fuente única src/lib/data/mexico-2026.ts
 */
import { MEXICO_2026 } from '../data/mexico-2026';

export interface FiniquitoDespidoInjustificadoMxInputs {
  salarioDiarioIntegrado: number; // salario diario incluyendo prestaciones (aguinaldo, prima vac, etc)
  anosTrabajados: number;
  mesesExtra: number; // 0-11
  diasVacacionesPendientes: number; // del año en curso
  diasAguinaldoPendientes: number; // del año en curso
  salarioMinimoZona: number; // SMG de la zona geográfica (default $315.04 MXN 2026)
}

export interface FiniquitoDespidoInjustificadoMxOutputs {
  indemnizacion3Meses: string;
  primaAntiguedad: string;
  indemnizacion20Dias: string;
  aguinaldoProporcional: string;
  vacacionesPendientes: string;
  primaVacacional: string;
  totalBruto: string;
  topePrimaAplicado: string;
  anosComputables: string;
  _insight?: any;
  _chart?: any;
}

const fmt = (n: number) =>
  '$' +
  n.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export function finiquitoDespidoInjustificadoMexico(
  i: FiniquitoDespidoInjustificadoMxInputs
): FiniquitoDespidoInjustificadoMxOutputs {
  const salario = Number(i.salarioDiarioIntegrado);
  const anos = Math.max(0, Number(i.anosTrabajados) || 0);
  const meses = Math.max(0, Math.min(11, Number(i.mesesExtra) || 0));
  const diasVac = Math.max(0, Number(i.diasVacacionesPendientes) || 0);
  const diasAgu = Math.max(0, Number(i.diasAguinaldoPendientes) || 0);
  const smg = Math.max(1, Number(i.salarioMinimoZona) || MEXICO_2026.salarioMinimo.generalDiario);

  if (!salario || salario <= 0) {
    throw new Error('Ingresá el salario diario integrado (SDI)');
  }
  if (anos === 0 && meses === 0) {
    throw new Error('Ingresá la antigüedad en la empresa');
  }

  // Fracción mayor a 6 meses = 1 año para prima de antigüedad (LFT Art. 162 fracc III)
  const anosComputables = meses >= 6 ? anos + 1 : anos;

  // 1) Indemnización constitucional: 3 meses salario integrado (≈ 90 días)
  const indemnizacion3Meses = salario * 90;

  // 2) Prima de antigüedad: 12 días por año, tope 2 × SMG del área
  const tope2Smg = smg * 2;
  const salarioPrima = Math.min(salario, tope2Smg);
  const topePrimaAplicado = salario > tope2Smg;
  const primaAntiguedad = salarioPrima * 12 * anosComputables;

  // 3) Indemnización 20 días por año (Art. 50 fracc II)
  const indemnizacion20Dias = salario * 20 * anosComputables;

  // 4) Aguinaldo proporcional (mínimo 15 días por año, proporcional a días pendientes)
  const aguinaldoProporcional = salario * diasAgu;

  // 5) Vacaciones pendientes (días × salario)
  const vacacionesPendientes = salario * diasVac;

  // 6) Prima vacacional: 25% sobre vacaciones (LFT Art. 80)
  const primaVacacional = vacacionesPendientes * 0.25;

  const totalBruto =
    indemnizacion3Meses +
    primaAntiguedad +
    indemnizacion20Dias +
    aguinaldoProporcional +
    vacacionesPendientes +
    primaVacacional;

  // --- Insight: el indemnizatorio (3 meses + 20 días) suele dominar ---
  const indemnizatorio = indemnizacion3Meses + indemnizacion20Dias + primaAntiguedad;
  const pctIndem = totalBruto > 0 ? Math.round((indemnizatorio / totalBruto) * 100) : 0;
  const _insight = {
    title: 'Despido injustificado: pesa la indemnización',
    text: `Con **${anosComputables} ${anosComputables === 1 ? 'año' : 'años'}** computables, el bloque indemnizatorio (3 meses + 20 días/año + prima de antigüedad) suma **${fmt(indemnizatorio)}**, el **${pctIndem}%** de un total bruto de **${fmt(totalBruto)}**.`,
    tone: 'good',
    icon: '💼',
  };

  // --- Gráfico donut: composición del finiquito ---
  const _chartSlices = [
    { label: 'Indemniz. 3 meses', value: Math.round(indemnizacion3Meses * 100) / 100 },
    { label: '20 días/año', value: Math.round(indemnizacion20Dias * 100) / 100 },
    { label: 'Prima antigüedad', value: Math.round(primaAntiguedad * 100) / 100 },
    { label: 'Aguinaldo prop.', value: Math.round(aguinaldoProporcional * 100) / 100 },
    { label: 'Vacaciones', value: Math.round(vacacionesPendientes * 100) / 100 },
    { label: 'Prima vacacional', value: Math.round(primaVacacional * 100) / 100 },
  ].filter((s) => s.value > 0);

  const _chart = {
    type: 'doughnut',
    slices: _chartSlices,
    prefix: '$',
    centerValue: fmt(totalBruto),
    centerLabel: 'Total bruto',
    ariaLabel: 'Composición del finiquito por despido injustificado en México',
  };

  return {
    indemnizacion3Meses: fmt(indemnizacion3Meses),
    primaAntiguedad: fmt(primaAntiguedad),
    indemnizacion20Dias: fmt(indemnizacion20Dias),
    aguinaldoProporcional: fmt(aguinaldoProporcional),
    vacacionesPendientes: fmt(vacacionesPendientes),
    primaVacacional: fmt(primaVacacional),
    totalBruto: fmt(totalBruto),
    topePrimaAplicado: topePrimaAplicado
      ? `Sí — se aplicó tope 2 × SMG ($${tope2Smg.toFixed(2)}) para prima de antigüedad`
      : 'No — salario debajo del tope de 2 × SMG',
    anosComputables: `${anosComputables} ${anosComputables === 1 ? 'año' : 'años'}`,
    _insight,
    _chart,
  };
}
