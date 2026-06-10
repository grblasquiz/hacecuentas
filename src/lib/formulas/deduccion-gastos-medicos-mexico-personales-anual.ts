import { MEXICO_2026 } from '../data/mexico-2026';

export interface Inputs {
  ingresos_brutos_anual: number;
  gastos_hospitales: number;
  gastos_consultas: number;
  gastos_dentista: number;
  gastos_optica: number;
  gastos_psicologia: number;
  gastos_otros_medicos: number;
  tarifa_isr_marginal: number;
}

export interface Outputs {
  gasto_total_reportado: number;
  uma_anual_2026: number;
  limite_15_porciento_ingresos: number;
  deduccion_maxima_permitida: number;
  monto_deducible_real: number;
  ahorro_isr_estimado: number;
  porcentaje_gastos_sobre_ingresos: number;
  gastosno_deducibles: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Parámetro 2026 México — fuente única src/lib/data/mexico-2026.ts (UMA INEGI 2026).
  const UMA_2026 = MEXICO_2026.uma.anual; // UMA anual 2026 = $42.794,64
  const LIMITE_5_UMA = UMA_2026 * MEXICO_2026.deduccionesPersonales.topeUmasAnuales; // 5 UMA = $213.973,20 (Art. 151 LISR)
  const PORCENTAJE_LIMITE = MEXICO_2026.deduccionesPersonales.topePorcentajeIngresos; // 15% ingresos brutos

  // Validación de inputs
  const ingresos = Math.max(0, i.ingresos_brutos_anual || 0);
  const tarifa = Math.max(0, Math.min(100, i.tarifa_isr_marginal || 0)) / 100;

  // Total gastos reportados (suma todos los conceptos)
  const gasto_total_reportado = (
    (i.gastos_hospitales || 0) +
    (i.gastos_consultas || 0) +
    (i.gastos_dentista || 0) +
    (i.gastos_optica || 0) +
    (i.gastos_psicologia || 0) +
    (i.gastos_otros_medicos || 0)
  );

  // Límite alternativo: 15% de ingresos brutos
  const limite_15_porciento_ingresos = ingresos * PORCENTAJE_LIMITE;

  // Deducción máxima permitida = MIN(5 UMA, 15% ingresos)
  // Artículo 176 LISR: aplica el menor de ambos límites
  const deduccion_maxima_permitida = Math.min(
    LIMITE_5_UMA,
    limite_15_porciento_ingresos
  );

  // Monto deducible real = MIN(gastos reportados, deducción máxima permitida)
  const monto_deducible_real = Math.min(
    gasto_total_reportado,
    deduccion_maxima_permitida
  );

  // Ahorro ISR estimado = monto deducible × tarifa marginal ISR
  // Formula: Ahorro = Deducción × Tarifa % (reduce base gravable)
  const ahorro_isr_estimado = monto_deducible_real * tarifa;

  // Gastos como % de ingresos brutos (para análisis)
  const porcentaje_gastos_sobre_ingresos = ingresos > 0
    ? (gasto_total_reportado / ingresos) * 100
    : 0;

  // Gastos excedentes (no deducibles en ese año fiscal)
  const gastosno_deducibles = Math.max(
    0,
    gasto_total_reportado - monto_deducible_real
  );

  const fmtMx = (n: number) => '$' + Math.round(n).toLocaleString('es-MX') + ' MXN';
  const topeQueAplica = LIMITE_5_UMA <= limite_15_porciento_ingresos ? '5 UMA' : '15% de tus ingresos';

  let _insight: any;
  if (gasto_total_reportado <= 0) {
    _insight = {
      title: 'Cargá tus gastos médicos',
      text: 'Todavía no ingresaste gastos médicos deducibles. Sumá hospitales, consultas, dentista y demás para ver cuánto podés bajar de tu ISR anual.',
      tone: 'neutral',
      icon: '🩺',
    };
  } else if (gastosno_deducibles > 0) {
    _insight = {
      title: 'Topaste el límite deducible',
      text: `De **${fmtMx(gasto_total_reportado)}** en gastos, solo **${fmtMx(monto_deducible_real)}** son deducibles (tope: ${topeQueAplica}). Los **${fmtMx(gastosno_deducibles)}** restantes no bajan tu ISR este año, pero igual te ahorrás unos **${fmtMx(ahorro_isr_estimado)}** de impuesto.`,
      tone: 'warn',
      icon: '🩺',
    };
  } else {
    _insight = {
      title: 'Todos tus gastos son deducibles',
      text: `Tus **${fmtMx(gasto_total_reportado)}** en gastos médicos entran completos dentro del límite, así que reducís tu ISR en aproximadamente **${fmtMx(ahorro_isr_estimado)}** al presentar tu declaración anual.`,
      tone: 'good',
      icon: '🩺',
    };
  }

  let _chart: any;
  if (gasto_total_reportado > 0) {
    const slices = [{ label: 'Deducible', value: Math.round(monto_deducible_real * 100) / 100 }];
    if (gastosno_deducibles > 0) slices.push({ label: 'No deducible (excede tope)', value: Math.round(gastosno_deducibles * 100) / 100 });
    if (slices.length >= 2) {
      _chart = {
        type: 'doughnut',
        slices,
        prefix: '$',
        centerValue: fmtMx(gasto_total_reportado),
        centerLabel: 'Gasto total',
        ariaLabel: 'Parte deducible vs no deducible de tus gastos médicos anuales',
      };
    }
  }

  return {
    gasto_total_reportado: Math.round(gasto_total_reportado * 100) / 100,
    uma_anual_2026: Math.round(LIMITE_5_UMA * 100) / 100,
    limite_15_porciento_ingresos: Math.round(limite_15_porciento_ingresos * 100) / 100,
    deduccion_maxima_permitida: Math.round(deduccion_maxima_permitida * 100) / 100,
    monto_deducible_real: Math.round(monto_deducible_real * 100) / 100,
    ahorro_isr_estimado: Math.round(ahorro_isr_estimado * 100) / 100,
    porcentaje_gastos_sobre_ingresos: Math.round(porcentaje_gastos_sobre_ingresos * 100) / 100,
    gastosno_deducibles: Math.round(gastosno_deducibles * 100) / 100,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
