/** Finiquito México — cálculo completo según LFT
 *  Incluye: salarios pendientes, aguinaldo proporcional, vacaciones no gozadas,
 *  prima vacacional, prima de antigüedad (si aplica)
 *  Constantes (UMA, SM 2026): fuente única src/lib/data/mexico-2026.ts
 */
import { MEXICO_2026 } from '../data/mexico-2026';

export interface Inputs {
  salarioDiario: number;
  fechaIngreso: string;
  fechaBaja: string;
  diasAguinaldo: number;
  diasVacaciones: number;
  primaVacacionalPorc: number;
  causaBaja: string;
}

export interface Outputs {
  salariosPendientes: number;
  aguinaldoProporcional: number;
  vacacionesProporcionales: number;
  primaVacacional: number;
  primaAntiguedad: number;
  indemnizacion3meses: number;
  totalBruto: number;
  isrEstimado: number;
  totalNeto: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function finiquitoMexicoCalculo(i: Inputs): Outputs {
  const salarioDiario = Number(i.salarioDiario);
  const diasAguinaldo = Number(i.diasAguinaldo) || 15;
  const diasVac = Number(i.diasVacaciones) || 12;
  const primaVacPorc = Number(i.primaVacacionalPorc) || 25;
  const causa = String(i.causaBaja || 'renuncia');

  if (!salarioDiario || salarioDiario <= 0) throw new Error('Ingresá tu salario diario');

  // Calcular antigüedad
  const fIngreso = i.fechaIngreso ? new Date(i.fechaIngreso) : new Date(Date.now() - 365 * 86400000);
  const fBaja = i.fechaBaja ? new Date(i.fechaBaja) : new Date();
  const diasTrabajados = Math.max(1, Math.round((fBaja.getTime() - fIngreso.getTime()) / 86400000));
  const aniosAntiguedad = diasTrabajados / 365;

  // Salarios pendientes (estimamos últimos 15 días)
  const diasUltimoPeriodo = Math.min(15, diasTrabajados);
  const salariosPendientes = salarioDiario * diasUltimoPeriodo;

  // Aguinaldo proporcional
  const diasAnioActual = Math.min(365, diasTrabajados % 365 || diasTrabajados);
  const aguinaldoProporcional = salarioDiario * diasAguinaldo * (diasAnioActual / 365);

  // Vacaciones proporcionales (días de vacaciones según antigüedad)
  const vacacionesProporcionales = salarioDiario * diasVac * (diasAnioActual / 365);

  // Prima vacacional (25% de vacaciones)
  const primaVacacional = vacacionesProporcionales * (primaVacPorc / 100);

  // Prima de antigüedad: 12 días de salario por año (tope 2 salarios mínimos)
  // Solo aplica en despido o renuncia con >15 años
  const salarioMinimoDiario = MEXICO_2026.salarioMinimo.generalDiario; // SMG 2026 = $315,04 (CONASAMI/DOF)
  const salarioTopePrima = Math.min(salarioDiario, salarioMinimoDiario * 2);
  let primaAntiguedad = 0;
  if (causa === 'despido' || (causa === 'renuncia' && aniosAntiguedad >= 15)) {
    primaAntiguedad = 12 * salarioTopePrima * Math.floor(aniosAntiguedad);
  }

  // Indemnización 3 meses (solo despido injustificado)
  let indemnizacion3meses = 0;
  if (causa === 'despido') {
    indemnizacion3meses = salarioDiario * 90;

    // 20 días por año (Art. 50 LFT) — se suma a la indemnización
    indemnizacion3meses += salarioDiario * 20 * Math.floor(aniosAntiguedad);
  }

  const totalBruto = salariosPendientes + aguinaldoProporcional + vacacionesProporcionales +
    primaVacacional + primaAntiguedad + indemnizacion3meses;

  // ISR estimado simplificado (15% promedio efectivo sobre lo que no está exento)
  // Exento: indemnización hasta 90 UMA por año, prima antigüedad, etc.
  const UMA_DIARIO = MEXICO_2026.uma.diaria; // UMA diaria 2026 = $117,31 (INEGI)
  const exentoIndem = Math.min(indemnizacion3meses, 90 * UMA_DIARIO * Math.max(1, Math.floor(aniosAntiguedad)));
  const gravable = totalBruto - exentoIndem - primaAntiguedad;
  const isrEstimado = Math.max(0, gravable * 0.15);
  const totalNeto = totalBruto - isrEstimado;

  const tipoStr = causa === 'despido' ? 'Liquidación (despido injustificado)' : 'Finiquito (renuncia voluntaria)';
  const formula = `${tipoStr}: salarios + aguinaldo + vac + prima${causa === 'despido' ? ' + 3 meses + 20d/año + prima ant.' : ''} = $${Math.round(totalBruto).toLocaleString('es-MX')}`;
  const explicacion = `${tipoStr} con ${aniosAntiguedad.toFixed(1)} años de antigüedad y salario diario de $${salarioDiario.toLocaleString('es-MX')}. Desglose: salarios pendientes $${Math.round(salariosPendientes).toLocaleString('es-MX')}, aguinaldo proporcional $${Math.round(aguinaldoProporcional).toLocaleString('es-MX')}, vacaciones $${Math.round(vacacionesProporcionales).toLocaleString('es-MX')}, prima vacacional $${Math.round(primaVacacional).toLocaleString('es-MX')}${primaAntiguedad > 0 ? `, prima antigüedad $${Math.round(primaAntiguedad).toLocaleString('es-MX')}` : ''}${indemnizacion3meses > 0 ? `, indemnización $${Math.round(indemnizacion3meses).toLocaleString('es-MX')}` : ''}. Total bruto: $${Math.round(totalBruto).toLocaleString('es-MX')}. ISR estimado: $${Math.round(isrEstimado).toLocaleString('es-MX')}. Neto: $${Math.round(totalNeto).toLocaleString('es-MX')} MXN.`;

  const slices = [
    { label: 'Salarios pendientes', value: Math.round(salariosPendientes) },
    { label: 'Aguinaldo proporcional', value: Math.round(aguinaldoProporcional) },
    { label: 'Vacaciones', value: Math.round(vacacionesProporcionales) },
    { label: 'Prima vacacional', value: Math.round(primaVacacional) },
  ];
  if (primaAntiguedad > 0) slices.push({ label: 'Prima de antigüedad', value: Math.round(primaAntiguedad) });
  if (indemnizacion3meses > 0) slices.push({ label: 'Indemnización', value: Math.round(indemnizacion3meses) });
  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + Math.round(totalBruto).toLocaleString('es-MX'),
    centerLabel: 'Total bruto',
    ariaLabel: 'Composición del finiquito: salarios, aguinaldo, vacaciones, prima vacacional y conceptos por despido',
  };

  const isrPct = totalBruto > 0 ? (isrEstimado / totalBruto) * 100 : 0;
  const indemPct = totalBruto > 0 ? (indemnizacion3meses / totalBruto) * 100 : 0;
  const insightTone = causa === 'despido' ? 'good' : 'neutral';
  const insightText = causa === 'despido'
    ? `Como fue **despido injustificado** te corresponde indemnización: **$${Math.round(indemnizacion3meses).toLocaleString('es-MX')}** (${indemPct.toFixed(0)}% del bruto). Tras un ISR estimado de **$${Math.round(isrEstimado).toLocaleString('es-MX')}** (${isrPct.toFixed(0)}%), cobrás neto **$${Math.round(totalNeto).toLocaleString('es-MX')}** MXN.`
    : `Por **renuncia voluntaria** cobrás finiquito (salarios, aguinaldo y vacaciones proporcionales), sin indemnización. Bruto **$${Math.round(totalBruto).toLocaleString('es-MX')}**, menos ISR estimado **$${Math.round(isrEstimado).toLocaleString('es-MX')}** (${isrPct.toFixed(0)}%) = neto **$${Math.round(totalNeto).toLocaleString('es-MX')}** MXN.`;
  const insight = {
    title: `Neto estimado: $${Math.round(totalNeto).toLocaleString('es-MX')} MXN`,
    text: insightText,
    tone: insightTone,
    icon: '💼',
  };

  return {
    salariosPendientes: Math.round(salariosPendientes),
    aguinaldoProporcional: Math.round(aguinaldoProporcional),
    vacacionesProporcionales: Math.round(vacacionesProporcionales),
    primaVacacional: Math.round(primaVacacional),
    primaAntiguedad: Math.round(primaAntiguedad),
    indemnizacion3meses: Math.round(indemnizacion3meses),
    totalBruto: Math.round(totalBruto),
    isrEstimado: Math.round(isrEstimado),
    totalNeto: Math.round(totalNeto),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
